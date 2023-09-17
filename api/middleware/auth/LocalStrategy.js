import { Strategy as LocalStrategy } from "passport-local";
import { initClient } from "../../db/mongo.js";

const client = await initClient();
const db = client.db();

export default new LocalStrategy(
  { usernameField: "username", passwordField: "password" },
  async (username, password, done) => {
    try {
      let user = await db.collection("users").findOne({ username });
      if (!user) {
        // If the user is not found, return false to indicate authentication failure
        return done(null, false);
      }

      // Perform password validation here (compare hashed passwords, etc.)
      // If password validation fails, return false as well

      // If the user and password are valid, return the user object to indicate authentication success
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);