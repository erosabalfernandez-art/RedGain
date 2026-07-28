import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/payments", paymentsRouter);
router.use("/admin", adminRouter);

export default router;
