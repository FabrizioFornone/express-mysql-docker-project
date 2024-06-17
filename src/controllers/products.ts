import { Request, Response } from "express";
import { Product, Asset, PriceCut, Purchase, User } from "../models";

import * as yup from "yup";
import { validateFields, convertToObject } from "../utils";

export const getProductsController = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Asset,
          attributes: ["photo_url"],
        },
        {
          model: PriceCut,
          attributes: ["price"],
        },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const buyProductsController = async (
  req: Request & { username?: string },
  res: Response
) => {
  const { body, username } = req;

  const registerSchema = yup.object().shape({
    product_id: yup.number().required("product_id is required"),
    quantity: yup.number().required("quantity is required"),
    price: yup.number().required("price is required"),
  });

  const validationResponse: any = await validateFields(registerSchema, body);

  if (validationResponse.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { product_id, quantity, price } = body;

  const product = await Product.findOne({
    where: { product_id },
    include: [
      {
        model: PriceCut,
        attributes: ["price"],
        where: { price },
      },
    ],
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const totalPrice = price * quantity;

  try {
    const purchase = await Purchase.create({
      user_id: user.user_id,
      product_id,
      quantity,
      total_price: totalPrice,
    });

    const sanitizedPurchase = {
      username: username,
      total_price: purchase.total_price,
    };
    res.status(201).json({ purchase: sanitizedPurchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error purchasing" });
  }
};
