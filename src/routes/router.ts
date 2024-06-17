import express, { Request, Response } from "express";

import { authenticateToken } from "../middleware/auth";

import {
  loginController,
  registerController,
  getProductsController,
  buyProductsController,
  getPurchasesController
} from "../controllers";

export const router = express.Router();

router.get("/", authenticateToken, (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

router.post("/register", registerController);

router.post("/login", loginController);

router.get("/getProducts", getProductsController);

router.post("/buyProducts", authenticateToken, buyProductsController);

router.get("/getPurchases", authenticateToken, getPurchasesController);
