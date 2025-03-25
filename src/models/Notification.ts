import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import User from "./User";
import Fps from "./Fps";

@Table({ tableName: "notifications", timestamps: true })
class Notification extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  message!: string;

  @Column(DataType.STRING)
  sender!: string; // "System" or a user ID

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number; // Recipient user ID

  @ForeignKey(() => Fps)
  @Column(DataType.INTEGER)
  fpsId!: number; // Related FPS ID (optional)

  @Default("unread")
  @Column(DataType.ENUM("unread", "read"))
  status!: "unread" | "read";

  @Column(DataType.ENUM("High", "Medium", "Low"))
  priority!: "High" | "Medium" | "Low";

  @Column(DataType.STRING)
  actionLink!: string; // A link to FPS details

  @BelongsTo(() => User)
  user!: User;
}

export default Notification;
