import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/tasks", async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.get("/api/submissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const submissions = await storage.getSubmissions(req.user.id);
    res.json(submissions);
  });

  app.post("/api/submit", upload.single("code"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const taskId = parseInt(req.body.taskId);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Неверный идентификатор задачи" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Файл с кодом не загружен" });
    }

    const submission = await storage.createSubmission({
      userId: req.user.id,
      taskId,
      code: req.file.buffer.toString(),
      status: "accepted", // For demo, accept all submissions
      submittedAt: new Date(),
    });

    res.json(submission);
  });

  const httpServer = createServer(app);
  return httpServer;
}
