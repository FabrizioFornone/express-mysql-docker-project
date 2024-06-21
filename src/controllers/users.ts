import { Request, Response } from "express";

import { validateFields, convertToObject } from "../utils";
import { registerService, loginService } from "../services";
import { ErrorResponse, SuccessResponse } from "../types";

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
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: johndoe
 *       400:
 *         description: Bad request. Validation error for the input fields.
 *       409:
 *         description: Username already exists.
 *       500:
 *         description: Internal server error.
 */
export const registerController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { body } = req;

  const registerSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const validationResponse = await validateFields(registerSchema, body);

  if (validationResponse?.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { username, password }: { username: string; password: string } = body;

  const result = await registerService(username, password);

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{ username: string }>;
  return res.status(code).json(data);
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
 *         description: Bad request. Validation error for the input fields.
 *       '401':
 *         description: Unauthorized. Invalid credentials.
 *       '500':
 *         description: Internal server error.
 */
export const loginController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { body } = req;

  const loginSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  const validationResponse = await validateFields(loginSchema, body);

  if (validationResponse?.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { username, password }: { username: string; password: string } = body;

  const result = await loginService(username, password);

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{ token: string }>;
  return res.status(code).json(data);
};
