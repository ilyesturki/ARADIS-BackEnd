import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import FpsImmediateActions from "../models/FpsImmediateActions";
import FpsCause from "../models/FpsCause";
import FpsDefensiveAction from "../models/FpsDefensiveAction";

const dbConnect = () => {
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
    ], // Direct reference to models
    logging: false,
  });

  return sequelize;
};

export default dbConnect;

// import mongoose from "mongoose";

// const dbConnect = () => {
//   mongoose.connect(process.env.DB_URI).then(() => {
//     console.log("Data Base Connected *.* ");
//   });
// };

// export default dbConnect;
