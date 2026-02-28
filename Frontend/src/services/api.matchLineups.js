import api from "./api";

// Create multiple lineup entries at once (bulk)
export const createBulkLineup = async (lineupData) => {
  const response = await api.post("/match-lineups/bulk", lineupData);
  return response.data;
};

// Add a single player to lineup
export const addPlayerToLineup = async (lineupData) => {
  const response = await api.post("/match-lineups", lineupData);
  return response.data;
};

// Get all lineup entries for a match
export const getMatchLineups = async (matchId) => {
  const response = await api.get(`/match-lineups/match/${matchId}`);
  return response.data;
};

// Get a single lineup entry by ID
export const getLineupById = async (lineupId) => {
  const response = await api.get(`/match-lineups/${lineupId}`);
  return response.data;
};

// Update a lineup entry (position, starting status, etc.)
export const updateLineup = async (lineupId, lineupData) => {
  const response = await api.put(`/match-lineups/${lineupId}`, lineupData);
  return response.data;
};

// Remove a player from lineup
export const removeFromLineup = async (lineupId) => {
  const response = await api.delete(`/match-lineups/${lineupId}`);
  return response.data;
};

export default {
  createBulkLineup,
  addPlayerToLineup,
  getMatchLineups,
  getLineupById,
  updateLineup,
  removeFromLineup,
};
