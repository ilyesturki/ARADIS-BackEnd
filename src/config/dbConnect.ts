import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import FpsImmediateActions from "../models/FpsImmediateActions";
import FpsCause from "../models/FpsCause";
import FpsDefensiveAction from "../models/FpsDefensiveAction";
import ImmediateActions from "../models/ImmediateActions";
import SortingResults from "../models/SortingResults";
import FpsComment from "../models/FpsComment";
import FpsHelper from "../models/FpsHelper";
import Notification from "../models/Notification";
import Tag from "../models/Tag";
import TagAction from "../models/TagAction";

const dbConnect = () => {
  const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "mydb",
    port: Number(process.env.DB_PORT) || 3306,
    models: [
      User,
      Fps,
      Tag,
      TagAction,
      FpsProblem,
      FpsImmediateActions,
      FpsCause,
      FpsDefensiveAction,
      ImmediateActions,
      SortingResults,
      FpsComment,
      FpsHelper,
      Notification,
    ], // Register models here
    logging: false,
  });

  return sequelize;
};

export default dbConnect;
