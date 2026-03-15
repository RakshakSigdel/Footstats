import { PrismaClient } from "@prisma/client";
import NotificationService from "./notificationService.js";
const prisma = new PrismaClient();

class MatchEventService {
  /**
   * Create a new match event (goal, card, substitution)
   */
  static async createMatchEvent(data) {
    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { matchId: Number(data.matchId) },
      include: { schedule: true },
    });

    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    // Block adding events before the scheduled match start time
    const scheduledDate = match.schedule?.date;
    if (scheduledDate && new Date(scheduledDate) > new Date()) {
      throw {
        status: 400,
        message: "Match events can only be added once the match has started (scheduled time must have passed)",
      };
    }

    // Verify user is in the lineup for this match
    const userInLineup = await prisma.matchLineup.findFirst({
      where: {
        matchId: Number(data.matchId),
        userId: Number(data.userId),
      },
    });

    if (!userInLineup) {
      throw { status: 400, message: "User is not in the match lineup" };
    }

    // Verify club is one of the teams in the match
    const schedule = match.schedule;
    if (
      Number(data.clubId) !== schedule.teamOneId &&
      Number(data.clubId) !== schedule.teamTwoId
    ) {
      throw { status: 400, message: "Club is not part of this match" };
    }

    // Validate minute is within valid range
    if (data.minute < 0 || data.minute > 120) {
      throw { status: 400, message: "Minute must be between 0 and 120" };
    }

    // If it's a goal with an assist, verify assist player is in lineup
    if (data.eventType === "GOAL" && data.assistById) {
      const assistInLineup = await prisma.matchLineup.findFirst({
        where: {
          matchId: Number(data.matchId),
          userId: Number(data.assistById),
        },
      });

      if (!assistInLineup) {
        throw { status: 400, message: "Assist player is not in the match lineup" };
      }
    }

    const matchEvent = await prisma.matchEvent.create({
      data: {
        matchId: Number(data.matchId),
        userId: Number(data.userId),
        clubId: Number(data.clubId),
        eventType: data.eventType,
        minute: Number(data.minute),
        assistById: data.assistById ? Number(data.assistById) : null,
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        assistBy: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
    });

    const recipients = [Number(data.userId)];
    if (data.assistById) recipients.push(Number(data.assistById));

    await NotificationService.createBulkNotifications(recipients, {
      type: "MATCH_EVENT_ADDED",
      title: "Match stat updated",
      message: `A ${data.eventType.replace("_", " ").toLowerCase()} event was recorded for your match activity.`,
      link: `/schedule/${schedule.scheduleId}`,
      data: {
        matchId: Number(data.matchId),
        matchEventId: matchEvent.matchEventId,
        eventType: data.eventType,
      },
    });

    // If it's a goal, update the match score
    if (data.eventType === "GOAL") {
      const isTeamOne = Number(data.clubId) === schedule.teamOneId;
      await prisma.match.update({
        where: { matchId: Number(data.matchId) },
        data: isTeamOne
          ? { teamOneGoals: { increment: 1 } }
          : { teamTwoGoals: { increment: 1 } },
      });
    }

    return matchEvent;
  }

  /**
   * Get all events for a match
   */
  static async getMatchEvents(matchId) {
    const events = await prisma.matchEvent.findMany({
      where: { matchId: Number(matchId) },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        assistBy: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
      orderBy: { minute: "asc" },
    });
    return events;
  }

  /**
   * Get a specific match event by ID
   */
  static async getMatchEventById(eventId) {
    const event = await prisma.matchEvent.findUnique({
      where: { matchEventId: Number(eventId) },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        assistBy: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
        match: {
          include: {
            schedule: true,
          },
        },
      },
    });
    return event;
  }

  /**
   * Update a match event
   */
  static async updateMatchEvent(eventId, data) {
    const existingEvent = await prisma.matchEvent.findUnique({
      where: { matchEventId: Number(eventId) },
      include: {
        match: {
          include: { schedule: true },
        },
      },
    });

    if (!existingEvent) {
      throw { status: 404, message: "Match event not found" };
    }

    // If changing event type from GOAL to something else, decrement score
    if (existingEvent.eventType === "GOAL" && data.eventType && data.eventType !== "GOAL") {
      const schedule = existingEvent.match.schedule;
      const isTeamOne = existingEvent.clubId === schedule.teamOneId;
      await prisma.match.update({
        where: { matchId: existingEvent.matchId },
        data: isTeamOne
          ? { teamOneGoals: { decrement: 1 } }
          : { teamTwoGoals: { decrement: 1 } },
      });
    }

    // If changing event type to GOAL from something else, increment score
    if (existingEvent.eventType !== "GOAL" && data.eventType === "GOAL") {
      const schedule = existingEvent.match.schedule;
      const clubId = data.clubId ? Number(data.clubId) : existingEvent.clubId;
      const isTeamOne = clubId === schedule.teamOneId;
      await prisma.match.update({
        where: { matchId: existingEvent.matchId },
        data: isTeamOne
          ? { teamOneGoals: { increment: 1 } }
          : { teamTwoGoals: { increment: 1 } },
      });
    }

    const updatedEvent = await prisma.matchEvent.update({
      where: { matchEventId: Number(eventId) },
      data: {
        ...(data.eventType && { eventType: data.eventType }),
        ...(data.minute !== undefined && { minute: Number(data.minute) }),
        ...(data.assistById !== undefined && {
          assistById: data.assistById ? Number(data.assistById) : null,
        }),
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        assistBy: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        club: {
          select: {
            clubId: true,
            name: true,
          },
        },
      },
    });

    return updatedEvent;
  }

  /**
   * Delete a match event
   */
  static async deleteMatchEvent(eventId) {
    const event = await prisma.matchEvent.findUnique({
      where: { matchEventId: Number(eventId) },
      include: {
        match: {
          include: { schedule: true },
        },
      },
    });

    if (!event) {
      throw { status: 404, message: "Match event not found" };
    }

    // If deleting a goal, decrement the score
    if (event.eventType === "GOAL") {
      const schedule = event.match.schedule;
      const isTeamOne = event.clubId === schedule.teamOneId;
      await prisma.match.update({
        where: { matchId: event.matchId },
        data: isTeamOne
          ? { teamOneGoals: { decrement: 1 } }
          : { teamTwoGoals: { decrement: 1 } },
      });
    }

    const deletedEvent = await prisma.matchEvent.delete({
      where: { matchEventId: Number(eventId) },
    });

    return deletedEvent;
  }
}

export default MatchEventService;
