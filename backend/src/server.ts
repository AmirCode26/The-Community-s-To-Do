import express from "express";
import type  { Request, Response, NextFunction }  from "express";
import cors from "cors";
import morgan from "morgan";

import userRoutes from "./routes/users.routes";
import structureRoutes from "./routes/structures.routes";
import boardRoutes from "./routes/boards.routes";
import postRoutes from "./routes/posts.routes";
import apartmentRoutes from "./routes/apartments.routes";
import zaRoutes from "./routes/zas.routes";
import reportRoutes from "./routes/reports.routes";
import layoutRoutes from "./routes/layouts.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use((req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as string;
    const userStatus = req.headers["x-user-status"] as string;

    if (userId && userRole) {
        req.user = { id: userId, role: userRole, status: userStatus || "ACTIVE" };
    }
    next();
});

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/structures", structureRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/zas", zaRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/layouts", layoutRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error capturado:", err.message);

    if (err.message.includes("NOT_FOUND")) return res.status(404).json({ error: err.message });
    if (err.message.includes("FORBIDDEN") || err.message.includes("ACCESS_DENIED") || err.message.includes("UNAUTHORIZED")) {
        return res.status(403).json({ error: err.message });
    }
    if (err.message.includes("ALREADY_EXISTS")) return res.status(409).json({ error: err.message });

    res.status(400).json({ error: err.message || "Bad Request" });
});

export default app;
