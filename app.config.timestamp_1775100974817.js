// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
var app_config_default = defineConfig({
  server: {
    preset: "node-server",
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3e3
  },
  tsr: {
    routesDirectory: "./app/routes",
    generatedRouteTree: "./app/routeTree.gen.ts"
  }
});
export {
  app_config_default as default
};
