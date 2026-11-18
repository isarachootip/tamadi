import { z } from "@medusajs/framework/zod";

const workerModeSchema = z.enum(["shared", "server", "worker"]);

const s3ConfigSchema = z.object({
  fileUrl: z.string().url(),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  region: z.string().min(1).default("auto"),
  bucket: z.string().min(1),
  endpoint: z.string().url().optional(),
});

const rawEnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z
    .string()
    .default("postgres://tamadee:tamadee_dev_only@127.0.0.1:5433/tamadee"),
  REDIS_URL: z.string().optional(),
  MEDUSA_WORKER_MODE: workerModeSchema.default("shared"),
  DISABLE_MEDUSA_ADMIN: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  STORE_CORS: z
    .string()
    .default(
      "https://m.tamadee.online,https://tamdi.tamadee.online,https://webtamdi.tamadee.online,http://localhost:3000,http://localhost:8000,http://localhost:8080"
    ),
  ADMIN_CORS: z
    .string()
    .default(
      "https://bwebtamdi.tamadee.online,http://localhost:7000,http://localhost:9000"
    ),
  VENDOR_CORS: z
    .string()
    .default(
      "https://bwebtamdi.tamadee.online,http://localhost:7001,http://localhost:9000"
    ),
  AUTH_CORS: z
    .string()
    .default(
      "https://m.tamadee.online,https://tamdi.tamadee.online,https://webtamdi.tamadee.online,https://bwebtamdi.tamadee.online,http://localhost:3000,http://localhost:7000,http://localhost:7001,http://localhost:8080,http://localhost:9000"
    ),
  JWT_SECRET: z.string().min(8).default("tamadee_dev_jwt_secret_change_me"),
  COOKIE_SECRET: z
    .string()
    .min(8)
    .default("tamadee_dev_cookie_secret_change_me"),
  FILE_BACKEND_URL: z.string().url().default("http://localhost:9000/static"),
  S3_FILE_URL: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  AI_ASSISTANT_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  VISUAL_SEARCH_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(15),
  MERCUR_BACKEND_URL: z
    .string()
    .url()
    .default("https://bwebtamdi.tamadee.online"),
  LINE_AUTH_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  LINE_NOTIFICATIONS_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  LINE_LOGIN_CHANNEL_ID: z.string().optional(),
  LINE_LOGIN_CHANNEL_SECRET: z.string().optional(),
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: z.string().optional(),
  LINE_MESSAGING_CHANNEL_SECRET: z.string().optional(),
});

export type S3StorageConfig = z.infer<typeof s3ConfigSchema>;

export interface BackendEnv {
  readonly databaseUrl: string;
  readonly redisUrl: string | undefined;
  readonly workerMode: z.infer<typeof workerModeSchema>;
  readonly disableDashboards: boolean;
  readonly storeCors: string;
  readonly adminCors: string;
  readonly vendorCors: string;
  readonly authCors: string;
  readonly jwtSecret: string;
  readonly cookieSecret: string;
  readonly fileBackendUrl: string;
  readonly s3: S3StorageConfig | null;
  readonly aiAssistantEnabled: boolean;
  readonly visualSearchEnabled: boolean;
  readonly geminiApiKey: string | undefined;
  readonly geminiModel: string;
  readonly aiRateLimitPerMinute: number;
  readonly publicBackendUrl: string;
  readonly lineAuthEnabled: boolean;
  readonly lineNotificationsEnabled: boolean;
  readonly lineLoginChannelId: string | undefined;
  readonly lineLoginChannelSecret: string | undefined;
  readonly lineMessagingAccessToken: string | undefined;
  readonly lineMessagingChannelSecret: string | undefined;
}

export function parseBackendEnv(
  source: NodeJS.ProcessEnv = process.env
): BackendEnv {
  const parsed = rawEnvSchema.parse({
    ...source,
    REDIS_URL: source.REDIS_URL?.trim() || undefined,
    S3_BUCKET: source.S3_BUCKET?.trim() || undefined,
    S3_ENDPOINT: source.S3_ENDPOINT?.trim() || undefined,
    GEMINI_API_KEY: source.GEMINI_API_KEY?.trim() || undefined,
    GEMINI_MODEL: source.GEMINI_MODEL?.trim() || undefined,
    AI_RATE_LIMIT_PER_MINUTE:
      source.AI_RATE_LIMIT_PER_MINUTE?.trim() || undefined,
    MERCUR_BACKEND_URL: source.MERCUR_BACKEND_URL?.trim() || undefined,
    LINE_LOGIN_CHANNEL_ID: source.LINE_LOGIN_CHANNEL_ID?.trim() || undefined,
    LINE_LOGIN_CHANNEL_SECRET:
      source.LINE_LOGIN_CHANNEL_SECRET?.trim() || undefined,
    LINE_MESSAGING_CHANNEL_ACCESS_TOKEN:
      source.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN?.trim() || undefined,
    LINE_MESSAGING_CHANNEL_SECRET:
      source.LINE_MESSAGING_CHANNEL_SECRET?.trim() || undefined,
  });

  const s3 = parsed.S3_BUCKET
    ? s3ConfigSchema.parse({
        fileUrl: parsed.S3_FILE_URL,
        accessKeyId: parsed.S3_ACCESS_KEY_ID,
        secretAccessKey: parsed.S3_SECRET_ACCESS_KEY,
        region: parsed.S3_REGION || "auto",
        bucket: parsed.S3_BUCKET,
        endpoint: parsed.S3_ENDPOINT,
      })
    : null;

  return {
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    workerMode: parsed.MEDUSA_WORKER_MODE,
    disableDashboards:
      parsed.DISABLE_MEDUSA_ADMIN || parsed.MEDUSA_WORKER_MODE === "worker",
    storeCors: parsed.STORE_CORS,
    adminCors: parsed.ADMIN_CORS,
    vendorCors: parsed.VENDOR_CORS,
    authCors: parsed.AUTH_CORS,
    jwtSecret: parsed.JWT_SECRET,
    cookieSecret: parsed.COOKIE_SECRET,
    fileBackendUrl: parsed.FILE_BACKEND_URL,
    s3,
    aiAssistantEnabled: parsed.AI_ASSISTANT_ENABLED,
    visualSearchEnabled: parsed.VISUAL_SEARCH_ENABLED,
    geminiApiKey: parsed.GEMINI_API_KEY,
    geminiModel: parsed.GEMINI_MODEL,
    aiRateLimitPerMinute: parsed.AI_RATE_LIMIT_PER_MINUTE,
    publicBackendUrl: parsed.MERCUR_BACKEND_URL.replace(/\/+$/, ""),
    lineAuthEnabled: parsed.LINE_AUTH_ENABLED,
    lineNotificationsEnabled: parsed.LINE_NOTIFICATIONS_ENABLED,
    lineLoginChannelId: parsed.LINE_LOGIN_CHANNEL_ID,
    lineLoginChannelSecret: parsed.LINE_LOGIN_CHANNEL_SECRET,
    lineMessagingAccessToken: parsed.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
    lineMessagingChannelSecret: parsed.LINE_MESSAGING_CHANNEL_SECRET,
  };
}
