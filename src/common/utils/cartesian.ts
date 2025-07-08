/**
 * 计算多个数组的笛卡尔积
 * @param arrays - 输入的多个数组
 * @returns 笛卡尔积结果
 */
export default function cartesian<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return [];
  if (arrays.some((arr) => arr.length === 0)) return [];

  return arrays.reduce<T[][]>(
    (acc, curr) => curr.flatMap((value) => acc.map((prev) => [...prev, value])),
    [[]],
  );
}
