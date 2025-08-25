import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
	windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 環境変数から取得（ミリ秒）
	limit: Number(process.env.RATE_LIMIT_LIMIT) || 100, // 環境変数から取得
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})