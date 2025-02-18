import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import { FpsDefensiveActionType } from "../types/FpsDefensiveActionType";

@Table({
  tableName: "fps_defensive_actions",
  timestamps: true,
})
export class FpsDefensiveAction extends Model<FpsDefensiveActionType> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  procedure!: string;

  @Column(DataType.STRING)
  userCategory!: string;

  @Column(DataType.STRING)
  userService!: string;

  @Column(DataType.STRING)
  quand!: string;
}
