import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateFields, convertToObject } from "../utils";
import User from "../models/user";

import * as yup from "yup";

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       400:
 *         description: Bad request
 */
export const registerController = async (req: Request, res: Response) => {
  const { body } = req;

  const registerSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const validationResponse: any = await validateFields(registerSchema, body);

  if (validationResponse.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { username, password } = body;

  if (await User.findOne({ where: { username } })) {
    return res
      .status(400)
      .json({ error: `Username ${username} already exists` });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      hashed_password: hashedPassword,
    });

    const sanitizedUser = newUser.username;

    return res.status(201).json({ username: sanitizedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating user" });
  }
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user.
 *     tags: [Users]
 *     description: Validates the user's credentials and generates a JWT token if successful.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       '200':
 *         description: Successful login. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *       '400':
 *         description: Bad request. Invalid username or password.
 *       '401':
 *         description: Unauthorized. Invalid credentials.
 *       '500':
 *         description: Internal server error.
 */
export const loginController = async (req: Request, res: Response) => {
  const { body } = req;

  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  const validationResponse: any = await validateFields(loginSchema, body);

  if (validationResponse.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { username, password } = body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.hashed_password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "10h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Error logging in" });
  }
};
