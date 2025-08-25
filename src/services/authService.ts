import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils';

const prisma = new PrismaClient();

export const loginService = async (username: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) throw new Error('Invalid credentials');

    const payload = { userId: user.id };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Optional: Save refreshToken in DB
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });

    return { accessToken, refreshToken };
};

export const refreshAccessTokenService = async (refreshToken: string) => {
    try {
        const payload = verifyRefreshToken(refreshToken) as { userId: string };

        // Optional: Validate the token against DB
        const user = await prisma.user.findUnique({
            where: { id: parseInt(payload.userId) },
        });
        if (!user || user.refreshToken !== refreshToken) throw new Error('Invalid refresh token');

        return generateAccessToken({ userId: payload.userId });
    } catch (err) {
        throw new Error('Invalid or expired refresh token');
    }
};
