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
import { FpsType } from "../types/FpsType";
import { FpsProblem } from "./FpsProblem";
import { FpsDefensiveAction } from "./FpsDefensiveAction";
import { FpsImmediateActions } from "./FpsImmediateActions";
import { FpsCause } from "./FpsCause";

@Table({
  tableName: "fps",
  timestamps: true,
})
class Fps extends Model{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  fpsId!: string;

  @ForeignKey(() => FpsProblem)
  @Column(DataType.INTEGER)
  problemId!: number;

  @ForeignKey(() => FpsDefensiveAction)
  @Column(DataType.INTEGER)
  defensiveActionsId?: number;

  @ForeignKey(() => FpsCause)
  @Column(DataType.INTEGER)
  causeId?: number;

  @ForeignKey(() => FpsImmediateActions)
  @Column(DataType.INTEGER)
  immediatActionsId?: number;

  @BelongsTo(() => FpsProblem)
  problem!: FpsProblem;

  @BelongsTo(() => FpsDefensiveAction)
  defensiveActions?: FpsDefensiveAction;

  @BelongsTo(() => FpsCause)
  cause?: FpsCause;

  @BelongsTo(() => FpsImmediateActions)
  immediatActions?: FpsImmediateActions;
}

export default Fps;
