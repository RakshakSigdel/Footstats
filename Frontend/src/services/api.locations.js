import api from "./api";

export const searchPlaces = async (query, limit = 20) => {
  try {
    if (!String(query || "").trim()) return [];
    const response = await api.get("/locations/search", {
      params: {
        q: query,
        limit,
      },
    });
    return response.data.places || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to search places" };
  }
};

export const getLocationRecommendations = async (params = {}) => {
  try {
    const response = await api.get("/locations/recommendations", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch location recommendations" };
  }
};
