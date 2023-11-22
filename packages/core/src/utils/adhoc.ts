export const isValidIdKey = (arg: string): boolean => {
  const regex = /^[A-Za-z0-9_-]+$/;
  return regex.test(arg);
}
