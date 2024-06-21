import { Request, Response } from "express";
import { Product, Asset, PriceCut, Purchase, User } from "../models";
import {
  ProductWithAssociations,
  PurchaseWithAssociations,
  SanitizedPurchase,
} from "../types";

import * as yup from "yup";
import { validateFields, convertToObject } from "../utils";

/**
 * @swagger
 * /getProducts:
 *   get:
 *     summary: Retrieves a list of all products.
 *     description: Returns a list of products along with their associated assets and price cuts.
 *     tags:
 *       - Products
 *     responses:
 *       '200':
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: number
 *                     description: The unique identifier for the product.
 *                   name:
 *                     type: string
 *                     description: The name of the product.
 *                   description:
 *                     type: string
 *                     description: The description of the product.
 *                   Assets:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         photo_url:
 *                           type: string
 *                           description: The URL of the product's photo.
 *                   PriceCuts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: The name of the price cut.
 *                         price:
 *                           type: number
 *                           description: The discounted price.
 *       '500':
 *         description: Internal server error.
 */
export const getProductsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const products = (await Product.findAll({
      attributes: ["product_id", "name", "description"],
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
    })) as ProductWithAssociations[];

    return res.status(200).json(products);
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /buyProducts:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Purchase products.
 *     description: Allows a user to purchase products by providing the product ID, quantity, and price cut name.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - price_cut_name
 *             properties:
 *               product_id:
 *                 type: number
 *                 description: The ID of the product to purchase.
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product to purchase.
 *               price_cut_name:
 *                 type: string
 *                 description: The name of the price cut to apply to the purchase.
 *     responses:
 *       '201':
 *         description: Purchase successful. Returns the details of the purchase.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchase:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       description: The username of the user making the purchase.
 *                     price_cut_name:
 *                       type: string
 *                       description: The name of the price cut.
 *                     price:
 *                       type: number
 *                       description: The price per unit after the price cut.
 *                     quantity:
 *                       type: number
 *                       description: The quantity purchased.
 *                     total_price:
 *                       type: string
 *                       description: The total price for the quantity purchased.
 *       '400':
 *         description: Bad request. Validation error for the input fields.
 *       '404':
 *         description: Not found. Product or user not found.
 *       '500':
 *         description: Internal server error. Error while processing the purchase.
 */
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

  const validationResponse = await validateFields(registerSchema, body);

  if (validationResponse?.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const {
    product_id,
    quantity,
    price_cut_name: name,
  }: { product_id: number; quantity: number; price_cut_name: string } = body;

  const priceCut: PriceCut | null = await PriceCut.findOne({
    where: { name, product_id },
  });

  if (!priceCut) {
    return res.status(404).json({ error: "Product not available" });
  }

  const user: User | null = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const totalPrice: number = priceCut.price * quantity;

  try {
    const purchase: Purchase = await Purchase.create({
      user_id: user.user_id,
      quantity,
      price_cut_id: priceCut.price_cut_id,
      total_price: totalPrice,
    });

    const sanitizedPurchase: SanitizedPurchase = {
      username: user.username,
      price_cut_name: priceCut.name,
      price: priceCut.price,
      quantity: purchase.quantity,
      total_price: purchase.total_price.toString(),
    };
    res.status(201).json({ purchase: sanitizedPurchase });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Error purchasing" });
  }
};

/**
 * @swagger
 * /getPurchases:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieves all purchases for a user.
 *     description: Returns a list of all purchases made by the user logged in, including details of the products and price cuts.
 *     tags:
 *       - Products
 *     responses:
 *       '200':
 *         description: A list of purchases.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quantity:
 *                         type: number
 *                         description: The quantity of the purchased item.
 *                       total_price:
 *                         type: number
 *                         description: The total price of the purchase.
 *                       PriceCut:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: The name of the price cut applied to the purchase.
 *                           price:
 *                             type: number
 *                             description: The price per unit after the price cut.
 *                           Product:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 description: The name of the purchased product.
 *                               description:
 *                                 type: string
 *                                 description: The description of the purchased product.
 *                               Asset:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     photo_url:
 *                                       type: string
 *                                       description: The URL of the product's photo.
 *       '404':
 *         description: User or purchases not found.
 *       '500':
 *         description: Internal server error.
 */
export const getPurchasesController = async (
  req: Request & { username?: string },
  res: Response
) => {
  const { username } = req;

  const user: User | null = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const purchases = (await Purchase.findAll({
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
  })) as PurchaseWithAssociations[];

  if (!purchases) {
    return res.status(404).json({ error: "Purchases not found" });
  }

  res.status(200).json({ purchases: purchases });
};
