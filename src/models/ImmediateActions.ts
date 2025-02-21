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
  tableName: "fps_immediate_action_items",
  timestamps: true,
})
export class ImmediateActions extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.STRING)
  action!: string;

  @ForeignKey(() => FpsImmediateActions)
  @Column(DataType.INTEGER)
  immediateActionsId!: number;

  @BelongsTo(() => FpsImmediateActions)
  immediateActions!: FpsImmediateActions;
}

export default ImmediateActions;
