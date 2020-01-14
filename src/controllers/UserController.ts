import { Request, Response } from "express";
import { Repository, getConnectionManager } from "typeorm";
import { User, UserRoles } from "../entity/User";
import { verify, sign, decode } from "jsonwebtoken";
import MailController from "./MailController";

class UserController {
  static getAll = async (_: Request, res: Response) => {
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const userRepository: Repository<User> = manager.getRepository(User);
    const users = await userRepository.find();

    res.status(200).json({
      success: true,
      message: "Successfully fetched users",
      users: users.map(user => {
        delete user.password;
        return user;
      }),
      errors: null
    });
  };

  static confirmSubscription = async (req: Request, res: Response) => {
    verify(
      req.params.confirmationToken,
      process.env.JWT_SECRET as string,
      async (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).send("Confirmation link expired");
          } else {
            return res
              .status(500)
              .send("There was an error processing your request");
          }
        }

        const decodedData = decoded as {
          id: string;
          username: string;
          email: string;
          exp: number;
          iat: number;
        };

        if (decodedData) {
          const manager = getConnectionManager().get(
            process.env.NODE_ENV === "production" ? "default" : "test"
          );
          const userRepository: Repository<User> = manager.getRepository(User);

          const user = await userRepository.findOne({
            where: { email: decodedData.email }
          });

          if (user) {
            user.subscribed = true;
            user.roles = [UserRoles.SUBSCRIBER];
            await userRepository.update(user.id, user);
            return res.status(200).send("User successfully confirmed");
          } else {
            return res
              .status(500)
              .send("There was an error processing your request");
          }
        } else {
          return res
            .status(500)
            .send("There was an error processing your request");
        }
      }
    );
  };

  static subscribe = async (req: Request, res: Response) => {
    const { email, firstName, lastName } = req.body.newUser;
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const userRepository: Repository<User> = manager.getRepository(User);

    const userFound = await userRepository.findOne({ where: { email } });

    if (!userFound) {
      const newUser = new User();
      newUser.email = email;
      newUser.username = `${firstName} ${lastName}`;
      await userRepository.save(newUser);

      const url = sign(
        { id: newUser.id, username: newUser.username, email: newUser.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "15m"
        }
      );

      const mailer = new MailController();
      const mailOptions = {
        to: newUser.email,
        subject: "Please verify your email address for " + process.env.SITENAME,
        template: "subscription",
        locals: {
          username: newUser.username,
          url: `${process.env.CLIENT_HOST}/confirm/${url}`,
          unsubUrl: `${process.env.CLIENT_HOST}/unsubscribe/${url}`
        }
      };

      mailer.sendMail(mailOptions);

      res.status(200).json({
        message:
          "Successfully Subscribed, check your email for more instructions",
        success: true,
        errors: null
      });
    } else {
      res.status(200).json({
        message: "There was an error processing your request.",
        success: false,
        errors: null
      });
    }
  };

  static unsubscribe = async (req: Request, res: Response) => {
    const { email } = req.body.newUser || decode(req.params.confirmationToken);
    const manager = getConnectionManager().get(
      process.env.NODE_ENV === "production" ? "default" : "test"
    );
    const userRepository: Repository<User> = manager.getRepository(User);

    const userFound = await userRepository.findOne({ where: { email } });

    if (userFound) {
      await userRepository.update(userFound.id, { roles: [UserRoles.VISITOR] });

      const unsubUrl = sign(
        {
          id: userFound.id,
          username: userFound.username,
          email: userFound.email
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "15m"
        }
      );

      const mailer = new MailController();
      const mailOptions = {
        to: userFound.email,
        subject: "Sorry to see you go...",
        template: "unsubscribe",
        locals: {
          username: userFound.username,
          url: `${process.env.CLIENT_HOST}/confirm/${unsubUrl}`,
          unsubUrl: `${process.env.CLIENT_HOST}/unsubscribe/${unsubUrl}`
        }
      };

      mailer.sendMail(mailOptions);

      res.status(200).send("You were successfully unsubscribed.");
    } else {
      res.status(200).send("You were successfully unsubscribed.");
    }
  };
}

export default UserController;
