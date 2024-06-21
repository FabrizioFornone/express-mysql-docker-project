import { Sequelize } from "sequelize";

const sequelize: Sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    dialect: "mysql",
    logging: console.log,
  }
);

const databaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error: unknown) {
    console.error("Unable to connect to the database:", error);
  }
};

export { sequelize, databaseConnection };
