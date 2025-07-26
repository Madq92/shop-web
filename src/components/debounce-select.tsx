import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SelectProps } from 'antd';
import { Select, Spin } from 'antd';
import { debounce } from 'next/dist/server/utils';

export interface DebounceSelectProps<
  ValueType extends {
    key?: string;
    label: string | React.ReactNode;
    value: string | number;
  },
> extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
  initLoad?: boolean;
}

export default function DebounceSelect<
  ValueType extends {
    key?: string;
    label: string | React.ReactNode;
    value: string | number;
  },
>({ fetchOptions, debounceTimeout = 300, initLoad = false, ...props }: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  // 添加初始加载逻辑
  useEffect(() => {
    if (initLoad) {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);

      fetchOptions('').then(newOptions => {
        if (fetchId !== fetchRef.current) {
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    }
  }, [initLoad, fetchOptions]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return <Select showSearch filterOption={false} onSearch={debounceFetcher} notFoundContent={fetching ? <Spin size="small" /> : 'No results found'} {...props} options={options} />;
}
