const { PlayerService } = require("../services/playerServices");

// const addPlayer = (req, res) => {
//     try{
//         const{firstName, lastName, dateOfBirth, gender, Phone, location, profilePhoto, position} = req.body;
//         if (!firstName || !lastName || !dateOfBirth || !gender || !Phone || !location || !profilePhoto || !position) {
//             return res. status(400).json({message: "All fields are required"});
//     }
//     }catch(error){
//         res.status(500).json({message: "Error adding player", error: error.message});
//     }
// };

const getAllPlayers = async (req, res) => {
  try {
    const players = await PlayerService.getAllPlayers();
    res.status(200).json({ players });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving players", error: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Logged in user ID:", userId);
    const profile = await PlayerService.getPlayerByUserId(userId);
    res.status(200).json({ profile });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving profile", error: error.message });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const playerId = req.params.id;
    const player = await PlayerService.getPlayerById(playerId);
    res.status(200).json({ player });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving player", error: error.message });
  }
};

const updatePlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      Phone,
      location,
      profilePhoto,
      position,
    } = req.body;
    const updatedPlayer = await PlayerService.updatePlayer(id, {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      Phone,
      location,
      profilePhoto,
      position,
    });

    res.status(200).json({ updatedPlayer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating player", error: error.message });
  }
};

const deletePlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlayer = await PlayerService.deletePlayer(id);
    res.status(200).json({ deletedPlayer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting player", error: error.message });
  }
};

module.exports = {
  getAllPlayers,
  getMyProfile,
  getPlayerById,
  updatePlayerById,
  deletePlayerById,
};
