import { Request, Response } from 'express';
import { loginService, refreshAccessTokenService } from '../services/authService';

/**
 * Handles user login. Validates input, calls loginService, sets refresh token cookie, and returns access token.
 * @param req - Express request object
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const { accessToken, refreshToken } = await loginService(email, password);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.APP_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken });
    } catch (err: any) {
        res.status(401).json({ message: err.message || 'Unauthorized' });
    }
};

/**
 * Handles access token refresh using the refresh token from cookies.
 * @param req - Express request object
 * @param res - Express response object
 */
export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: 'Refresh token required' });

        const accessToken = await refreshAccessTokenService(token);
        res.json({ accessToken });
    } catch (err: any) {
        res.status(401).json({ message: err.message || 'Invalid or expired refresh token' });
    }
};

/**
 * Logs out the user by clearing the authentication cookie.
 * @param req - Express request object
 * @param res - Express response object
 */
export const logout = async (req: Request, res: Response) => {
    // Replace 'refreshToken' with the actual cookie name you use
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', // Adjust path if needed
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
