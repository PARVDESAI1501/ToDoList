import { ObjectId } from "mongodb";
import { verifyToken } from "../utils/token.js";

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded?.id || !ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    req.user = {
      id: new ObjectId(decoded.id),
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authMiddleware;
