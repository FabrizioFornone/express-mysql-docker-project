import express, { Express } from "express";
import dotenv from "dotenv";
import { sequelize, databaseConnection } from "./config/database";
import { router } from "./routes/router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//routes
app.use("/api/", router);

const start = async (): Promise<void> => {
  try {
    await databaseConnection();
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void start();
