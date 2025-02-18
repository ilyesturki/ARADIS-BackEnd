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
export class FpsCause extends Model<FpsCauseType> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.ARRAY(DataType.STRING))
  causeList!: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  whyList!: string[];
}
