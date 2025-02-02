const extractNonEmptyFields = <T extends Record<string, any>>(
  requestBody: any,
  model: any
): Partial<T> => {
  const notEmptyData: Partial<T> = {};

  // Sequelize does not have "schema.paths", instead, we use "rawAttributes"
  const modelAttributes = Object.keys(model.rawAttributes);

  for (const key of modelAttributes) {
    if (requestBody[key] !== undefined && requestBody[key] !== null) {
      notEmptyData[key as keyof T] = requestBody[key]; // Type assertion
    }
  }

  console.log("Extracted fields:", notEmptyData);

  return notEmptyData;
};
export default extractNonEmptyFields;
