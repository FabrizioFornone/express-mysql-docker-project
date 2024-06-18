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
          attributes: ["name", "price"],
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
    price_cut_name: yup.string().required("price cut name is required"),
  });

  const validationResponse: any = await validateFields(registerSchema, body);

  if (validationResponse.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { product_id, quantity, price_cut_name: name } = body;

  const priceCut = await PriceCut.findOne({ where: { name, product_id } });

  if (!priceCut) {
    return res.status(404).json({ error: "Product not available" });
  }

  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const totalPrice = priceCut.price * quantity;

  try {
    const purchase = await Purchase.create({
      user_id: user.user_id,
      quantity,
      price_cut_id: priceCut.price_cut_id,
      total_price: totalPrice,
    });

    const sanitizedPurchase = {
      username: username,
      price_cut_name: priceCut.name,
      price: priceCut.price,
      quantity: purchase.quantity,
      total_price: purchase.total_price.toString(),
    };
    res.status(201).json({ purchase: sanitizedPurchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error purchasing" });
  }
};

export const getPurchasesController = async (
  req: Request & { username?: string },
  res: Response
) => {
  const { username } = req;

  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const purchases = await Purchase.findAll({
    where: { user_id: user.user_id },
    attributes: ["quantity", "total_price"],
    include: [
      {
        model: PriceCut,
        attributes: ["name", "price"],
        include: [
          {
            model: Product,
            attributes: ["name", "description"],
            include: [
              {
                model: Asset,
                attributes: ["photo_url"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!purchases) {
    return res.status(404).json({ error: "Purchases not found" });
  }

  res.status(200).json({ purchases: purchases });
};
