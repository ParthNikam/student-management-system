import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    res.status(401).json({
      "success": false,
      "error": "Unauthorized, token missing or invalid"
    });
    return;
  }

  try {
    const { userId, role } = jwt.verify(token, process.env.JWT_PASSWORD!) as JwtPayload;
    req.userId = userId;
    req.role = role;

    next();

  } catch (error) {
    res.status(401).json({
      "success": false,
      "error": "Unauthorized, token missing or invalid"
    });
  }
}


export const teacherRoleMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.role || req.role != "teacher") {
    res.status(403).json({
      "success": false,
      "error": "Forbidden, student cannot access"
    });
    return;
  }

  next();
}