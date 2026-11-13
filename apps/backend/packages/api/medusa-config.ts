import { loadEnv } from "@medusajs/framework/utils";
import { withMercur } from "@mercurjs/core";
import fs from "fs";
import path from "path";
import { parseBackendEnv } from "./src/config/env";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const env = parseBackendEnv(process.env);

const dashboardAppDir = (name: "admin" | "vendor"): string => {
  const bundled = path.join(__dirname, "dashboards", name);
  return fs.existsSync(bundled)
    ? bundled
    : path.join(__dirname, `../../apps/${name}`);
};

const fileProvider = env.s3
  ? {
      resolve: "@medusajs/medusa/file-s3",
      id: "s3",
      options: {
        file_url: env.s3.fileUrl,
        access_key_id: env.s3.accessKeyId,
        secret_access_key: env.s3.secretAccessKey,
        region: env.s3.region,
        bucket: env.s3.bucket,
        endpoint: env.s3.endpoint,
        // Cloudflare R2 does not support x-amz-acl headers; false omits ACL header.
        acl: false as const,
      },
    }
  : {
      resolve: "@medusajs/medusa/file-local",
      id: "local",
      options: {
        backend_url: env.fileBackendUrl,
      },
    };

module.exports = withMercur({
  projectConfig: {
    databaseUrl: env.databaseUrl,
    redisUrl: env.redisUrl,
    workerMode: env.workerMode,
    http: {
      storeCors: env.storeCors,
      adminCors: env.adminCors,
      vendorCors: env.vendorCors,
      authCors: env.authCors,
      jwtSecret: env.jwtSecret,
      cookieSecret: env.cookieSecret,
    },
  },
  featureFlags: {
    seller_registration: true,
  },
  modules: [
    ...(env.disableDashboards
      ? []
      : [
          {
            resolve: "@mercurjs/core/modules/admin-ui",
            options: {
              appDir: dashboardAppDir("admin"),
              path: "/dashboard",
            },
          },
          {
            resolve: "@mercurjs/core/modules/vendor-ui",
            options: {
              appDir: dashboardAppDir("vendor"),
              path: "/seller",
            },
          },
        ]),
    ...(env.redisUrl
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: { redisUrl: env.redisUrl },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: { redis: { redisUrl: env.redisUrl } },
          },
        ]
      : []),
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [fileProvider],
      },
    },
  ],
});
