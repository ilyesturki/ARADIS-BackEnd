const extractNonEmptyFields = <T extends Record<string, any>>(
  requestBody: any,
  model: any
): Partial<T> => {
  const notEmptyData: Partial<T> = {};

  const modelAttributes = Object.keys(model.rawAttributes);

  for (const key of modelAttributes) {
    if (requestBody[key] !== undefined && requestBody[key] !== null) {
      notEmptyData[key as keyof T] = requestBody[key]; 
    }
  }

  console.log("Extracted fields:", notEmptyData);

  return notEmptyData;
};
export default extractNonEmptyFields;
