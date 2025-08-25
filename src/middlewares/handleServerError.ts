import { Request, Response, NextFunction } from "express";

export const handleServerError = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error Occured";
    const code = err.code || "INTERNAL_SERVER_ERROR";

    res.status(status).json({
        errors: {
            message,
            code,
        },
       
    });
}
