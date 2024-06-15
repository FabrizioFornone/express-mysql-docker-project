import express, { Request, Response } from "express";

import { loginController, registerController } from "../controllers/auth";
import { authenticateToken } from "../middlewares/auth";

export const router = express.Router();

router.get("/", authenticateToken, (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

router.post("/register", registerController);

router.post("/login", loginController);
