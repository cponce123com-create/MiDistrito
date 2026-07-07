import { Router } from "express";
import authRouter from "../core/auth";
import usersRouter from "../core/users";
import districtsRouter from "../core/districts";
import healthRouter from "../core/health";
import swaggerRouter from "../lib/swagger";

const router = Router();

// Core routes
router.use(authRouter);
router.use(usersRouter);
router.use(districtsRouter);
router.use(healthRouter);
router.use(swaggerRouter);

export default router;
