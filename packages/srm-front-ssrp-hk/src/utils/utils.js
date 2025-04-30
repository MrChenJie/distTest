export function getDateTime(dayNum = 0) {
  let day = new Date();
  day.setDate(day.getDate() - dayNum);
  return day;
}
