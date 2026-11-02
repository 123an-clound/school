// Servers run in UTC; always render dates in Vietnam time.
const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

// Value for <input type="datetime-local"> in Vietnam time (UTC+7, no DST)
export const toVnInput = (iso: string) => new Date(Date.parse(iso) + 7 * 3600_000).toISOString().slice(0, 16);

const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
