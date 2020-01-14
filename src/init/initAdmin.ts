import { User, UserRoles } from "../entity/User";
import { Repository, getConnectionManager } from "typeorm";
import { MailTemplate } from "../entity/MailTemplate";

const initAdmin = async () => {
  const { ADMINPSW, ADMINEMAIL, ADMINUSERNAME, NODE_ENV } = process.env;
  const manager = getConnectionManager().get(
    NODE_ENV === "production" ? "default" : "test"
  );
  const userRepository: Repository<User> = manager.getRepository(User);
  //   const admin = User.findOne({ where: { email: ADMINEMAIL } });
  const admin = await userRepository.findOne({ where: { email: ADMINEMAIL } });
  const mailTemplateRepository: Repository<MailTemplate> = manager.getRepository(
    MailTemplate
  );
  const defaultTemplate = await mailTemplateRepository.findOne({
    where: { title: "default" }
  });

  if (!admin) {
    const adminUser = new User();

    adminUser.username = ADMINUSERNAME as string;
    adminUser.email = ADMINEMAIL as string;
    adminUser.password = ADMINPSW as string;
    adminUser.roles = [UserRoles.ADMIN];

    await userRepository.save(adminUser);
    console.log("Admin Created");
  }

  if (!defaultTemplate) {
    const mailTemplate = new MailTemplate();
    mailTemplate.title = "default";
    mailTemplate.template = `<html>

    <head>
        <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
        <style>
            html,
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 14px;
                line-height: 1.5;
                font-weight: 300;
            }
    
            header {
                width: 100%;
                max-height: 10rem;
                height: 6rem;
                margin: 0 1em .5em;
                background-position: center;
                background-size: cover;
            }
        </style>
    </head>
    
    <body>
        <header style="background-image: url('{{site_image}}')">
        </header>
        <main>
            <h1>{{title}}</h1>
            <h3>Hi, {{username}}, <br /></h3>
            <div>
                {{{message}}}
            </div>
            Regards, <br />
            {{sitename}}
        </main>
    </body>
    
    </html>`;
    mailTemplate.templateVars = "username, message, title";
    await mailTemplateRepository.save(mailTemplate);
    console.log("Default Template Created");
  }

  return console.log("Admin and Default Template Present");
};

export default initAdmin;
