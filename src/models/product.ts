import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

class Product extends Model {
  public product_id!: number;
  public name!: string;
  public description!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

Product.init(
  {
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    tableName: "products",
    sequelize,
    timestamps: false,
  }
);

export default Product;
