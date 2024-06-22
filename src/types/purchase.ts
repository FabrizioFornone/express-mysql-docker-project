import type { Purchase } from "../models";
import type { PriceCutWithAssociations } from "./";

export interface PurchaseWithAssociations extends Purchase {
  PriceCut: PriceCutWithAssociations;
}

export interface SanitizedPurchase {
  username: string;
  price_cut_name: string;
  price: string;
  quantity: number;
  total_price: string;
}
