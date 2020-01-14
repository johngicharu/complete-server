import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { UserRoles } from "../entity/User";

const { JWT_SECRET } = process.env;

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the jwt token from the head
  const token = req.headers.auth as string;

  jwt.verify(token, JWT_SECRET as string, (err, jwtPayload) => {
    if (err) {
      res.status(401).json({
        success: false,
        message: "Authentication Failed",
        errors: {
          type: "Authentication Failed"
        },
        data: null
      });
      return;
    }

    // The token is valid for 1 hour
    // We want to send a new token on every request
    const { userId, username, email, roles } = jwtPayload as {
      userId: string;
      username: string;
      email: string;
      roles: UserRoles;
    };

    if (roles.includes(UserRoles.ADMIN)) {
      const newToken = jwt.sign(
        { userId, username, email, roles },
        JWT_SECRET as string,
        {
          expiresIn: "1h"
        }
      );
      res.setHeader("token", newToken);
    } else {
      res.status(401).json({
        success: false,
        message: "Authentication Failed",
        errors: {
          type: "Authentication Failed"
        },
        data: null
      });
      return;
    }
  });
  // res.locals.jwtPayload = jwtPayload;

  // Call the next middleware or controller
  next();
};
