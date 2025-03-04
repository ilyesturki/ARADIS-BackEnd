import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { FpsCommentType } from "../types/FpsCommentType";
import Fps from "./Fps";
import User from "./User";

@Table({
  tableName: "fps_comments",
  timestamps: true,
})
class FpsComment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Fps)
  @Column(DataType.STRING) // ✅ Should match Fps.fpsId type
  fpsId!: string;

  @BelongsTo(() => Fps)
  fps!: Fps;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User)
  user!: User; // Relationship with User

  @Column(DataType.STRING)
  comment!: string;

  @Column(DataType.STRING)
  date!: string;

  @Column(DataType.INTEGER)
  rating!: number;
}

export default FpsComment;
