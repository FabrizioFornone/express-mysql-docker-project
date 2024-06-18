import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateFields, convertToObject } from "../utils";
import User from "../models/user";

import * as yup from "yup";

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
