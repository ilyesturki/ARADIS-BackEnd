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
import Tag from "./Tag";

@Table({
  tableName: "tag_actions",
  timestamps: true,
})
class TagAction extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Tag)
  @Column(DataType.STRING)
  tagId!: string;

  @BelongsTo(() => Tag)
  tag!: Tag;

  @Column(DataType.STRING)
  procedure!: string;

  @Column(DataType.STRING)
  userCategory!: string;

  @Column(DataType.STRING)
  userService!: string;

  @Column(DataType.STRING)
  quand!: string;
}

export default TagAction;


