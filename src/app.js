import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//Configuring custom API responses

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//JSON configuration
app.use(express.json({ limit: "16kb" }));

//Configuring data coming from URL
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//here the extended field is not mandatory. This allows nesting within the encoding

//Configuration for storing public assets such as favicon, images, pdf, etc.
app.use(express.static("public"));

// cookieParser is used to access user's browser cookies from your server and also perform CRUD operations on them.
// Thus configuring for Cookies
app.use(cookieParser());

//routes
import userRouter from "./routes/user.routes.js";

//routes declaration: Using middleware `use`
app.use("/api/v1/users", userRouter);

export { app };
