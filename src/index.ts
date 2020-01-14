import "dotenv/config";
import "reflect-metadata";
import { createConnection } from "typeorm";

import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as morgan from "morgan";
import initAdmin from "./init/initAdmin";
import routes from "./routes";

const { SERVER_PORT, SERVER_HOST, NODE_ENV } = process.env;

createConnection(NODE_ENV === "production" ? "default" : "test")
  .then(async connection => {
    console.log(connection.name);
    // Init Server
    const app = express();

    app.use(
      cors({
        origin: "*"
      })
    );
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // User Router
    app.use("/", routes);

    app.listen(SERVER_PORT, () => {
      console.log(`Server started on ${SERVER_HOST}:${SERVER_PORT}`);
    });

    // Init Admin
    initAdmin();
  })
  .catch(error => console.log(error));
