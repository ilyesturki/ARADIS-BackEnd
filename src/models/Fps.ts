import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Unique,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import { FpsType } from "../types/FpsType";
import FpsProblem from "./FpsProblem";
import FpsDefensiveAction from "./FpsDefensiveAction";
import FpsImmediateActions from "./FpsImmediateActions";
import FpsCause from "./FpsCause";
import User from "./User";
import { generateFPSId } from "../utils/generateFPSId";
import FpsHelper from "./FpsHelper";

@Table({
  tableName: "fps",
  timestamps: true,
})
class Fps extends Model {
  @PrimaryKey
  @Unique // Ensure uniqueness
  @Column(DataType.STRING)
  fpsId!: string;

  @BeforeCreate
  static generateFpsId(instance: Fps) {
    if (!instance.fpsId) {
      instance.fpsId = generateFPSId("FPS", 8); // Example: FPS-a1b2c3
    }
  }

  @Column(DataType.STRING)
  qrCodeUrl?: string; // Column to store the QR code URL

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number; // Each FPS belongs to a specific user

  @BelongsTo(() => User)
  user!: User; // Relationship with User

  @ForeignKey(() => FpsProblem)
  @Column(DataType.INTEGER)
  problemId!: number;

  @ForeignKey(() => FpsCause)
  @Column(DataType.INTEGER)
  causeId?: number;

  @ForeignKey(() => FpsImmediateActions)
  @Column(DataType.INTEGER)
  immediatActionsId?: number;

  @BelongsTo(() => FpsProblem)
  problem!: FpsProblem;

  @BelongsTo(() => FpsCause)
  cause?: FpsCause;

  @BelongsTo(() => FpsImmediateActions)
  immediateActions?: FpsImmediateActions;

  @HasMany(() => FpsDefensiveAction)
  defensiveActions!: FpsDefensiveAction[];

  @Column({
    type: DataType.ENUM(
      "problem",
      "immediateActions",
      "cause",
      "defensiveActions",
      "validation"
    ),
    allowNull: false,
    defaultValue: "problem", // Default to the first step
  })
  currentStep!:
    | "problem"
    | "immediateActions"
    | "cause"
    | "defensiveActions"
    | "validation";

  @HasMany(() => FpsHelper)
  fpsHelper!: FpsHelper[];

  @Column({
    type: DataType.ENUM("inProgress", "completed", "failed"),
    allowNull: false,
    defaultValue: "inProgress",
  })
  status!: "inProgress" | "completed" | "failed";

  @Column({
    type: DataType.DATE,
    allowNull: true, // The field is optional and will be set when closed
  })
  closeDate?: Date;

  @BeforeUpdate
  static setCloseDate(instance: Fps) {
    if (
      instance.changed("status") &&
      ["completed", "failed"].includes(instance.status)
    ) {
      instance.closeDate = new Date();
    }
  }
}

export default Fps;
