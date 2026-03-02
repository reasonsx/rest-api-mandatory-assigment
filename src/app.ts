import express, { Application } from 'express';
import dotenvFlow from 'dotenv-flow';


dotenvFlow.config();

// express app
const app: Application = express();