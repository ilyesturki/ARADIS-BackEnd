import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const generateToken = (userId: Types.ObjectId) =>
  jwt.sign(
    { exp: process.env.JWT_EXPIRES_IN, data: userId },
    process.env.JWT_SECRET_KEY
  );

// { userId }, process.env.JWT_SECRET_KEY, {
//   expiresIn: process.env.JWT_EXPIRES_IN,
// }
export default generateToken;
