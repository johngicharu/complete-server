import { Router } from "express";
import MailController from "../controllers/MailController";
import { checkAdmin } from "../middlewares/checkAdmin";
import mailTemplatesRouter from "./mailTemplatesRouter";

const mailRouter = Router();

/*
    Send Subscription Mail
    Send Confirmation Mail
    Receive Messages
    Send Messages
    Reply to Messages

    Send Notifications/multiple emails to multiple users
*/

// Confirmation Emails will be sent via the users' route

mailRouter.post("/newmessage", MailController.newMessage); // Sends messages from clients
mailRouter.post("/send", checkAdmin, MailController.sendEmails); // General Emails (Can be single or one)

// Mail Templates
mailRouter.use("/templates", mailTemplatesRouter);

export default mailRouter;
