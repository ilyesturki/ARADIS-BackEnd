import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Unique,
  CreatedAt,
  UpdatedAt,
  AutoIncrement,
} from "sequelize-typescript";
import Fps from "./Fps";
import User from "./User";

@Table({
  tableName: "fps_helpers",
  timestamps: true,
})
class FpsHelper extends Model {
  @PrimaryKey
  @Unique
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Fps)
  @Column(DataType.STRING)
  fpsId!: string;

  @BelongsTo(() => Fps)
  fps!: Fps;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column({ type: DataType.JSON, allowNull: false, defaultValue: [] })
  roles!: ("immediate" | "sorting" | "defensive")[]; // e.g. ['immediate', 'sorting', 'defensive']

  @Column({
    type: DataType.ENUM("unscanned", "scanned"),
    defaultValue: "unscanned",
  })
  scanStatus!: "unscanned" | "scanned";

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default FpsHelper;
