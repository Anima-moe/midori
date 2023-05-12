export function splitArray<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += 4) {
    result.push(arr.slice(i, i + 4));
  }
  return result;
}