export const isValidIdKey = (arg: string) => {
  const regex = /^[A-Za-z0-9_-]+$/;
  return regex.test(arg);
}
