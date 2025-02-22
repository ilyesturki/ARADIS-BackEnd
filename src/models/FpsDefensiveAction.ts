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
import { FpsDefensiveActionType } from "../types/FpsDefensiveActionType";
import Fps from "./Fps";

@Table({
  tableName: "fps_defensive_actions",
  timestamps: true,
})
class FpsDefensiveAction extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Fps)
  @Column(DataType.STRING)
  fpsId!: string;

  @BelongsTo(() => Fps)
  fps!: Fps;

  @Column(DataType.STRING)
  procedure!: string;

  @Column(DataType.STRING)
  userCategory!: string;

  @Column(DataType.STRING)
  userService!: string;

  @Column(DataType.STRING)
  quand!: string;
}

export default FpsDefensiveAction;
