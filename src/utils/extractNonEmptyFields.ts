const extractNonEmptyFields = <T extends Record<string, any>>(
  requestBody: any,
  model: any
): Partial<T> => {
  const notEmptyData: Partial<T> = {};

  for (const key of Object.keys(model.schema.paths)) {
    if (requestBody[key]) {
      notEmptyData[key as keyof T] = requestBody[key]; // Type assertion here
    }
  }

  console.log("//");
  console.log(Object.keys(model.schema.paths));
  console.log(requestBody);
  console.log(notEmptyData);
  console.log("//");

  return notEmptyData;
};
