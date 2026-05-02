export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("uk-UA");
}
