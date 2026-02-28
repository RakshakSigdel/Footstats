import MatchEventService from "../services/matchEventService.js";

/**
 * Create a new match event
 * POST /api/match-events
 */
export const createMatchEvent = async (req, res) => {
  try {
    const { matchId, userId, clubId, eventType, minute, assistById } = req.body;

    if (!matchId || !userId || !clubId || !eventType || minute === undefined) {
      return res.status(400).json({
        message: "matchId, userId, clubId, eventType, and minute are required",
      });
    }

    // Validate event type
    const validEventTypes = ["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        message: `Invalid event type. Must be one of: ${validEventTypes.join(", ")}`,
      });
    }

    const matchEvent = await MatchEventService.createMatchEvent({
      matchId,
      userId,
      clubId,
      eventType,
      minute,
      assistById,
    });

    res.status(201).json({
      message: "Match event created successfully",
      matchEvent,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error creating match event",
    });
  }
};

/**
 * Get all events for a match
 * GET /api/match-events/match/:matchId
 */
export const getMatchEvents = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      return res.status(400).json({ message: "Match ID is required" });
    }

    const events = await MatchEventService.getMatchEvents(matchId);
    res.status(200).json({ events });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error fetching match events",
    });
  }
};

/**
 * Get match event by ID
 * GET /api/match-events/:id
 */
export const getMatchEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await MatchEventService.getMatchEventById(id);

    if (!event) {
      return res.status(404).json({ message: "Match event not found" });
    }

    res.status(200).json({ event });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error fetching match event",
    });
  }
};

/**
 * Update a match event
 * PUT /api/match-events/:id
 */
export const updateMatchEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventType, minute, assistById } = req.body;

    // Validate event type if provided
    if (eventType) {
      const validEventTypes = ["GOAL", "YELLOW_CARD", "RED_CARD", "SUBSTITUTION"];
      if (!validEventTypes.includes(eventType)) {
        return res.status(400).json({
          message: `Invalid event type. Must be one of: ${validEventTypes.join(", ")}`,
        });
      }
    }

    const updatedEvent = await MatchEventService.updateMatchEvent(id, {
      eventType,
      minute,
      assistById,
    });

    res.status(200).json({
      message: "Match event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error updating match event",
    });
  }
};

/**
 * Delete a match event
 * DELETE /api/match-events/:id
 */
export const deleteMatchEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await MatchEventService.deleteMatchEvent(id);

    res.status(200).json({
      message: "Match event deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Error deleting match event",
    });
  }
};
