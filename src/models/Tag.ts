import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  Unique,
  BeforeCreate,
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
  @Unique 
  @Column(DataType.STRING)
  tagId!: string;

  @BeforeCreate
  static generateTagId(instance: Tag) {
    if (!instance.tagId) {
      instance.tagId = generateId("TAG", 8); 
    }
  }

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number; 

  @BelongsTo(() => User)
  user!: User; 

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

  @Column(DataType.JSON)
  images?: string[];
 
  @Column(DataType.STRING)
  qrCodeUrl?: string; 

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
    allowNull: true, 
  })
  closeDate?: Date;
}

export default Tag;
