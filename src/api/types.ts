export type YesOrNoEnum = 'Y' | 'N';
export type StatusEnum = 'ENABLE' | 'DISABLE';

export const YesOrNoEnumLabels: Record<YesOrNoEnum, string> = {
  Y: '是',
  N: '否',
};
export const StatusLabels: Record<StatusEnum, string> = {
  ENABLE: '启用',
  DISABLE: '停用',
};

export const enumToOptions = <T extends Record<string, string | TagLabel>>(
  enumLabels: T,
): Array<{
  value: keyof T;
  label: string;
}> => {
  return Object.entries(enumLabels).map(([value, tagLabel]) => ({
    value,
    label: typeof tagLabel === 'string' ? tagLabel : tagLabel.label,
  })) as Array<{ value: keyof T; label: string }>;
};

export const yesOrNoOpion = enumToOptions(YesOrNoEnumLabels);
export const statusOpion = enumToOptions(StatusLabels);

export type TagLabel = { label: string; color: string; name: string | number };

/**
 * 字典数据类型
 */
export type DictDataIdType = string | number | boolean;
export type DictDataPropertyType = string | number | undefined | boolean;

export type DictData = {
  id: DictDataIdType;
  name: string;
  symbol?: string;
  [key: string]: DictDataPropertyType;
};

/**
 * 常量字典数据
 */
export class DictionaryBase extends Map<DictDataIdType, DictData> {
  public showName: string;
  // 动态属性
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;

  constructor(name: string, dataList: DictData[], keyId = 'id', symbolId = 'symbol') {
    super();
    this.showName = name;
    this.setList(dataList, keyId, symbolId);
  }

  setList(dataList: DictData[], keyId = 'id', symbolId = 'symbol') {
    this.clear();
    if (Array.isArray(dataList)) {
      dataList.forEach(item => {
        this.set(item[keyId] as DictDataIdType, item);
        if (item[symbolId] != null) {
          Object.defineProperty(this, item[symbolId] as PropertyKey, {
            get: function () {
              return item[keyId];
            },
          });
        }
      });
    }
  }

  getList(valueId = 'name', parentIdKey = 'parentId', filter?: (o: DictData) => DictData): DictData[] {
    const temp: DictData[] = [];
    this.forEach((value, key: DictDataPropertyType) => {
      let obj: DictData = {
        id: key as string | number,
        name: typeof value === 'string' ? value : String(value[valueId]),
        parentId: value[parentIdKey],
      };
      if (typeof value !== 'string') {
        obj = {
          ...value,
          ...obj,
        };
      }
      if (typeof filter !== 'function' || filter(obj)) {
        temp.push(obj);
      }
    });

    return temp;
  }

  getValue(id: DictDataIdType, valueId = 'name'): string {
    // 如果id为boolean类型，则自动转换为0和1
    if (typeof id === 'boolean') {
      id = id ? 1 : 0;
    }
    const obj = this.get(id);
    return obj == null ? '' : (obj[valueId] as string);
  }
}
