export const generateId = (
  prefix: string = "FPS",
  length: number = 8
): string => {
  const timestamp = Date.now().toString(36).toUpperCase(); 
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));
  const randomPart = Array.from(randomBytes, (byte) =>
    ("0" + (byte % 36).toString(36)).slice(-1).toUpperCase()
  ).join("");

  return `${prefix}-${timestamp}-${randomPart}`;
};
