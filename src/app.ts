import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import routes from "./routes";
import { connectToDatabase } from "./repository/database";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenvFlow.config();

const app: Application = express();

const allowedOrigins = new Set([
  "http://localhost:4200",
  process.env.CLIENT_ORIGIN,
].filter(Boolean) as string[]);

app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);

        if (allowedOrigins.has(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
);

app.use(express.json());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api", routes);

export async function startServer() {
  try {
    await connectToDatabase();

    const PORT = Number(process.env.PORT ?? 4000);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}