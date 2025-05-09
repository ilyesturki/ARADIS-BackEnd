import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    Default,
  } from "sequelize-typescript";
  import User from "./User";
  
  @Table({ tableName: "device_tokens", timestamps: true })
  class DeviceToken extends Model {
    @Column({ type: DataType.STRING, allowNull: false })
    token!: string;
  
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId!: number;
  
    @BelongsTo(() => User)
    user!: User;
  
    @Default("expo")
    @Column(DataType.STRING)
    provider!: string;
  
    @Column(DataType.STRING)
    deviceInfo?: string;
  
    @Default(true)
    @Column(DataType.BOOLEAN)
    isActive!: boolean;
  }
  
  export default DeviceToken;
  