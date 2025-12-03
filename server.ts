/**
 * Deno server for Necromunda Tactical Auspex
 * Serves the static HTML/CSS/JS files
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.208.0/http/file_server.ts";

const PORT = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let filepath = url.pathname;

  // Default to index.html
  if (filepath === "/") {
    filepath = "/index.html";
  }

  // Map routes to files
  const fileMap: Record<string, string> = {
    "/": "./index.html",
    "/index.html": "./index.html",
    "/styles.css": "./styles.css",
    "/app.js": "./app.js",
    "/scenarios.js": "./scenarios.js",
  };

  const targetFile = fileMap[filepath];

  if (targetFile) {
    try {
      const response = await serveFile(req, targetFile);
      return response;
    } catch (error) {
      console.error(`Error serving ${targetFile}:`, error);
      return new Response("File not found", { status: 404 });
    }
  }

  return new Response("Not found", { status: 404 });
}

console.log(`🎲 Necromunda Tactical Auspex running on http://localhost:${PORT}`);
console.log(`📡 The Emperor Protects`);

await serve(handler, { port: PORT });
