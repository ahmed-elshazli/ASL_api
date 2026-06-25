import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .required(),

  PORT: Joi.number().required(),

  // Database
  MONGO_URI: Joi.string().required(),

  // JWT Access Token
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES: Joi.string().required(),

  // JWT Refresh Token
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES: Joi.string().required(),

  // Global Rate Limiter
  RATE_LIMIT_TTL: Joi.number().default(60000),
  RATE_LIMIT_LIMIT: Joi.number().default(100),

  // Auth Rate Limiter
  AUTH_RATE_LIMIT_TTL: Joi.number().default(60000),
  AUTH_RATE_LIMIT_LIMIT: Joi.number().default(5),

  // Upload Rate Limiter
  UPLOAD_RATE_LIMIT_TTL: Joi.number().default(60000),
  UPLOAD_RATE_LIMIT_LIMIT: Joi.number().default(10),

  // Frontend URL .uri()
  FRONTEND_URL: Joi.string().optional(),
  REDIS_URL:Joi.string().uri().optional(),

});