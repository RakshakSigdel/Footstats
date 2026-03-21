import MatchService from "../services/matchService.js";

export const createMatch = async (req, res) => {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ error: "Schedule ID is required" });
    }

    const match = await MatchService.createMatch(req.body.scheduleId, req.body);
    res.status(201).json({ match });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getAllMatches = async (req, res) => {
  try {
    const result = await MatchService.getAllMatches(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getMatchByScheduleId = async (req, res) => {
  try {
    const matches = await MatchService.getMatchByScheduleId(
      req.params.scheduleID,
    );

    if (matches.length === 0) {
      return res
        .status(200)
        .json({ message: "No matches found for this schedule" });
    }

    res.status(200).json({ matches });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const match = await MatchService.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    const updatedMatch = await MatchService.updateMatch(
      req.params.matchId,
      req.body,
    );
    res.status(200).json({ match: updatedMatch });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const matchId = req.params.matchId;

    const match = await MatchService.getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    await MatchService.deleteMatch(matchId);
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
