import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { Repository, getConnectionManager } from "typeorm";
import { User, UserRoles } from "../entity/User";
import * as bcrypt from "bcryptjs";

class AuthController {
	static confirmToken = async (req: Request, res: Response) => {
		const { jwtToken } = req.body;
		jwt.verify(
			jwtToken,
			process.env.JWT_SECRET as string,
			(err: any, decoded: any) => {
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
				res.status(200).json({
					succes: true,
					message: "User Successfully Logged In",
					errors: null,
					data: decoded
				});
			}
		);
	};

	static login = async (req: Request, res: Response) => {
		// Check if username and password are set
		const { email, password } = req.body;
		const { JWT_SECRET } = process.env;

		if (!(email && password)) {
			return res.status(400).json({
				success: false,
				message: "Authorization Failed"
			});
		}

		// Check if encrypted password match
		const manager = getConnectionManager().get(
			process.env.NODE_ENV === "production" ? "default" : "test"
		);
		const userRepository: Repository<User> = manager.getRepository(User);
		const admin = await userRepository.findOne({ where: { email } });
		const isMatch = admin
			? bcrypt.compareSync(password, admin.password as string)
			: false;

		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Authorization Failed"
			});
		}

		const token = jwt.sign(
			{
				username: (admin as User).username,
				email: (admin as User).email,
				userId: (admin as User).id,
				roles: (admin as User).roles
			},
			JWT_SECRET as string,
			{
				expiresIn: "1h"
			}
		);

		if (admin?.roles.includes(UserRoles.ADMIN)) {
			return res.status(200).json({
				success: true,
				message: "Authorization Successful",
				token
			});
		} else {
			return res.status(401).json({
				success: false,
				message: "Authorization Failed"
			});
		}
	};
}
export default AuthController;
