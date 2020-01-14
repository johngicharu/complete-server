import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkAdmin } from "../middlewares/checkAdmin";

const userRouter = Router();

userRouter.get("/", checkAdmin, UserController.getAll);
userRouter.post("/subscribe", UserController.subscribe);
userRouter.get(
  "/confirm/:confirmationToken",
  UserController.confirmSubscription
);
userRouter.get("/unsubscribe/:confirmationToken?", UserController.unsubscribe);

export default userRouter;
