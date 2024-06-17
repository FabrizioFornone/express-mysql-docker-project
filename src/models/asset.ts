import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

class Asset extends Model {
  public asset_id!: number;
  public product_id!: number;
  public photo_url!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Asset.init(
  {
    asset_id: {
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
    photo_url: {
      type: DataTypes.STRING,
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
    tableName: "assets",
    sequelize,
    timestamps: false,
  }
);

export default Asset;
