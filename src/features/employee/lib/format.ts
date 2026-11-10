export function formatPrice(value: number): string {
  return `${value.toLocaleString("fa-IR")} تومان`;
}

export function formatDuration(minutes: number): string {
  return `${minutes.toLocaleString("fa-IR")} دقیقه`;
}
