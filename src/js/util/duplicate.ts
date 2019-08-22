export default function duplicate<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
