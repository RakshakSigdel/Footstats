import api from "./api";

export const initiatePayment = async (body) => {
  try {
    const response = await api.post("/initiate-payment", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to initiate payment" };
  }
};

export const checkPaymentStatus = async (body) => {
  try {
    const response = await api.post("/payment-status", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to check payment status" };
  }
};
