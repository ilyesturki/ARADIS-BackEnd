import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import FpsImmediateActions from "../models/FpsImmediateActions";
import FpsCause from "../models/FpsCause";
import FpsDefensiveAction from "../models/FpsDefensiveAction";
import ImmediateActions from "../models/ImmediateActions";
import SortingResults from "../models/SortingResults";

// Create a single Sequelize instance
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
  models: [
    User,
    Fps,
    FpsProblem,
    FpsImmediateActions,
    FpsCause,
    FpsDefensiveAction,
    ImmediateActions,
    SortingResults,
  ], // Register models here
  logging: false,
});

// Sync database (optional, only for development)
const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Uncomment this in dev mode if you need auto-sync:
    // await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

// Export the singleton instance
export { sequelize, dbConnect };

// import mongoose from "mongoose";

// const dbConnect = () => {
//   mongoose.connect(process.env.DB_URI).then(() => {
//     console.log("Data Base Connected *.* ");
//   });
// };

// export default dbConnect;
