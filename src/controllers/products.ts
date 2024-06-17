import { Request, Response } from "express";
import { Product, Asset, PriceCut } from "../models";

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
