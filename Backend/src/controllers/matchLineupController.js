import MatchLineupService from "../services/matchLineupService.js";

/**
 * Create lineup entries for a match (bulk)
 * POST /api/match-lineups/bulk
 */
export const createBulkLineup = async (req, res) => {
  try {
    const { matchId, players } = req.body;

    if (!matchId || !players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        message: "matchId and players array are required",
      });
    }

    // Validate each player entry
    for (const player of players) {
      if (!player.userId || !player.clubId) {
        return res.status(400).json({
          message: "Each player must have userId and clubId",
        });
      }
    }

    const lineups = await MatchLineupService.createMatchLineup(matchId, players);

    res.status(201).json({
      message: "Lineup created successfully",
      lineups,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error creating lineup",
    });
  }
};

/**
 * Add a single player to lineup
 * POST /api/match-lineups
 */
export const addPlayerToLineup = async (req, res) => {
  try {
    const { matchId, userId, clubId, isStarter, position, minutesPlayed } = req.body;

    if (!matchId || !userId || !clubId) {
      return res.status(400).json({
        message: "matchId, userId, and clubId are required",
      });
    }

    const lineup = await MatchLineupService.addPlayerToLineup({
      matchId,
      userId,
      clubId,
      isStarter,
      position,
      minutesPlayed,
    });

    res.status(201).json({
      message: "Player added to lineup successfully",
      lineup,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error adding player to lineup",
    });
  }
};

/**
 * Get all lineups for a match
 * GET /api/match-lineups/match/:matchId
 */
export const getMatchLineups = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      return res.status(400).json({ message: "Match ID is required" });
    }

    const lineups = await MatchLineupService.getMatchLineups(matchId);

    res.status(200).json({ lineups });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error fetching lineups",
    });
  }
};

/**
 * Get lineup by ID
 * GET /api/match-lineups/:id
 */
export const getLineupById = async (req, res) => {
  try {
    const { id } = req.params;

    const lineup = await MatchLineupService.getLineupById(id);

    if (!lineup) {
      return res.status(404).json({ message: "Lineup entry not found" });
    }

    res.status(200).json({ lineup });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error fetching lineup",
    });
  }
};

/**
 * Update a lineup entry
 * PUT /api/match-lineups/:id
 */
export const updateLineup = async (req, res) => {
  try {
    const { id } = req.params;
    const { isStarter, position, minutesPlayed } = req.body;

    const updated = await MatchLineupService.updateLineup(id, {
      isStarter,
      position,
      minutesPlayed,
    });

    res.status(200).json({
      message: "Lineup updated successfully",
      lineup: updated,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error updating lineup",
    });
  }
};

/**
 * Remove a player from lineup
 * DELETE /api/match-lineups/:id
 */
export const removeFromLineup = async (req, res) => {
  try {
    const { id } = req.params;

    await MatchLineupService.removeFromLineup(id);

    res.status(200).json({
      message: "Player removed from lineup successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error removing player from lineup",
    });
  }
};
