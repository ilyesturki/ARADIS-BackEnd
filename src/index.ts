import path from "path";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import dbConnect from "./config/dbConnect";
import globalError from "./middlewares/globalError";
import ApiError from "./utils/ApiError";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import fpsRoute from "./routes/fpsRoute";
import tagRoute from "./routes/tagRoute";
import notificationRoute from "./routes/notificationRoute";
import { setupWebSocket } from "./websocket";
import User from "./models/User";
import Fps from "./models/Fps";
import Notification from "./models/Notification";
import Tag from "./models/Tag";
import FpsHelper from "./models/FpsHelper";
import FpsComment from "./models/FpsComment";
import SortingResults from "./models/SortingResults";
import ImmediateActions from "./models/ImmediateActions";
import FpsDefensiveAction from "./models/FpsDefensiveAction";
import FpsCause from "./models/FpsCause";
import FpsProblem from "./models/FpsProblem";
import TagAction from "./models/TagAction";
import FpsImmediateActions from "./models/FpsImmediateActions";
import TagHelper from "./models/TagHelper";
import DeviceToken from "./models/DeviceToken";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
export const io = setupWebSocket(server); // ✅ Initialize WebSocket

// ✅ Initialize Sequelize and Models
const sequelize = dbConnect();
sequelize.addModels([
  User,
  Fps,
  Tag,
  TagAction,
  TagHelper,
  FpsProblem,
  FpsImmediateActions,
  FpsCause,
  FpsDefensiveAction,
  ImmediateActions,
  SortingResults,
  FpsComment,
  FpsHelper,
  Notification,
  DeviceToken
]);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    await sequelize.sync();
    console.log("✅ All models synchronized successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
})();

app.use(cors());
app.options("*", cors());
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/fps", fpsRoute); // Pass io instance
app.use("/tag", tagRoute);
app.use("/notifications", notificationRoute);

// Handle undefined routes
app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError("Can't find this route", 404));
});

// ✅ Global Error Handling Middleware
app.use(globalError);

// ✅ Start the Server
const port = parseInt(process.env.PORT || "3000");
server.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

// ✅ Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => {
    console.log("App shutting down...");
    process.exit(1);
  });
});

// import path from "path";
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import dbConnect from "./config/dbConnect";
// import globalError from "./middlewares/globalError";
// import ApiError from "./utils/ApiError";
// import authRoute from "./routes/authRoute";
// import userRoute from "./routes/userRoute";
// import fpsRoute from "./routes/fpsRoute";
// import { Request, Response, NextFunction } from "express";
// import User from "./models/User";
// import Fps from "./models/Fps";
// import FpsProblem from "./models/FpsProblem";
// import FpsImmediateActions from "./models/FpsImmediateActions";
// import FpsCause from "./models/FpsCause";
// import FpsDefensiveAction from "./models/FpsDefensiveAction";
// import ImmediateActions from "./models/ImmediateActions";
// import SortingResults from "./models/SortingResults";
// import FpsComment from "./models/FpsComment";
// import FpsHelper from "./models/FpsHelper";

// dotenv.config({ path: path.resolve(__dirname, "../.env") });

// const app = express();

// // Initialize Sequelize
// const sequelize = dbConnect();
// sequelize.addModels([
//   User,
//   Fps,
//   FpsProblem,
//   FpsImmediateActions,
//   FpsCause,
//   FpsDefensiveAction,
//   ImmediateActions,
//   SortingResults,
//   FpsComment,
//   FpsHelper,
// ]);

// (async () => {
//   try {
//     // Test the database connection
//     await sequelize.authenticate();
//     console.log("✅ Database connection established successfully.");

//     // ⚠️ Do NOT use alter: true to avoid index duplication issues.
//     await sequelize.sync(); // Only sync models without altering
//     console.log("✅ All models synchronized successfully.");
//   } catch (error) {
//     console.error("❌ Unable to connect to the database:", error);
//     process.exit(1); // Exit the process if the DB connection fails
//   }
// })();

// app.use(cors());
// app.options("*", cors());

// app.set("trust proxy", 1);

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/auth", authRoute);
// app.use("/users", userRoute);
// app.use("/fps", fpsRoute);

// // Handle undefined routes
// app.use("*", (req: Request, res: Response, next: NextFunction) => {
//   next(new ApiError("Can't find this route", 404));
// });

// // Global error handling middleware
// app.use(globalError);

// // Start the server
// const port = parseInt(process.env.PORT || "3000");
// const server = app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// // Handle uncaught exceptions
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err);
//   server.close(() => {
//     console.log("App shutting down...");
//     process.exit(1);
//   });
// });
