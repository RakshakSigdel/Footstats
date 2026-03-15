import MessageService from "../services/messageService.js";

export const createMessage = async(req, res) => {
  try {
    const message = await MessageService.createMessage({
      clubId: req.params.clubId,
      userId: req.user.userId,
      content: req.body.content,
      messageType: req.body.messageType,
      attachment: req.body.attachment,
    });
    res.status(201).json({ message });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

  export const  getClubMessages = async(req, res) => {
    try {
      const messages = await MessageService.getClubMessages(
        req.params.clubId,
        req.user.userId,
      );
      res.status(200).json({ messages });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }

  export const deleteMessage = async(req, res) => {
    try {
      const result = await MessageService.deleteMessage(
        req.params.messageId,
        req.user.userId,
        req.user.role,
      );
      res.status(200).json({message : "Message deleted successfully", ...result});
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }

export default {
  createMessage,
    getClubMessages,
    deleteMessage
};
