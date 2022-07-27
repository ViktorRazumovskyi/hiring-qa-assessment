import "reflect-metadata";

import { Application } from "express";
import { createExpressServer } from "routing-controllers";
import Home from "./controllers/home";
import Auth from "./controllers/auth";
import Protected from "./controllers/protected";
/**
 * Start Server
 */
const expressApp: Application = createExpressServer({
  classTransformer: true,
  routePrefix: "/v3",
  defaultErrorHandler: false,
  middlewares: [
  ],
  controllers: [Home, Auth, Protected],
});
export default expressApp;
export const server = expressApp.listen();