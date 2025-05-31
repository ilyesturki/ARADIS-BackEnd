import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import { FpsCauseType } from "../types/FpsCauseType";

@Table({
  tableName: "fps_causes",
  timestamps: true,
})
export class FpsCause extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.JSON)
  causeList!: string[];

  @Column(DataType.JSON)
  whyList!: string[];
}

export default FpsCause;
