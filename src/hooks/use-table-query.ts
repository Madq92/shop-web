"use client";

import { useState, useCallback } from "react";

interface UseTableQueryOptions<T, Q = Record<string, unknown>> {
  fetchFn: (
    params: Q & { pageNum: number; pageSize: number },
  ) => Promise<{
    records: T[];
    total: number;
  }>;
  defaultPageSize?: number;
  initialQueryParams?: Q;
}

export function useTableQuery<T, Q = Record<string, unknown>>({
  fetchFn,
  defaultPageSize = 10,
  initialQueryParams,
}: UseTableQueryOptions<T, Q>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  const doQuery = useCallback(
    async (currentPage = 1, currentPageSize = pageSize, extraParams?: Q) => {
      setLoading(true);
      try {
        const result = await fetchFn({
          ...initialQueryParams,
          ...extraParams,
          pageNum: currentPage,
          pageSize: currentPageSize,
        } as Q & { pageNum: number; pageSize: number });
        setData(result.records || []);
        setTotal(result.total);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, initialQueryParams, pageSize],
  );

  const handlePageChange = useCallback(
    (page: number, size: number) => {
      setPageNum(page);
      setPageSize(size);
      doQuery(page, size);
    },
    [doQuery],
  );

  const refresh = useCallback(() => {
    setPageNum(1);
    doQuery(1, pageSize);
  }, [doQuery, pageSize]);

  return {
    data,
    loading,
    pageNum,
    pageSize,
    total,
    setPageNum,
    setPageSize,
    doQuery,
    handlePageChange,
    refresh,
    setData,
  };
}
