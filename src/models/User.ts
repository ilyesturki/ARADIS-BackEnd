import mongoose, { Schema, Document } from "mongoose";

export interface UserType extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  status: "pending" | "active" | "inactive";
  activationToken?: string;
  activationTokenExpires?: Date;
}

const userSchema = new Schema<UserType>(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "First Name required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last Name required"],
    },
    email: {
      type: String,
      required: [true, "Email required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [8, "Too short password"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    activationToken: String,
    activationTokenExpires: Date,
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserType>("User", userSchema);

export default UserModel;
