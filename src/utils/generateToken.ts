import jwt from "jsonwebtoken";

const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as any,
  });

export default generateToken;
