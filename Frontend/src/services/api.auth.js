import api from "./api";

const getErrorMessage = (error) => {
  if (error.response?.data) {
    const d = error.response.data;
    return d.message || d.error || "Request failed";
  }
  // Network error, server not running, or empty response (e.g. backend crashed)
  if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
    return "Cannot connect to server. Make sure the backend is running at http://localhost:5555";
  }
  return error.message || "Something went wrong";
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const register = async (firstName, lastName, email, password) => {
  try {
    const response = await api.post("/auth/register", { firstName, lastName, email, password });
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};
