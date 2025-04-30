import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Unique,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import User from "./User";
import { generateId } from "../utils/generateId";
import TagAction from "./TagAction";
import TagHelper from "./TagHelper";

@Table({
  tableName: "tag",
  timestamps: true,
})
class Tag extends Model {
  @PrimaryKey
  @Unique // Ensure uniqueness
  @Column(DataType.STRING)
  tagId!: string;

  @BeforeCreate
  static generateTagId(instance: Tag) {
    if (!instance.tagId) {
      instance.tagId = generateId("TAG", 8); // Example: TAG-a1b2c3
    }
  }

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number; // Each TAG belongs to a specific user

  @BelongsTo(() => User)
  user!: User; // Relationship with User

  @Column(DataType.STRING)
  zone!: string;

  @Column(DataType.STRING)
  machine!: string;

  @Column(DataType.STRING)
  equipment!: string;

  @Column(DataType.STRING)
  description!: string;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.ENUM("Normal", "Urgent", "T.Urgent"))
  priority!: "Normal" | "Urgent" | "T.Urgent";

  @Column(DataType.STRING)
  image?: string;

  // Change this line to use JSON instead of an array of strings
  @Column(DataType.JSON)
  images?: string[];

  @Column(DataType.STRING)
  qrCodeUrl?: string; // Column to store the QR code URL

  @HasMany(() => TagAction)
  tagAction!: TagAction[];

  @HasMany(() => TagHelper)
  tagHelper!: TagHelper[];

  @Column({
    type: DataType.ENUM("open", "toDo", "done"),
    allowNull: false,
    defaultValue: "open",
  })
  status!: "open" | "toDo" | "done";

  @Column({
    type: DataType.DATE,
    allowNull: true, // The field is optional and will be set when closed
  })
  closeDate?: Date;
}

export default Tag;
