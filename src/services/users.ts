import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { ErrorResponse, SuccessResponse } from "../types";

export const registerService = async (
  username: string,
  password: string
): Promise<SuccessResponse<{ username: string }> | ErrorResponse> => {
  try {
    const existingUser: User | null = await User.findOne({
      where: { username },
    });

    if (existingUser) {
      return {
        error: true,
        code: 409,
        errorMessage: `Username ${username} already exists`,
      };
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const newUser: User = await User.create({
      username,
      hashed_password: hashedPassword,
    });

    return {
      code: 201,
      data: { username: newUser.username },
    };
  } catch (error: unknown) {
    return {
      error: true,
      code: 500,
      errorMessage: "Error creating user",
    };
  }
};

export const loginService = async (
  username: string,
  password: string
): Promise<SuccessResponse<{ token: string }> | ErrorResponse> => {
  try {
    const user: User | null = await User.findOne({ where: { username } });

    if (!user) {
      return {
        error: true,
        code: 401,
        errorMessage: "Invalid credentials",
      };
    }
    
    const passwordMatch: boolean = await bcrypt.compare(
      password,
      user.hashed_password
    );

    if (!passwordMatch) {
      return {
        error: true,
        code: 401,
        errorMessage: "Invalid credentials",
      };
    }

    const token: string = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "10h" }
    );

    return {
      code: 200,
      data: { token },
    };
  } catch (error: unknown) {
    return {
      error: true,
      code: 500,
      errorMessage: "Error logging in",
    };
  }
};
