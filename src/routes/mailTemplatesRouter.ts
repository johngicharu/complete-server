import { Router } from "express";
import MailTemplatesController from "../controllers/MailTemplatesController";
import { checkAdmin } from "../middlewares/checkAdmin";

const mailTemplatesRouter = Router();

// Mail Templates
mailTemplatesRouter.get("/", checkAdmin, MailTemplatesController.getTemplate);
mailTemplatesRouter.post(
  "/",
  checkAdmin,
  MailTemplatesController.createTemplate
);
mailTemplatesRouter.patch(
  "/",
  checkAdmin,
  MailTemplatesController.updateTemplate
);
mailTemplatesRouter.delete(
  "/",
  checkAdmin,
  MailTemplatesController.deleteTemplate
);

export default mailTemplatesRouter;
