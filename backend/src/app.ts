import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';
import swaggerUi from 'swagger-ui-express';

import routes from './routes';
import {connectToDatabase} from './config/database';
import {swaggerSpec} from './swagger';
import { sendError } from './shared/api-response';
import { VALIDATION_MESSAGES } from './shared/validation-messages';

dotenvFlow.config();

const app: Application = express();

app.disable('x-powered-by');

app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
});

function normalizeOrigin(origin: string): string {
    try {
        return new URL(origin).origin;
    } catch {
        return origin.replace(/\/+$/, "");
    }
}

const allowedOrigins = new Set<string>(
    [
        'http://localhost:4200',
        process.env.CLIENT_ORIGIN
    ].filter(Boolean).map((origin) => normalizeOrigin(origin as string))
);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.has(normalizeOrigin(origin))) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    })
);

app.use(express.json({ limit: '100kb' }));

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.too.large') {
        return sendError(res, 413, VALIDATION_MESSAGES.bodyTooLarge);
    }

    if (err instanceof SyntaxError) {
        return sendError(res, 400, VALIDATION_MESSAGES.malformedJson);
    }

    return next(err);
});

app.get('/', (_req, res) => {
    res.type('text').send('Watch Tracker API is running. See /swagger');
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (_req, res) => {
    res.json(swaggerSpec);
});

app.use('/api', routes);

export async function startServer(): Promise<void> {
    try {
        await connectToDatabase();

        const PORT = Number(process.env.PORT ?? 4000);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
