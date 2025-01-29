import { Request } from "express";

const parseArrays = (req: Request, fields) => {
  const parsedArrays = {};

  fields.forEach((field) => {
    if (req.body[field]) {
      try {
        if (field === "images") {
          const imagesArray = req.body[field].split(",");
          for (const image of imagesArray) {
            if (typeof image !== "string") {
              throw new Error();
            }
          }
          parsedArrays[field] = imagesArray;
        } else {
          parsedArrays[field] = JSON.parse(req.body[field]);
        }
      } catch (err) {
        parsedArrays[field] = [];
      }
    }
  });

  return parsedArrays;
};

export default parseArrays;
