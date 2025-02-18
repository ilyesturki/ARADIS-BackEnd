import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import { FpsImmediateActionsType } from "../types/FpsImmediateActionsType";

@Table({
  tableName: "fps_immediate_actions",
  timestamps: true,
})
export class FpsImmediateActions extends Model<FpsImmediateActionsType> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.ARRAY(DataType.STRING))
  alert?: string[];

  @Column(DataType.BOOLEAN)
  startSorting?: boolean;

  @Column(DataType.JSONB)
  sortingResults?: object; // Should be `SortingResultsType[]` but needs JSON support

  @Column(DataType.STRING)
  concludeFromSorting?: string;

  @Column(DataType.JSONB)
  immediatActions?: object; // Should be `ImmediatActionsType[]`
}


export default FpsImmediateActions;
