import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import { FpsProblemType } from "../types/FpsProblemType";

@Table({
  tableName: "fps_problems",
  timestamps: true,
})
class FpsProblem extends Model<FpsProblemType> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(
    DataType.ENUM(
      "Securite",
      "Environnement",
      "Qualite",
      "TRS/Efficience",
      "Maintenence",
      "Autre"
    )
  )
  type!: string;

  @Column(DataType.STRING)
  quoi!: string;

  @Column(DataType.STRING)
  ref!: string;

  @Column(DataType.STRING)
  quand!: string;

  @Column(DataType.STRING)
  ou!: string;

  @Column(DataType.STRING)
  userCategory!: string;

  @Column(DataType.STRING)
  userService!: string;

  @Column(DataType.STRING)
  comment!: string;

  @Column(DataType.STRING)
  combien!: string;

  @Column(DataType.STRING)
  pourqoui!: string;

  @Column(DataType.STRING)
  image?: string;

  @Column(DataType.ARRAY(DataType.STRING))
  images?: string[];

  @Column(DataType.BOOLEAN)
  clientRisck!: boolean;
}

export default FpsProblem;
