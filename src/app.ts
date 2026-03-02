import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';
import routes from './routes';

dotenvFlow.config();

const app: Application = express();
app.use('/api', routes);

export function startServer() {
  const PORT: number = parseInt(process.env.PORT || '4000');

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}