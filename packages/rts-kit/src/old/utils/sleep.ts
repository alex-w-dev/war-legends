export function sleep(timeMs = 1000): Promise<void> {
  return new Promise<void>((res) => setTimeout(res, timeMs));
}
