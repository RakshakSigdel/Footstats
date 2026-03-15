// scheduleController.js
import ScheduleService from "../services/scheduleService.js";

export const createSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      teamOneId,
      teamTwoId,
      scheduleStatus,
      date,
      scheduleType,
      location,
      createdFromClub,
      createdFromTournament,
    } = req.body;

    // Validation
    if (!teamOneId || !teamTwoId || !date || !scheduleType || !location) {
      return res.status(400).json({ 
        message: "teamOneId, teamTwoId, date, scheduleType, and location are required" 
      });
    }

    // Must be created from either club or tournament
    if (!createdFromClub && !createdFromTournament) {
      return res.status(400).json({
        message: "Schedule must be created from either a club or tournament",
      });
    }

    const schedule = await ScheduleService.createSchedule(req.body, userId);
    res.status(201).json({ 
      message: "Schedule created successfully",
      schedule 
    });
  } catch (error) {
    const status =
      error.message?.includes("must") ||
      error.message?.includes("cannot")
        ? 400
        : 500;
    res.status(status).json({ 
      message: "Error creating schedule", 
      error: error.message 
    });
  }
};

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await ScheduleService.getAllSchedules();
    console.log("Check Point 1");
    res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ 
      message: "Error Fetching Schedules", 
      error: error.message 
    });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = await ScheduleService.getScheduleById(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    res.status(200).json({ schedule });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching schedule", 
      error: error.message 
    });
  }
};

export const getMySchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await ScheduleService.getMySchedules(userId);
    
    res.status(200).json({ 
      message: "Schedules fetched successfully",
      schedules: result.all,
      upcoming: result.upcoming,
      finished: result.finished
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching your schedules", 
      error: error.message 
    });
  }
};

export const getClubSchedules = async (req, res) => {
  try {
    const clubId = req.params.id;
    const schedules = await ScheduleService.getScheduleByClub(clubId);
    
    if (schedules.length === 0) {
      return res.status(200).json({ 
        message: "No schedules found for this club",
        schedules: [] 
      });
    }
    
    return res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching club schedules", 
      error: error.message 
    });
  }
};

export const getTournamentSchedules = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const schedules = await ScheduleService.getScheduleByTournament(tournamentId);
    
    if (schedules.length === 0) {
      return res.status(200).json({ 
        message: "No schedules found for this tournament",
        schedules: [] 
      });
    }
    
    return res.status(200).json({ schedules });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching tournament schedules", 
      error: error.message 
    });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    const updatedSchedule = await ScheduleService.updateSchedule(
      scheduleId,
      req.body
    );
    
    res.status(200).json({ 
      message: "Schedule updated successfully",
      schedule: updatedSchedule 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to update schedule", 
      error: error.message 
    });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    
    await ScheduleService.deleteSchedule(scheduleId);
    
    res.status(200).json({ 
      message: "Schedule deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete schedule", 
      error: error.message 
    });
  }
};