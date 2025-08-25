import { Request, Response } from "express";

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({ message: "Service is Good" });
}

export const ping_pong = (_req: Request, res: Response) => {
    res.status(200).send('pong 🏓')
}

export const auth_check = (_req: Request, res: Response) => {
    res.status(200).send('Authenticated')
}