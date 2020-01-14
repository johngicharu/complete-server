import { Router } from "express";

import mailRouter from "./mailRouter";
import userRouter from "./userRouter";
import authRouter from "./authRouter";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/mail", mailRouter);

export default router;
