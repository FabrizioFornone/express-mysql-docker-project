import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

class PriceCut extends Model {
  public price_cut_id!: number;
  public product_id!: number;
  public name!: string;
  public price!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

PriceCut.init(
  {
    price_cut_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "products",
        key: "product_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: "price_cuts",
    sequelize,
    timestamps: false,
  }
);

export default PriceCut;
