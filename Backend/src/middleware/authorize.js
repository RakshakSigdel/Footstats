export const authorizeOwnership = (req, res, next) => {
  const loggedInUser = req.user.role;
  const loggedInUserId = req.params.id;
  const resourceOwnerId = req.params.id;

  if (loggedInUser.role === "SUPERADMIN") return next();

  if (loggedInUser === "PLAYER" && loggedInUserId === resourceOwnerId) {
    return next();
  }
  return res.status(403).json({
    message: "Forbidden: You do not have permission to access this resource",
  });
};
