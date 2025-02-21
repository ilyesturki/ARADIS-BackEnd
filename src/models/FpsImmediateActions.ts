import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import Fps from "./Fps";
import FpsSortingResult from "./SortingResults";
import FpsImmediateAction from "./ImmediateActions";

@Table({
  tableName: "fps_immediate_actions",
  timestamps: true,
})
export class FpsImmediateActions extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.BOOLEAN)
  startSorting?: boolean;

  @Column(DataType.STRING)
  concludeFromSorting?: string;

  @ForeignKey(() => Fps)
  @Column(DataType.INTEGER)
  fpsId!: number;

  @HasMany(() => FpsSortingResult)
  sortingResults!: FpsSortingResult[];

  @HasMany(() => FpsImmediateAction)
  immediateActions!: FpsImmediateAction[];

  @BelongsTo(() => Fps)
  fps!: Fps;
}

export default FpsImmediateActions;
