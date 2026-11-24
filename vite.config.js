import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";

function normalizeSiteUrl(value) {
  return String(value || "https://andreacarrillo-portafolio.netlify.app").replace(/\/+$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = normalizeSiteUrl(
    process.env.VITE_SITE_URL ||
      process.env.URL ||
      env.VITE_SITE_URL ||
      (mode === "production" ? "https://andreacarrillo-portafolio.netlify.app" : "http://localhost:5173"),
  );

  return {
    base: "/",
    plugins: [
      react(),
      {
        name: "inject-site-url",
        transformIndexHtml(html) {
          return html.replaceAll("__SITE_URL__", siteUrl);
        },
      },
    ],
  };
});
