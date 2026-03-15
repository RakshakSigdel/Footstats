import { PrismaClient } from "@prisma/client";
import NotificationService from "./notificationService.js";

const prisma = new PrismaClient();

const STATUS_MAP = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  FINISHED: "FINISHED",
  COMPLETED: "FINISHED",
  CANCELLED: "CANCELLED",
};

const FORMAT_MAP = {
  KNOCKOUT: "KNOCKOUT",
  "ROUND ROBIN": "LEAGUE",
  ROUND_ROBIN: "LEAGUE",
  LEAGUE: "LEAGUE",
};

const normalizeEnumValue = (value, map, fallback) => {
  if (!value) return fallback;
  const key = String(value).trim().toUpperCase();
  return map[key] || fallback;
};

const isClubAdmin = async (userId, clubId) => {
  const club = await prisma.club.findUnique({
    where: { clubId: Number(clubId) },
    select: { clubId: true, createdBy: true },
  });

  if (!club) {
    throw new Error("Club not found");
  }

  if (club.createdBy === userId) {
    return true;
  }

  const membership = await prisma.userClub.findUnique({
    where: {
      userId_clubId: {
        userId,
        clubId: Number(clubId),
      },
    },
    select: { role: true },
  });

  return membership?.role === "ADMIN";
};

class TournamentService {
  static async createTournament(data, userId) {
    const tournament = await prisma.$transaction(async (tx) => {
      const created = await tx.tournament.create({
        data: {
          name: data.name,
          description: data.description,
          location: data.location,
          logo: data.logo || null,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          format: normalizeEnumValue(data.format, FORMAT_MAP, "KNOCKOUT"),
          entryFee: Number(data.entryFee || 0),
          createdBy: userId,
          status: normalizeEnumValue(data.status, STATUS_MAP, "UPCOMING"),
          paymentInstructions: data.paymentInstructions || null,
        },
      });

      await tx.tournamentAdmin.upsert({
        where: {
          tournamentId_userId: {
            tournamentId: created.tournamentId,
            userId,
          },
        },
        update: {},
        create: {
          tournamentId: created.tournamentId,
          userId,
        },
      });

      return created;
    });

    return tournament;
  }

  static async getAllTournaments() {
    const tournaments = await prisma.tournament.findMany({
      include: {
        creator: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        registrations: {
          where: { status: "ACCEPTED" },
          select: { clubId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tournaments.map((t) => ({
      ...t,
      acceptedClubCount: t.registrations.length,
    }));
  }

  static async getTournamentById(tournamentId) {
    const id = Number(tournamentId);
    const tournament = await prisma.tournament.findUnique({
      where: { tournamentId: id },
      include: {
        creator: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        winnerClub: {
          select: {
            clubId: true,
            name: true,
            logo: true,
          },
        },
        runnerUpClub: {
          select: {
            clubId: true,
            name: true,
            logo: true,
          },
        },
        registrations: {
          where: { status: "ACCEPTED" },
          include: {
            club: {
              select: {
                clubId: true,
                name: true,
                logo: true,
                location: true,
              },
            },
          },
          orderBy: { registeredAt: "desc" },
        },
        admins: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!tournament) return null;

    const schedules = await prisma.schedule.findMany({
      where: { createdFromTournament: id },
      include: {
        teamOne: { select: { clubId: true, name: true } },
        teamTwo: { select: { clubId: true, name: true } },
        match: {
          select: {
            matchId: true,
            teamOneGoals: true,
            teamTwoGoals: true,
            endedAt: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const standingsMap = new Map();

    for (const schedule of schedules) {
      const teamOneId = schedule.teamOneId;
      const teamTwoId = schedule.teamTwoId;

      if (!standingsMap.has(teamOneId)) {
        standingsMap.set(teamOneId, {
          clubId: teamOneId,
          clubName: schedule.teamOne?.name || `Club ${teamOneId}`,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }

      if (!standingsMap.has(teamTwoId)) {
        standingsMap.set(teamTwoId, {
          clubId: teamTwoId,
          clubName: schedule.teamTwo?.name || `Club ${teamTwoId}`,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }

      if (!schedule.match) {
        continue;
      }

      const t1 = standingsMap.get(teamOneId);
      const t2 = standingsMap.get(teamTwoId);
      const t1Goals = schedule.match.teamOneGoals;
      const t2Goals = schedule.match.teamTwoGoals;

      t1.played += 1;
      t2.played += 1;

      t1.goalsFor += t1Goals;
      t1.goalsAgainst += t2Goals;
      t2.goalsFor += t2Goals;
      t2.goalsAgainst += t1Goals;

      if (t1Goals > t2Goals) {
        t1.wins += 1;
        t1.points += 3;
        t2.losses += 1;
      } else if (t1Goals < t2Goals) {
        t2.wins += 1;
        t2.points += 3;
        t1.losses += 1;
      } else {
        t1.draws += 1;
        t2.draws += 1;
        t1.points += 1;
        t2.points += 1;
      }
    }

    const topClubs = [...standingsMap.values()].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });

    const goals = await prisma.matchEvent.groupBy({
      by: ["userId", "clubId"],
      where: {
        eventType: "GOAL",
        match: {
          schedule: {
            createdFromTournament: id,
          },
        },
      },
      _count: { _all: true },
    });

    const assists = await prisma.matchEvent.groupBy({
      by: ["assistById"],
      where: {
        eventType: "GOAL",
        assistById: { not: null },
        match: {
          schedule: {
            createdFromTournament: id,
          },
        },
      },
      _count: { _all: true },
    });

    const assistMap = new Map(
      assists
        .filter((a) => a.assistById != null)
        .map((a) => [a.assistById, a._count._all]),
    );

    const players = await prisma.user.findMany({
      where: {
        userId: {
          in: [...new Set(goals.map((g) => g.userId))],
        },
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
      },
    });

    const playerMap = new Map(players.map((p) => [p.userId, p]));

    const topPlayers = goals
      .map((g) => {
        const player = playerMap.get(g.userId);
        return {
          userId: g.userId,
          clubId: g.clubId,
          goals: g._count._all,
          assists: assistMap.get(g.userId) || 0,
          firstName: player?.firstName || "Unknown",
          lastName: player?.lastName || "Player",
          profilePhoto: player?.profilePhoto || null,
        };
      })
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return b.assists - a.assists;
      })
      .slice(0, 10);

    return {
      ...tournament,
      schedules,
      topClubs,
      topPlayers,
    };
  }

  static async getTournamentsByUserId(userId) {
    const tournaments = await prisma.tournament.findMany({
      where: { createdBy: userId },
      include: {
        registrations: {
          where: { status: "ACCEPTED" },
          select: { registrationId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tournaments.map((t) => ({
      ...t,
      acceptedClubCount: t.registrations.length,
    }));
  }

  static async updateTournament(tournamentId, data, userId) {
    const existing = await prisma.tournament.findUnique({
      where: { tournamentId: Number(tournamentId) },
      select: { tournamentId: true, createdBy: true },
    });

    if (!existing) {
      throw new Error("Tournament not found");
    }

    if (existing.createdBy !== userId) {
      throw new Error("Only tournament owner can update tournament details");
    }

    const updatedTournament = await prisma.tournament.update({
      where: { tournamentId: Number(tournamentId) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.format && {
          format: normalizeEnumValue(data.format, FORMAT_MAP, "KNOCKOUT"),
        }),
        ...(data.entryFee !== undefined && { entryFee: Number(data.entryFee) }),
        ...(data.status && {
          status: normalizeEnumValue(data.status, STATUS_MAP, "UPCOMING"),
        }),
        ...(data.paymentInstructions !== undefined && {
          paymentInstructions: data.paymentInstructions,
        }),
        updatedAt: new Date(),
      },
    });
    return updatedTournament;
  }

  static async updateTournamentStatus(tournamentId, data) {
    const id = Number(tournamentId);
    const status = normalizeEnumValue(data.status, STATUS_MAP, null);

    if (!status) {
      throw new Error("Invalid tournament status");
    }

    const acceptedRegistrations = await prisma.tournamentRegistration.findMany({
      where: {
        tournamentId: id,
        status: "ACCEPTED",
      },
      select: { clubId: true },
    });

    const acceptedClubIds = new Set(acceptedRegistrations.map((r) => r.clubId));

    if (data.winnerClubId && !acceptedClubIds.has(Number(data.winnerClubId))) {
      throw new Error("Winner club must be enrolled in this tournament");
    }

    if (data.runnerUpClubId && !acceptedClubIds.has(Number(data.runnerUpClubId))) {
      throw new Error("Runner-up club must be enrolled in this tournament");
    }

    if (
      data.winnerClubId &&
      data.runnerUpClubId &&
      Number(data.winnerClubId) === Number(data.runnerUpClubId)
    ) {
      throw new Error("Winner and runner-up clubs must be different");
    }

    const updatedTournament = await prisma.tournament.update({
      where: { tournamentId: id },
      data: {
        status,
        ...(data.winnerClubId !== undefined && {
          winnerClubId: data.winnerClubId ? Number(data.winnerClubId) : null,
        }),
        ...(data.runnerUpClubId !== undefined && {
          runnerUpClubId: data.runnerUpClubId ? Number(data.runnerUpClubId) : null,
        }),
      },
      include: {
        winnerClub: { select: { clubId: true, name: true } },
        runnerUpClub: { select: { clubId: true, name: true } },
      },
    });

    return updatedTournament;
  }

  static async requestTournamentJoin(tournamentId, userId, data) {
    const id = Number(tournamentId);
    const clubId = Number(data.clubId);

    if (!clubId) {
      throw new Error("clubId is required");
    }

    const tournament = await prisma.tournament.findUnique({
      where: { tournamentId: id },
      select: { tournamentId: true, entryFee: true, createdBy: true },
    });

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const adminAccess = await isClubAdmin(userId, clubId);
    if (!adminAccess) {
      throw new Error("Only club admins can register a club for tournament");
    }

    const registration = await prisma.tournamentRegistration.upsert({
      where: {
        tournamentId_clubId: {
          tournamentId: id,
          clubId,
        },
      },
      update: {
        status: "PENDING",
        notes: data.notes || null,
        paymentStatus: "PENDING",
        paymentReference: data.paymentReference || null,
        paymentAmount: Number(tournament.entryFee || 0),
        reviewedAt: null,
        reviewedBy: null,
        registeredBy: userId,
      },
      create: {
        tournamentId: id,
        clubId,
        registeredBy: userId,
        status: "PENDING",
        notes: data.notes || null,
        paymentStatus: "PENDING",
        paymentReference: data.paymentReference || null,
        paymentAmount: Number(tournament.entryFee || 0),
      },
      include: {
        club: {
          select: {
            clubId: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    const adminIds = await NotificationService.getTournamentAdminUserIds(id);
    await NotificationService.createBulkNotifications(
      adminIds.filter((adminId) => Number(adminId) !== Number(userId)),
      {
        type: "TOURNAMENT_JOIN_REQUEST",
        title: "New tournament join request",
        message: `${registration.club?.name || "A club"} requested to join your tournament.`,
        link: `/tournament/${id}`,
        data: {
          tournamentId: id,
          clubId,
          registrationId: registration.registrationId,
        },
      },
    );

    return registration;
  }

  static async getTournamentRegistrations(tournamentId, filters = {}) {
    const id = Number(tournamentId);
    const where = {
      tournamentId: id,
    };

    if (filters.status) {
      where.status = String(filters.status).toUpperCase();
    }

    const registrations = await prisma.tournamentRegistration.findMany({
      where,
      include: {
        club: {
          select: {
            clubId: true,
            name: true,
            logo: true,
            location: true,
          },
        },
      },
      orderBy: { registeredAt: "desc" },
    });

    return registrations;
  }

  static async reviewTournamentRegistration(registrationId, reviewerId, data) {
    const id = Number(registrationId);
    const action = String(data.action || "").toUpperCase();

    if (!["APPROVE", "DECLINE", "REJECT"].includes(action)) {
      throw new Error("Action must be APPROVE or DECLINE");
    }

    const status = action === "APPROVE" ? "ACCEPTED" : "REJECTED";

    const updated = await prisma.tournamentRegistration.update({
      where: { registrationId: id },
      data: {
        status,
        notes: data.notes || null,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        ...(data.paymentStatus && {
          paymentStatus: String(data.paymentStatus).toUpperCase(),
        }),
        ...(data.paymentReference !== undefined && {
          paymentReference: data.paymentReference,
        }),
      },
      include: {
        tournament: {
          select: {
            tournamentId: true,
            name: true,
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

    const clubMemberIds = await NotificationService.getClubMemberUserIds(
      updated.club.clubId,
      true,
    );

    await NotificationService.createBulkNotifications(clubMemberIds, {
      type:
        status === "ACCEPTED"
          ? "TOURNAMENT_JOIN_APPROVED"
          : "TOURNAMENT_JOIN_REJECTED",
      title:
        status === "ACCEPTED"
          ? "Tournament request approved"
          : "Tournament request declined",
      message:
        status === "ACCEPTED"
          ? `${updated.club.name} has been approved for ${updated.tournament.name}.`
          : `${updated.club.name} was not approved for ${updated.tournament.name}.`,
      link: `/tournament/${updated.tournament.tournamentId}`,
      data: {
        tournamentId: updated.tournament.tournamentId,
        clubId: updated.club.clubId,
        registrationId: updated.registrationId,
      },
    });

    return updated;
  }

  static async deleteTournament(tournamentId) {
    const deletedTournament = await prisma.tournament.delete({
      where: { tournamentId: Number(tournamentId) },
    });
    return deletedTournament;
  }
}

export default TournamentService;
