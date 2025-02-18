import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import {
  FpsImmediateActionsType,
  ImmediatActionsType,
  SortingResultsType,
} from "../types/FpsImmediateActionsType";

@Table({
  tableName: "fps_immediate_actions",
  timestamps: true,
})
export class FpsImmediateActions extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  // Change this to JSONB for more structured data storage
  @Column(DataType.JSON)
  alert?: string[]; // Example structure, customize as needed

  @Column(DataType.BOOLEAN)
  startSorting?: boolean;

  @Column(DataType.JSONB)
  sortingResults?: SortingResultsType[];

  @Column(DataType.STRING)
  concludeFromSorting?: string;

  @Column(DataType.JSONB)
  immediatActions?: ImmediatActionsType[];
}

export default FpsImmediateActions;
