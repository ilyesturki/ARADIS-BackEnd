import TagAction from "../models/TagAction";
import TagHelper from "../models/TagHelper";
import User from "../models/User";

export interface TagType {
  tagId: string;
  userId: number;
  user: User;
  tagAction: TagAction[];
  tagHelper: TagHelper[];
  zone: string;
  machine: string;
  equipment: string;
  image: string;
  images: string[];
  qrCodeUrl: string;
  status: "open" | "toDo" | "done";
  closeDate: Date;
}
