import { Request, Response } from "express";
import * as yup from "yup";
import { validateFields, convertToObject } from "../utils";
import {
  buyProductsService,
  getProductsService,
  getPurchasesService,
} from "../services";
import {
  ErrorResponse,
  ProductWithAssociations,
  PurchaseWithAssociations,
  SanitizedPurchase,
  SuccessResponse,
} from "../types";

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
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: The list of products.
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: number
 *                         description: The unique identifier for the product.
 *                       name:
 *                         type: string
 *                         description: The name of the product.
 *                       description:
 *                         type: string
 *                         description: The description of the product.
 *                       Assets:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             photo_url:
 *                               type: string
 *                               description: The URL of the product's photo.
 *                       PriceCuts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the price cut.
 *                             price:
 *                               type: number
 *                               description: The price.
 *       '500':
 *         description: Internal server error.
 */
export const getProductsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const result = await getProductsService();

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{
    data: ProductWithAssociations[];
  }>;
  return res.status(code).json(data);
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
 *                 data:
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

  const result = await buyProductsService(
    product_id,
    quantity,
    name,
    username as string
  );

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{
    data: SanitizedPurchase;
  }>;
  return res.status(code).json(data);
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
 *                 data:
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

  const result = await getPurchasesService(username as string);

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{
    data: PurchaseWithAssociations[];
  }>;
  return res.status(code).json(data);
};
