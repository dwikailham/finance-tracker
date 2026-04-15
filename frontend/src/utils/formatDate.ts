import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export function formatDate(date: string | Date, format: string = "DD MMM YYYY"): string {
  return dayjs(date).format(format);
}

export function formatDateFull(date: string | Date): string {
  return dayjs(date).format("DD MMMM YYYY");
}
