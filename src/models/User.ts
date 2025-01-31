import mongoose, { Schema, Document } from "mongoose";

export interface UserType extends Document {
  _id: mongoose.Types.ObjectId;
  mat: string; // Matricule (Primary Unique Identifier)
  firstName: string;
  lastName: string;
  email: string; // Required and Unique
  phone: string; // Required (Not Unique)
  password?: string;
  role: "user" | "admin";
  status: "pending" | "active" | "inactive";
  activationToken?: string;
  activationTokenExpires?: Date;
  passwordChangedAt?: Date; // Track when the password was last changed
}

const userSchema = new Schema<UserType>(
  {
    mat: {
      type: String,
      required: [true, "Matricule is required"],
      unique: true, // Ensures Matricule is the primary identifier
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensures email is unique
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
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
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<UserType>("User", userSchema);

export default UserModel;
