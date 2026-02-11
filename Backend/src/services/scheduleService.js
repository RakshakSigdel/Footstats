import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class ScheduleService {
  //Create Schedule
  static async CreateSchedule(data, ClubId, UserId) {
    const newSchedule = await prisma.schedule.create({
      data: {
        teamOneId: data.teamOneId,
        teamTwoId: data.teamTwoId,
        scheduleStatus: data.scheduleStatus,
        date: data.date,
        scheduleType: data.scheduleType,
        location: data.location,
        createdFromClub: data.createdFromClub,
        createdFromTournament: data.createdFromTournament,
        createdFromUser: data.createdFromUser,
      },
    });
    return newSchedule;
  }
  //Get All Schedule
  static async getAllSchedules() {
    const schedules = await prisma.schedule.findMany({
      include: {
        teamOne: {
          select: {
            clubId: true,
            name: true,
          },
        },
        teamTwo: {
          select: {
            clubId: true,
            name: true,
          },
        },
        location: true,
        date: true,
        creationFromUser: {
          select: {
            UserId: true,
          },
        },
        creatorFromClub: {
          select: {
            clubId: true,
            name: true,
          },
        },
        creatorFromTournament: {
          select: {
            tournamentId: true,
            name: true,
          },
        },
      },
    });
    return schedules;
  }
  //Get Schedule By ID
  static async getScheduleById(scheduleId) {
    const schedule = await prisma.schedule.findUnique({
      where: { scheduleId: Number(scheduleId) },
    });
    return schedule;
  }
  //Get Schedule By Club
  static async getScheduleByClub() {
    const schedules = await prisma.club.findUnique({
      where: { clubId: Number(clubId) },
    });
    return schedules;
  }
  //Update Schedule
  static async updateSchedule(scheduleId, data) {
    const updatedSchedule = await prisma.schedule.update({
      teamOneId: data.teamOneId,
      teamTwoId: data.teamTwoId,
      scheduleStatus: data.scheduleStatus,
      date: data.date,
      scheduleType: data.scheduleType,
      location: data.location,
      createdFromClub: data.createdFromClub,
      createdFromTournament: data.createdFromTournament,
      createdFromUser: data.createdFromUser,
    });
  }
  //Delete Schedule
  static async deleteSchedule(scheduleId) {
    const deleteSchedule = await prisma.schedule.delete({
      where: { scheduleId: Number(scheduleId) },
    });
    return deleteSchedule;
  }
}

export default ScheduleService;