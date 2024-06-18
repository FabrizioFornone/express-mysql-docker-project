import Product from "./product";
import Asset from "./asset";
import PriceCut from "./priceCut";
import Purchase from "./purchase";
import User from "./user";

Product.hasMany(Asset, { foreignKey: "product_id" });
Asset.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(PriceCut, { foreignKey: "product_id" });
PriceCut.belongsTo(Product, { foreignKey: "product_id" });

PriceCut.hasMany(Purchase, { foreignKey: "price_cut_id" });
Purchase.belongsTo(PriceCut, { foreignKey: "price_cut_id" });

User.hasMany(Purchase, { foreignKey: "user_id" });
Purchase.belongsTo(User, { foreignKey: "user_id" });

export { Product, Asset, PriceCut, User, Purchase };
