import type { Product, Asset, PriceCut } from "../models";

export interface ProductWithAssociations extends Product {
  Assets: Asset[];
  PriceCuts: PriceCut[];
}

export interface ProductWithAssetAssociations extends Product {
  Assets: Asset[];
}
