import api from "./api";

// Create a new match event (goal, card, substitution, etc.)
export const createMatchEvent = async (eventData) => {
  const response = await api.post("/match-events", eventData);
  return response.data;
};

// Get all events for a match
export const getMatchEvents = async (matchId) => {
  const response = await api.get(`/match-events/match/${matchId}`);
  return response.data;
};

// Get a single event by ID
export const getMatchEventById = async (eventId) => {
  const response = await api.get(`/match-events/${eventId}`);
  return response.data;
};

// Update a match event
export const updateMatchEvent = async (eventId, eventData) => {
  const response = await api.put(`/match-events/${eventId}`, eventData);
  return response.data;
};

// Delete a match event
export const deleteMatchEvent = async (eventId) => {
  const response = await api.delete(`/match-events/${eventId}`);
  return response.data;
};

export default {
  createMatchEvent,
  getMatchEvents,
  getMatchEventById,
  updateMatchEvent,
  deleteMatchEvent,
};
