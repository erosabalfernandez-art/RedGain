import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import adminRouter from "./admin";
import postbackRouter from "./postback";
import walletRouter from "./wallet";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);

router.use("/postback", postbackRouter);
router.use(walletRouter);

export default router;
