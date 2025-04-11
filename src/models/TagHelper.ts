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
  import Tag from "./Tag";
  import User from "./User";
  
  @Table({
    tableName: "tag_helpers",
    timestamps: true,
  })
  class TagHelper extends Model {
    @PrimaryKey
    @Unique
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;
  
    @ForeignKey(() => Tag)
    @Column(DataType.STRING)
    tagId!: string;
  
    @BelongsTo(() => Tag)
    tag!: Tag;
  
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    userId!: number;
  
    @BelongsTo(() => User)
    user!: User;
  
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
  
  export default TagHelper;
  