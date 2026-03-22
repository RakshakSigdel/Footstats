import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token is missing" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid access token" });
        }

        const normalizedUserId = Number(decoded?.userId ?? decoded?.id);
        if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        req.user = {
            ...decoded,
            userId: normalizedUserId,
        };
        next();
    });
};