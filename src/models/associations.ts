import Product from "./product";
import Asset from "./asset";
import PriceCut from "./priceCut";

Product.hasMany(Asset, { foreignKey: "product_id" });
Asset.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(PriceCut, { foreignKey: "product_id" });
PriceCut.belongsTo(Product, { foreignKey: "product_id" });

export { Product, Asset, PriceCut };
