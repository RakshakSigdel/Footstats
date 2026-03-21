import TournamentService from "../services/tournamentService.js";

export const createTournament = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      entryFee,
      format,
      status,
      paymentInstructions,
    } = req.body;
    if (
      !name ||
      !description ||
      !location ||
      !startDate ||
      !endDate ||
      entryFee === undefined ||
      !format
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const tournament = await TournamentService.createTournament(
      {
        name,
        description,
        location,
        startDate,
        endDate,
        entryFee,
        format,
        status,
        paymentInstructions,
      },
      userId,
    );
    res.status(201).json({ tournament });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating tournament", error: error.message });
  }
};

export const getMyTournaments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await TournamentService.getTournamentsByUserId(userId, req.query);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tournaments", error: error.message });
  }
};

export const getEnrolledTournaments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await TournamentService.getEnrolledTournamentsByUserId(
      userId,
      req.query,
    );
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tournaments", error: error.message });
  }
};

export const getAllTournaments = async (req, res) => {
  try {
    const result = await TournamentService.getAllTournaments(req.query);
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tournaments", error: error.message });
  }
};

export const getTournamentById = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const tournament = await TournamentService.getTournamentById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    res.status(200).json({ tournament });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tournament", error: error.message });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const updatedTournament = await TournamentService.updateTournament(
      tournamentId,
      req.body,
      req.user.userId,
    );
    res.status(200).json({ updatedTournament });
  } catch (error) {
    const status =
      error.message?.includes("not found")
        ? 404
        : error.message?.includes("Only tournament owner")
          ? 403
          : 500;
    res.status(status).json({
      message: "Error updating tournament",
      error: error.message,
    });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    await TournamentService.deleteTournament(tournamentId);
    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting tournament", error: error.message });
  }
};

export const requestTournamentJoin = async (req, res) => {
  try {
    const registration = await TournamentService.requestTournamentJoin(
      req.params.id,
      req.user.userId,
      req.body,
    );

    const message =
      registration?.status === "ACCEPTED"
        ? "Payment confirmed. Club enrolled in tournament."
        : "Tournament join request submitted";

    res.status(201).json({
      message,
      registration,
    });
  } catch (error) {
    const status =
      error.message?.includes("not found")
        ? 404
        : error.message?.includes("Only club admins")
          ? 403
          : 400;
    res.status(status).json({
      message: "Failed to submit tournament join request",
      error: error.message,
    });
  }
};

export const getTournamentRegistrations = async (req, res) => {
  try {
    const registrations = await TournamentService.getTournamentRegistrations(
      req.params.id,
      req.query,
    );

    res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tournament registrations",
      error: error.message,
    });
  }
};

export const reviewTournamentRegistration = async (req, res) => {
  try {
    const updatedRegistration = await TournamentService.reviewTournamentRegistration(
      req.params.registrationId,
      req.user.userId,
      req.body,
    );

    res.status(200).json({
      message: "Tournament registration reviewed",
      registration: updatedRegistration,
    });
  } catch (error) {
    const status = error.message?.includes("Action must") ? 400 : 500;
    res.status(status).json({
      message: "Failed to review registration",
      error: error.message,
    });
  }
};

export const updateTournamentStatus = async (req, res) => {
  try {
    const tournament = await TournamentService.updateTournamentStatus(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      message: "Tournament status updated",
      tournament,
    });
  } catch (error) {
    const status = error.message?.includes("Invalid") ? 400 : 400;
    res.status(status).json({
      message: "Failed to update tournament status",
      error: error.message,
    });
  }
};
