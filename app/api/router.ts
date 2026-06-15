import { authRouter } from "./auth-router";
import { scanRouter } from "./routers/scan";
import { reportRouter } from "./routers/report";
import { dashboardRouter } from "./routers/dashboard";
import { settingsRouter } from "./routers/settings";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  scan: scanRouter,
  report: reportRouter,
  dashboard: dashboardRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
