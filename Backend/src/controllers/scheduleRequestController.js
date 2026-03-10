import ScheduleRequestService from "../services/scheduleRequestService.js";

export const createScheduleRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await ScheduleRequestService.createScheduleRequest(req.body, userId);
    res.status(201).json({ message: "Match request sent successfully", ...result });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create schedule request" });
  }
};

export const getMyScheduleRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requests = await ScheduleRequestService.getPendingRequestsForAdmin(userId);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch schedule requests" });
  }
};

export const approveScheduleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await ScheduleRequestService.approveRequest(requestId);
    res.json({ message: "Match request approved", ...result });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to approve request" });
  }
};

export const rejectScheduleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await ScheduleRequestService.rejectRequest(requestId);
    res.json({ message: "Match request declined", ...result });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to reject request" });
  }
};
