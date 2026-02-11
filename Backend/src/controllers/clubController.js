import ClubService from "../services/clubService.js";

export const createClub = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, location, foundedDate } = req.body;
    if (!name || !description || !location || !foundedDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const club = await ClubService.createClub(req.body, userId);
    res.status(201).json({ club });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating club", error: error.message });
  }
};

export const getMyClubs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const clubs = await ClubService.getClubsByUserId(userId);
    if (clubs.length === 0) {
      return res.status(200).json({ message: "No clubs found for this user" });
    }
    res.status(200).json({ clubs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching clubs", error: error.message });
  }
};

export const getAllClubs = async (req, res) => {
  try {
    const clubs = await ClubService.getAllClubs();
    res.status(200).json({ clubs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching clubs", error: error.message });
  }
};

export const getClubById = async (req, res) => {
  try {
    const clubId = req.params.id;
    const club = await ClubService.getClubById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.status(200).json({ club });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching club", error: error.message });
  }
};

export const updateClub = async (req, res) => {
  try {
    const clubId = req.params.id;
    const updatedClub = await ClubService.updateClub(
      clubId,
      req.body,
      req.user.userId,
    );
    res.status(200).json({ updatedClub });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating club", error: error.message });
  }
};

export const deleteClub = async (req, res) => {
  try {
    const clubId = req.params.id;
    await ClubService.deleteClub(clubId);
    res.status(200).json({ message: "Club deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting club", error: error.message });
  }
};
