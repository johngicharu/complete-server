import * as nodemailer from "nodemailer";
import { Request, Response } from "express";
import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import Mail = require("nodemailer/lib/mailer");

interface Recipient {
  email: string;
  locals: any;
}

interface EmailResponse {
  rejected: Array<{ email: string; message: any }>;
  accepted: string[];
}

interface EmailData {
  subject: string;
  template?: string;
  recipients: Recipient[];
}

class MailController {
  static sendEmails = async (req: Request, res: Response) => {
    const response: EmailResponse = { rejected: [], accepted: [] };
    const data: EmailData = req.body;
    if (data.recipients) {
      return data.recipients.forEach(async (recipient: Recipient, index) => {
        const mailer = new MailController();

        const source = fs.readFileSync(
          path.join(
            __dirname,
            `../../../templates/${
              data.template ? data.template : "default"
            }.hbs`
          ),
          "utf8"
        );

        const template = Handlebars.compile(source);
        if (recipient.locals) {
          recipient.locals.sitename = process.env.SITENAME as string;
          recipient.locals.site_image = process.env.SITE_IMAGE as string;
        }

        const mailOptions: Mail.Options = {
          from: `${process.env.MAILER_ID} <${process.env.MAILER_USERNAME}>`,
          to: recipient.email,
          subject: `${data.subject}`,
          html: template(recipient.locals)
        };

        await mailer
          .send(mailer.transporter, mailOptions)
          .then(() => {
            response.accepted.push(recipient.email);
          })
          .catch(err => {
            response.rejected.push({ email: recipient.email, message: err });
          });

        return (
          index === data.recipients.length - 1 &&
          (response.accepted.includes(recipient.email) ||
            response.rejected.some(item => item.email === recipient.email)) &&
          res.status(200).json({
            success:
              response.accepted.length === data.recipients.length
                ? true
                : false,
            data: response
          })
        );
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data
      });
    }
  };

  static newMessage = async () => {
    console.log("Yes");
  };

  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD
      }
    });
  }

  async sendMail({
    to,
    subject,
    locals,
    template
  }: {
    to: string;
    subject: string;
    locals: any;
    template: string;
  }) {
    const source = fs.readFileSync(
      path.join(
        __dirname,
        `../../../templates/${template ? template : "default"}.hbs`
      ),
      "utf8"
    );

    const hbsTemplate = Handlebars.compile(source);

    // Preloaded settings
    locals.sitename = process.env.SITENAME as string;

    const options = {
      from: `${process.env.SITENAME as string} <${process.env
        .MAILER_USERNAME as string}>`,
      to,
      subject,
      html: hbsTemplate(locals)
    };

    return this.transporter.sendMail(options, (err: any, info) => {
      const response: { rejected: any[]; accepted: any[] } = {
        accepted: [],
        rejected: []
      };
      if (err) {
        if (err.rejected.length !== 0) {
          response.rejected.push(err.rejected[0]);
        }
        // return console.log("error", JSON.stringify(err), { tags: "email" });
      }
      if (info) {
        // console.log(info.accepted[0]);
        response.accepted.push(info.accepted[0]);
        // return console.log("info", JSON.stringify(info), { tags: "email" });
      }
      //   console.log(response);
      return null;
    });
  }

  private send = (transporter: nodemailer.Transporter, mailOptions: any) => {
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(info);
        }
      });
    });
  };
}

export default MailController;
