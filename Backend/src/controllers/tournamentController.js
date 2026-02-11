import  TournamentService  from "../services/tournamentService.js";

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
    } = req.body;
    if (
      !name ||
      !description ||
      !location ||
      !startDate ||
      !endDate ||
      !entryFee ||
      !format ||
      !status
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const tournament = await TournamentService.createTournament(
      req.body,
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
    const tournaments = await TournamentService.getTournamentsByUserId(userId);
    if (tournaments.length === 0) {
      return res
        .status(200)
        .json({ message: "No tournaments found for this user" });
    }
    res.status(200).json({ tournaments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tournaments", error: error.message });
  }
};

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await TournamentService.getAllTournaments();
    res.status(200).json({ tournaments });
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
    res
      .status(500)
      .json({ message: "Error updating tournament", error: error.message });
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
