/**
 * 解决eslint不支持{generic}语法的问题
 */
export type T = ANY_OBJECT;

export type ANY_OBJECT = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type PageReq = {
  pageSize: number;
  pageNum: number;
};

// 定义返回数据的类型
export type ResponseDataType<T> = {
  errorCode: string | null;
  data: T;
  errorMessage: string | null;
  success: boolean;
};

export type PageDataType<T> = {
  records: T[];
  total: number;
  size: number;
  current: number;
};
