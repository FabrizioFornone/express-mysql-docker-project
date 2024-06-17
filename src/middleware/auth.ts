import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request & { username?: string },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, payload: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    if (payload && payload.username) {
      req.username = payload.username;
    }
    next();
  });
};
