import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallbackSecretKey");

    // Attach user details to request
    req.user = decoded; // e.g., { userId: "S010", role: "student" }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed or expired" });
  }
};