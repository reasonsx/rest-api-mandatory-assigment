import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import routes from "./routes";
import { connectToDatabase } from "./repository/database";
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from "./swagger";

dotenvFlow.config();

const app: Application = express();

// Angular dev server
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));

app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/api", routes);

export async function startServer() {
  try {
    await connectToDatabase();

    const PORT: number = parseInt(process.env.PORT || "4000");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}