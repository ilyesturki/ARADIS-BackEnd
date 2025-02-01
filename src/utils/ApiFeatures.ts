import { FindOptions, Op, Model } from "sequelize";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  search?: string;
}

class ApiFeatures<T extends Model> {
  queryOptions: FindOptions = {};
  queryString: QueryString;
  paginationResult: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
  } = { currentPage: 1, limit: 50, numberOfPages: 1 };

  constructor(queryString: QueryString) {
    this.queryString = queryString;
  }

  filter(): this {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ["page", "sort", "limit", "fields", "search"];
    excludesFields.forEach(
      (field) => delete queryStringObj[field as keyof typeof queryStringObj]
    );

    const filters: any = {};
    for (const key in queryStringObj) {
      const value = queryStringObj[key as keyof typeof queryStringObj];
      if (typeof value === "string" && value.match(/\b(gte|gt|lte|lt)\b/)) {
        filters[key] = { [Op[value as keyof typeof Op]]: value };
      } else {
        filters[key] = value;
      }
    }

    this.queryOptions.where = filters;
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      this.queryOptions.order = this.queryString.sort
        .split(",")
        .map((field) => [field, "ASC"]);
    } else {
      this.queryOptions.order = [["createdAt", "DESC"]];
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      this.queryOptions.attributes = this.queryString.fields.split(",");
    }
    return this;
  }

  search(model: typeof Model): this {
    if (this.queryString.search) {
      const searchQuery = `%${this.queryString.search.trim()}%`;
      if (model.name === "Product") {
        this.queryOptions.where = {
          [Op.or]: [
            { title: { [Op.iLike]: searchQuery } },
            { description: { [Op.iLike]: searchQuery } },
          ],
        };
      } else {
        this.queryOptions.where = {
          name: { [Op.iLike]: searchQuery },
        };
      }
    }
    return this;
  }

  paginate(countDocuments: number): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 50;
    const offset = (page - 1) * limit;

    this.queryOptions.limit = limit;
    this.queryOptions.offset = offset;

    this.paginationResult = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(countDocuments / limit),
    };

    return this;
  }
}

export default ApiFeatures;
