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
} from "sequelize-typescript";
import { FpsType } from "../types/FpsType";
import FpsProblem from "./FpsProblem";
import FpsDefensiveAction from "./FpsDefensiveAction";
import FpsImmediateActions from "./FpsImmediateActions";
import FpsCause from "./FpsCause";

@Table({
  tableName: "fps",
  timestamps: true,
})
class Fps extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  fpsId!: string;

  @ForeignKey(() => FpsProblem)
  @Column(DataType.INTEGER)
  problemId!: number;

  @ForeignKey(() => FpsCause)
  @Column(DataType.INTEGER)
  causeId?: number;

  @ForeignKey(() => FpsImmediateActions)
  @Column(DataType.INTEGER)
  immediatActionsId?: number;

  @BelongsTo(() => FpsProblem)
  problem!: FpsProblem;

  @BelongsTo(() => FpsCause)
  cause?: FpsCause;

  @BelongsTo(() => FpsImmediateActions)
  immediatActions?: FpsImmediateActions;

  @HasMany(() => FpsDefensiveAction)
  defensiveActions!: FpsDefensiveAction[];
}

export default Fps;
