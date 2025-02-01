import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  Unique,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  BeforeSave,
} from "sequelize-typescript";
import bcrypt from "bcrypt";

/**
 * User Model
 * Represents the User table in the database.
 */
@Table({
  tableName: "users",
  timestamps: true, // Automatically adds createdAt and updatedAt fields
})
export class User extends Model {
  // User ID (Auto-incremented Primary Key)
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // Matricule (Unique Identifier)
  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mat!: string;

  // First Name
  @AllowNull(false)
  @Column(DataType.STRING)
  firstName!: string;

  // Last Name
  @AllowNull(false)
  @Column(DataType.STRING)
  lastName!: string;

  // Email (Unique and Case-Insensitive)
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    validate: { isEmail: true },
  })
  set email(value: string) {
    this.setDataValue("email", value.toLowerCase());
  }
  get email(): string {
    return this.getDataValue("email");
  }

  // Phone Number
  @AllowNull(false)
  @Column(DataType.STRING)
  phone!: string;

  // Image (With Default Placeholder)
  @AllowNull(true)
  @Column(DataType.STRING)
  image?: string;

  // Password (Hashed before saving)
  @AllowNull(true)
  @Column({
    type: DataType.STRING,
    validate: {
      len: [8, 255],
    },
  })
  password?: string;

  // Role (user or admin)
  @Default("user")
  @AllowNull(false)
  @Column(DataType.ENUM("user", "admin"))
  role!: "user" | "admin";

  // Status (pending, active, inactive)
  @Default("pending")
  @AllowNull(false)
  @Column(DataType.ENUM("pending", "active", "inactive"))
  status!: "pending" | "active" | "inactive";

  // Activation Token
  @AllowNull(true)
  @Column(DataType.STRING)
  activationToken?: string;

  // Activation Token Expiry Date
  @AllowNull(true)
  @Column(DataType.DATE)
  activationTokenExpires?: Date;

  // Password Changed At
  @AllowNull(true)
  @Column(DataType.DATE)
  passwordChangedAt?: Date;

  // Hash password before saving
  @BeforeSave
  static async hashPassword(instance: User) {
    // const salt = process.env.BCRYPT_SALT ? +process.env.BCRYPT_SALT : 10;
    if (instance.password) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }

  // Set default image before saving
  @BeforeSave
  static setDefaultImage(instance: User) {
    if (!instance.image) {
      instance.image = "https://via.placeholder.com/150";
    }
  }
}

// TypeScript Interface for User
export interface UserType {
  id: number;
  mat: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image?: string;
  password?: string;
  role: "user" | "admin";
  status: "pending" | "active" | "inactive";
  activationToken?: string;
  activationTokenExpires?: Date;
  passwordChangedAt?: Date;
}

export default User;

// import mongoose, { Schema, Document } from "mongoose";

// export interface UserType extends Document {
//   _id: mongoose.Types.ObjectId;
//   mat: string; // Matricule (Primary Unique Identifier)
//   firstName: string;
//   lastName: string;
//   email: string; // Required and Unique
//   phone: string; // Required (Not Unique)
//   password?: string;
//   role: "user" | "admin";
//   status: "pending" | "active" | "inactive";
//   activationToken?: string;
//   activationTokenExpires?: Date;
//   passwordChangedAt?: Date; // Track when the password was last changed
// }

// const userSchema = new Schema<UserType>(
//   {
//     mat: {
//       type: String,
//       required: [true, "Matricule is required"],
//       unique: true, // Ensures Matricule is the primary identifier
//       trim: true,
//     },
//     firstName: {
//       type: String,
//       trim: true,
//       required: [true, "First Name is required"],
//     },
//     lastName: {
//       type: String,
//       trim: true,
//       required: [true, "Last Name is required"],
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true, // Ensures email is unique
//       lowercase: true,
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: [true, "Phone number is required"],
//       trim: true,
//     },
//     password: {
//       type: String,
//       minlength: [8, "Password must be at least 8 characters long"],
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     status: {
//       type: String,
//       enum: ["pending", "active", "inactive"],
//       default: "pending",
//     },
//     activationToken: String,
//     activationTokenExpires: Date,
//     passwordChangedAt: {
//       type: Date,
//     },
//   },
//   { timestamps: true }
// );

// const UserModel = mongoose.model<UserType>("User", userSchema);

// export default UserModel;
