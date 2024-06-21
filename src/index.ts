import express, { Express } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { databaseConnection } from "./config/database";
import swaggerDocs from "./config/swagger";
import { router } from "./routes/router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//routes
app.use("/api", router);

const start = async (): Promise<void> => {
  try {
    await databaseConnection();
    app.listen(port, () => {
      console.log(
        `[server]: Server is running at http://localhost:${port}, go to http://localhost:${port}/api-docs to see the swagger documentation.`
      );
    });
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
};

void start();
