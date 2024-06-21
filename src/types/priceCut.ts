import type { PriceCut } from "../models";
import { ProductWithAssetAssociations } from "./";

export interface PriceCutWithAssociations extends PriceCut {
  Product: ProductWithAssetAssociations;
}
