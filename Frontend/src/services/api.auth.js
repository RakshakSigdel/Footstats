import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something Went wrong" };
  }
};

export const register = async (firstName, lastName, email, password) => {
  try {
    const response = await api.post('/auth/register', { firstName, lastName, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something Went wrong" };
  }
};
