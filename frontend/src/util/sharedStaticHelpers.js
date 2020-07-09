export const subMinutes = function (dt, minutes) {
  return new Date(dt.getTime() - minutes * 60000);
};
