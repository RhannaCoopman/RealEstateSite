import { Router, application } from "express";
import { initClient } from "../db/mongo.js";
import passport from "passport";
import {isUser, isManager, isAdmin} from "../middleware/auth/Roles.js";
import {createUserData, hash} from "../middleware/auth/hash.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import mongoose from "mongoose";
import express from "express";


// Packages to handle images uploads
import imageDownloader from "image-downloader";
import multer from "multer";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);



//Initialize MongoDB client and database:
const client = await initClient();
const db = client.db();

// Connect Mongoose
mongoose.connect(process.env.MONGO_CONNECTION_URL)




const RegularRoutes = (app) => {

  app.post("/login", (req, res, next) => {
      console.log('login started');
      passport.authenticate("local", (err, user) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        if (!user) {
          console.log("User bestaat niet in database");
          return res.status(401).json({ error: "No user found" });
        }
        if(user) {
          console.log(user);
            const givenPassword = hash(user, req.body.password)
            console.log(givenPassword);

            if(givenPassword !== user.password) {
              console.log("Fout wachtwoord");
              return res.status(401).json({ error: "Invalid username or password" });
            }
        }

        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN_HOURS * 60 * 60 }
        );

        console.log("Ingelogd");


        delete user.password
        delete user.salt
        delete user.saltParam
        return res.json({ token, ...user });
      })(req, res, next);
    });
    
  app.post("/register", async (req, res) => {
      const { username, password, email } = req.body;
      console.log("1")

      try {
        console.log("2")

        // Check if the username already exists
        const existingUser = await db.collection("users").findOne({ username });
        if (existingUser) {
          return res.status(400).json({ error: "Username already exists" });
        }

        console.log("3")

        // Create a new user
        const newUser = await UserModel.create({
          username,
          password,
          email,
          role: "user",
          salt,
          saltParam
        })

        console.log("4")

        // Generate a new token for the registered user
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN_HOURS * 60,
        });

        console.log("Registered")

        delete newUser.password
        delete newUser.salt
        delete newUser.saltParam
        res.json({ token, ...newUser });
        
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

  app.use('/uploads', express.static(__dirname + '/uploads'));


  app.post('/uploadByLink', async (req, res) => {
      const {link} = req.body;
      const dirname = "/Users/rhanna/Documents/School 2022-2023/React/MERN_login/api/uploads/";
      console.log(link);


      const newName = 'photo' + Date.now() + '.jpg';

      await imageDownloader.image({
        url: link,
        dest: dirname + newName,
      });
      res.json(newName);
    });
    
    const photosMiddleware = multer({dest: 'uploads/'})
    app.post('/upload',photosMiddleware.array('photos', 100), async (req, res) => {
      const uploadedFiles = [];
      for (let index = 0; index < req.files.length; index++) {
        const {path, originalname} = req.files[index];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    
        uploadedFiles.push(newPath.replace('/uploads', ''));
      }
      res.json(uploadedFiles);
    });

  
}

const UserRoutes = (app) => {
  const userRouter = Router();

  // Apply the "jwt" strategy middleware to all admin routes
  userRouter.use(passport.authenticate("jwt", { session: false, failWithError: true }));

  // Apply the isAdmin middleware to all admin routes after the JWT authentication
  userRouter.use(isUser);

  app.get("/user", isUser ,(req, res) => {
    res.json('user');
  })

  app.use(userRouter);
}

const ManagerRoutes = (app) => {
  const managerRouter = Router();

  // Apply the "jwt" strategy middleware to all admin routes
  managerRouter.use(passport.authenticate("jwt", { session: false, failWithError: true }));

  // Apply the isAdmin middleware to all admin routes after the JWT authentication
  managerRouter.use(isManager);

  app.get("/manager", isManager ,(req, res) => {
    res.json('manager');
  })

  app.use(managerRouter);
}

const AdminRoutes = (app) => {
  const adminRouter = Router();

  // Apply the "jwt" strategy middleware to all admin routes
  adminRouter.use(passport.authenticate("jwt", { session: false, failWithError: true }));

  // Apply the isAdmin middleware to all admin routes after the JWT authentication
  adminRouter.use(isAdmin);

  app.get("/admin", isAdmin ,(req, res) => {
    res.json('admin test');
  })

  app.use(adminRouter);
}

const registerRoutes = async (app) => {

  RegularRoutes(app)
  UserRoutes(app)
  ManagerRoutes(app)
  AdminRoutes(app)

  // Custom error handler middleware to handle JWT authentication errors
  app.use((err, req, res, next) => {
      if (err.name === 'AuthenticationError') {
      res.status(401).json({ error: 'Token expired' });
      } else {
        console.log(err)
      res.status(500).json({ error: 'Internal Server Error' });
      }
  });
}

export { registerRoutes };