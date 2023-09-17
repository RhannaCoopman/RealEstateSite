import "dotenv/config";
import express from "express";
import { initClient } from "./db/mongo.js";
import { registerRoutes } from "./routes/routes.js";
import { registerMiddleware } from "./middleware/index.js";
import passport from "passport";
import  LocalStrategy from "./middleware/auth/LocalStrategy.js";
import JwtStrategy from "./middleware/auth/JwtStrategy.js";

//Create an Express app:
const app = express();

// Get variabeles from .env
const PORT = process.env.PORT;
const APP_URL = process.env.APP_URL;

//Register middleware:
registerMiddleware(app);

//Initialize MongoDB client and database:
app.use(passport.initialize());
// Use LocalStrategy to verify the user credentials locally
passport.use("local", LocalStrategy);

// Use JwtStrategy to verify the user credentials with a JWT token
passport.use("jwt", JwtStrategy);

// Register routes so they can be used
registerRoutes(app);

//Start the server and handle server crashes:
const server = app.listen(PORT, () => {
  console.log(`App listening at ${APP_URL}:${PORT}`);
});

const closeServer = () => {
  server.close();
  // close the MongoDB client here if needed
  process.exit();
};

process.on("SIGINT", () => closeServer());
process.on("SIGTERM", () => closeServer());