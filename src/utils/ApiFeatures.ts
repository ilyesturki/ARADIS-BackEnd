import { Query, Document } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  search?: string;
}

class ApiFeatures<T extends Document> {
  mongooseQuery: Query<T[], T>;
  queryString: QueryString;
  paginationResult: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
  };
  constructor(mongooseQuery: Query<T[], T>, queryString: QueryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter(): this {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ["page", "sort", "limit", "fields", "search"];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createAt");
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName: string): this {
    console.log("search");
    console.log(this.queryString.search);
    console.log(modelName);
    if (this.queryString.search) {
      let query = {};
      if (modelName === "Product") {
        query = {
          $or: [
            {
              title: { $regex: this.queryString.search.trim(), $options: "i" },
            },
            {
              description: {
                $regex: this.queryString.search.trim(),
                $options: "i",
              },
            },
          ],
        };
      } else {
        query = {
          name: { $regex: this.queryString.search.trim(), $options: "i" },
        };
      }
      console.log(query);
      // console.log(this.mongooseQuery.find(query));
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countDocuments: number): this {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 50;
    const skip = (page - 1) * limit;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    const pagination: {
      currentPage: number;
      limit: number;
      numberOfPages: number;
    } = {
      currentPage: page,
      limit: limit,
      numberOfPages: Math.ceil(countDocuments / limit),
    };

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

export default ApiFeatures;
