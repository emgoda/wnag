import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handlePageSave,
  handlePageExport,
  handlePagePublish,
  handlePageList,
  handlePageGet,
  handlePagesSave,
  handlePagesGet
} from "./routes/page";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Page management API routes
  app.post("/api/page/save", handlePageSave);
  app.get("/api/page/export", handlePageExport);
  app.post("/api/page/publish", handlePagePublish);
  app.get("/api/page/list", handlePageList);
  app.get("/api/page/:id", handlePageGet);

  return app;
}
