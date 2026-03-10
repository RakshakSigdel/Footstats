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
    if (error.code === "P2002") {
      return res.status(409).json({ message: `A club named "${req.body.name}" already exists. Please choose a different name.` });
    }
    res.status(500).json({ message: "Error creating club", error: error.message });
  }
};

export const getAdminClubs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const clubs = await ClubService.getAdminClubs(userId);
    res.status(200).json({ clubs });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin clubs", error: error.message });
  }
};

export const searchClubs = async (req, res) => {
  try {
    const query = req.query.q || "";
    const clubs = await ClubService.searchClubs(query);
    res.status(200).json({ clubs });
  } catch (error) {
    res.status(500).json({ message: "Error searching clubs", error: error.message });
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

// Get all members of a club
export const getClubMembers = async (req, res) => {
  try {
    const clubId = req.params.id;
    const members = await ClubService.getClubMembers(clubId);
    res.status(200).json({ members });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching club members", error: error.message });
  }
};

// Add a member to a club
export const addClubMember = async (req, res) => {
  try {
    const clubId = req.params.id;
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    
    const membership = await ClubService.addMember(clubId, userId, role || "member");
    res.status(201).json({ membership, message: "Member added successfully" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "User is already a member of this club" });
    }
    res
      .status(500)
      .json({ message: "Error adding member", error: error.message });
  }
};

// Remove a member from a club
export const removeClubMember = async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.params.userId;
    
    await ClubService.removeMember(clubId, userId);
    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing member", error: error.message });
  }
};

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.params.userId;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: "role is required" });
    }
    
    await ClubService.updateMemberRole(clubId, userId, role);
    res.status(200).json({ message: "Member role updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating member role", error: error.message });
  }
};
