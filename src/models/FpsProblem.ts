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
class FpsProblem extends Model {
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
  pourquoi!: string;

  @Column(DataType.STRING)
  image?: string;

  // Change this machine to use JSON instead of an array of strings
  @Column(DataType.JSON)
  images?: string[];

  @Column(DataType.BOOLEAN)
  clientRisk!: boolean;

  @Column({
    type: DataType.ENUM("machine1", "machine2", "machine3", "machine4"),
    allowNull: false,
    defaultValue: "machine1",
  })
  machine!: "machine1" | "machine2" | "machine3" | "machine4";
}

export default FpsProblem;
