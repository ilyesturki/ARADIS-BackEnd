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
import FpsImmediateActions from "./FpsImmediateActions";

@Table({
  tableName: "fps_sorting_results",
  timestamps: true,
})
export class SortingResults extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  product!: string;

  @Column(DataType.STRING)
  sortedQuantity!: string;

  @Column(DataType.STRING)
  quantityNOK!: string;

  @Column(DataType.STRING)
  userCategory!: string;

  @Column(DataType.STRING)
  userService!: string;

  @ForeignKey(() => FpsImmediateActions)
  @Column(DataType.INTEGER)
  immediateActionsId!: number;

  @BelongsTo(() => FpsImmediateActions)
  immediateActions!: FpsImmediateActions;
}

export default SortingResults;
