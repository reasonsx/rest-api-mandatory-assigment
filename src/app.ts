import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes';
import { connect } from 'node:http2';
import { connectToDatabase } from './repository/database';

dotenvFlow.config();

const app: Application = express();
app.use('/api', routes);

export function startServer() {
    connectToDatabase();
    // testConnection();

  const PORT: number = parseInt(process.env.PORT || '4000');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}