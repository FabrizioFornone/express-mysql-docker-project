import { Product, Asset, PriceCut, Purchase, User } from "../models";
import {
  ErrorResponse,
  SuccessResponse,
  ProductWithAssociations,
  SanitizedPurchase,
  PurchaseWithAssociations,
} from "../types";

export const getProductsService = async (): Promise<
  SuccessResponse<{ data: ProductWithAssociations[] }> | ErrorResponse
> => {
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

    return {
      code: 200,
      data: { data: products },
    };
  } catch (error: unknown) {
    return {
      error: true,
      code: 500,
      errorMessage: "Internal server error",
    };
  }
};

export const buyProductsService = async (
  product_id: number,
  quantity: number,
  name: string,
  username: string
): Promise<SuccessResponse<{ data: SanitizedPurchase }> | ErrorResponse> => {
  const priceCut: PriceCut | null = await PriceCut.findOne({
    where: { name, product_id },
  });

  if (!priceCut) {
    return {
      error: true,
      code: 404,
      errorMessage: "Product not available",
    };
  }

  const user: User | null = await User.findOne({ where: { username } });

  if (!user) {
    return {
      error: true,
      code: 404,
      errorMessage: "User not found",
    };
  }

  const priceCutNumber: number = parseFloat(priceCut.price);

  const totalPrice: number = priceCutNumber * quantity;

  const roundedTotalPrice = Number(totalPrice.toFixed(2));

  try {
    const purchase: Purchase = await Purchase.create({
      user_id: user.user_id,
      quantity,
      price_cut_id: priceCut.price_cut_id,
      total_price: roundedTotalPrice,
    });

    const sanitizedPurchase: SanitizedPurchase = {
      username: user.username,
      price_cut_name: priceCut.name,
      price: priceCutNumber.toFixed(2),
      quantity: purchase.quantity,
      total_price: purchase.total_price.toFixed(2),
    };

    return {
      code: 201,
      data: { data: sanitizedPurchase },
    };
  } catch (error: unknown) {
    return {
      error: true,
      code: 500,
      errorMessage: "Internal server error",
    };
  }
};

export const getPurchasesService = async (
  username: string
): Promise<
  SuccessResponse<{ data: PurchaseWithAssociations[] }> | ErrorResponse
> => {
  try {
    const user: User | null = await User.findOne({ where: { username } });

    if (!user) {
      return {
        error: true,
        code: 404,
        errorMessage: "User not found",
      };
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
      return {
        error: true,
        code: 404,
        errorMessage: "Purchases not found",
      };
    }

    return {
      code: 200,
      data: { data: purchases },
    };
  } catch (error: unknown) {
    return {
      error: true,
      code: 500,
      errorMessage: "Internal server error",
    };
  }
};
