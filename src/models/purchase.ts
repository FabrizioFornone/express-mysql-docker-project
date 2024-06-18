import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

class Purchase extends Model {
  public purchase_id!: number;
  public user_id!: number;
  public price_cut_id!: number;
  public quantity!: number;
  public total_price!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Purchase.init(
  {
    purchase_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    price_cut_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "price_cuts",
        key: "price_cut_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_price: {
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
    tableName: "purchases",
    sequelize,
    timestamps: false,
  }
);

export default Purchase;
