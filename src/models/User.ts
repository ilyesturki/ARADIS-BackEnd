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
  HasMany,
  Index,
} from "sequelize-typescript";
import bcrypt from "bcrypt";
import Fps from "./Fps";

/**
 * User Model
 * Represents the User table in the database.
 */
@Table({
  tableName: "users",
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  indexes: [
    {
      unique: true,
      fields: ["mat"],
    },
    {
      unique: true,
      fields: ["email"],
    },
  ],
})
class User extends Model {
  // User ID (Auto-incremented Primary Key)
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // Matricule (Unique Identifier)
  @AllowNull(false)
  @Index({ unique: true })
  @Column(DataType.STRING)
  mat!: string;

  // First Name
  @AllowNull(false)
  @Column(DataType.STRING)
  firstName!: string;

  // Last Name
  @AllowNull(false)
  @Column(DataType.STRING)
  lastName!: string;

  // Email (Unique, Case-Insensitive)
  @AllowNull(false)
  @Index({ unique: true })
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

  @HasMany(() => Fps)
  fpsRecords!: Fps[];
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
