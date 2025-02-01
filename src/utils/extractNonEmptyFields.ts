const extractNonEmptyFields = <T>(requestBody: any, model: any): Partial<T> => {
  const notEmptyData: Partial<T> = {};

  for (const key of Object.keys(model.schema.paths)) {
    if (requestBody[key]) {
      notEmptyData[key] = requestBody[key];
    }
  }
  console.log("//");
  console.log(Object.keys(model.schema.paths));
  console.log(requestBody);
  console.log(notEmptyData);
  console.log("//");
  return notEmptyData;
};

export default extractNonEmptyFields;
