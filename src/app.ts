import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import cookieParser from 'cookie-parser';

import { limiter } from "./middlewares/limiter";
import { handleServerError } from "./middlewares/handleServerError";
import healthRouter from "./routes/v1/health";
import seriesRouter from "./routes/v1/series";
import { corsMiddleware } from "./middlewares/cors";
import userRoutes from "./routes/v1/auth";
import chapterRouter from "./routes/v1/chapter";
import categoryRouter from "./routes/v1/categories";
import itemRouter from "./routes/v1/items";
import tagRouter from "./routes/v1/tags";
import bookRouter from "./routes/v1/books";

export const app = express();

export const port = process.env.PORT || 9000;

const apiV1Prefix = process.env.API_V1_PREFIX || "/api/v1";

app.use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(corsMiddleware)
    .use(helmet())
    .use(express.json())
    .use(compression())
    .use(limiter)
    .use(cookieParser());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use(apiV1Prefix, healthRouter);
app.use(apiV1Prefix, seriesRouter);
app.use(apiV1Prefix, userRoutes);
app.use(apiV1Prefix, chapterRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/tags', tagRouter);
app.use('/api/v1/books', bookRouter);

app.use(handleServerError);

if (process.env.APP_ENV === "local") {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}


