import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import routes from "./routes";
import { connectToDatabase } from "./repository/database";

dotenvFlow.config();

const app: Application = express();

app.use(express.json());
app.use("/api", routes);

export async function startServer() {
  try {
    // Connect to DB before starting server
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