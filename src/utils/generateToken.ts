import jwt from "jsonwebtoken";

const generateToken = (payload: string) =>
  jwt.sign({ payload }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as any,
  });
// jwt.sign(
//   { exp: process.env.JWT_EXPIRES_IN, data: userId },
//   process.env.JWT_SECRET_KEY
// );

// { userId }, process.env.JWT_SECRET_KEY, {
//   expiresIn: process.env.JWT_EXPIRES_IN,
// }
export default generateToken;
