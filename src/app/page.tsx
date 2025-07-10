"use client";
// import { useRouter } from "next/navigation";

import { Button, Form, Select, Space, Table } from "antd";
import React, { useEffect, useState } from "react";
import DictController, {
  DictDTO,
  DictGroupDTO,
} from "@/api/prod/DictController";
import Link from "next/link";

type SkuProp = {
  key: string;
  price?: number;
  stock?: number;
  specs?: DictDTO[];
};

export default function HomePage() {
  // const router = useRouter();
  // router.push("/sys/user");
  const [dictGroupList, setDictGroupList] = useState<DictGroupDTO[]>([]);

  const [allDictGroupList, setAllDictGroupList] = useState<DictGroupDTO[]>([]);

  const [skuSpecList, setSkuSpecList] = useState<SkuProp[]>([]);

  // 获取所有字典组
  useEffect(() => {
    DictController.list({ type: "SPEC" }).then((dictGroupList) => {
      setAllDictGroupList(dictGroupList);
    });
  }, []);

  // 计算可能的sku
  useEffect(() => {
    const selectedDetails = dictGroupList
      .map((group) => group.dictDetails.filter((detail) => detail.checked))
      .filter((details) => details.length > 0);

    if (selectedDetails.length === 0) {
      setSkuSpecList([]);
      return;
    }

    // 计算笛卡尔积
    const cartesian = selectedDetails.reduce<DictDTO[][]>(
      (acc, curr) => curr.flatMap((item) => acc.map((prev) => [...prev, item])),
      [[]],
    );

    // 转换为 { spec_0: xxx, spec_1: xxx, key: 'sku-0' } 形式
    const formattedList = cartesian.map((combination, index) => {
      const skuItem = combination.reduce<DictDTO[]>((acc, item) => {
        return [...acc, item];
      }, []);

      return {
        key: `sku-${index}`,
        specs: skuItem,
        price: 0, // 可选字段
        stock: 0,
      } as SkuProp;
    });

    setSkuSpecList(formattedList);
  }, [dictGroupList]);

  const columns = React.useMemo(() => {
    if (dictGroupList.length === 0 || !skuSpecList.length) return [];

    const col = dictGroupList.map((group, index) => ({
      title: group.name,
      dataIndex: `spec_${index}`,
      key: `spec_${index}`,
      render: (i: number, record: SkuProp) => {
        console.log("render title", i, record);
        const spec = record!.specs![index];
        return spec?.name ?? "-";
      },
    }));
    col.push({
      title: "价格",
      dataIndex: "price",
      key: "price_key",
      render: (i: number, record: SkuProp) => {
        console.log("render price", i, record);
        return record.price + "";
      },
    });

    col.push({
      title: "库存",
      dataIndex: "stock",
      key: "stock_key",
      render: (i: number, record: SkuProp) => {
        console.log("render stock", i, record);
        return record.stock + "";
      },
    });
    return col;
  }, [dictGroupList, skuSpecList]);

  const property = {
    add(dictGroup: DictGroupDTO) {
      setDictGroupList((prev) => [...prev, dictGroup]);
    },
    remove(index: number) {
      setDictGroupList((prev) => prev.filter((_, i) => i !== index));
    },
    change(i: number, dictGroupId: string) {
      const dictGroup = allDictGroupList.find(
        (item) => item.dictGroupId === dictGroupId,
      );
      if (dictGroup) {
        setDictGroupList((prev) => {
          // 检查是否已经存在该 dictGroup
          const exists = prev.some(
            (group) => group.dictGroupId === dictGroup.dictGroupId,
          );

          if (exists) {
            return prev; // 已存在，不更新
          }

          const updatedList = [...prev];
          updatedList[i] = dictGroup;
          return updatedList;
        });
      }
    },
    onChangeDetail(i: number, dictIds: string[]) {
      setDictGroupList((prev) => {
        const updatedList = [...prev];

        if (i >= 0 && i < updatedList.length) {
          const currentGroup = { ...updatedList[i] };

          // 更新 dictDetails 中每个项的 checked 状态
          currentGroup.dictDetails = currentGroup.dictDetails.map((detail) => ({
            ...detail,
            checked: dictIds.includes(detail.dictId),
          }));

          updatedList[i] = currentGroup;
        }

        return updatedList;
      });
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <Link href={"/sys/user"}>home</Link>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      <div className="w-full">
        <Form>
          <Form.Item label="商品规格">
            <Space direction="vertical">
              {dictGroupList.map((dictGroup, i) => (
                <Space key={i}>
                  <Select
                    placeholder="规格名"
                    style={{ width: 200 }}
                    options={allDictGroupList.map((item) => {
                      return { value: item.dictGroupId, label: item.name };
                    })}
                    value={dictGroup.dictGroupId}
                    onChange={(dictGroupId: string) =>
                      property.change(i, dictGroupId)
                    }
                  />
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: 400 }}
                    placeholder="选择规格属性"
                    onChange={(dictIds: string[]) => {
                      property.onChangeDetail(i, dictIds);
                    }}
                    value={dictGroup.dictDetails
                      .filter((detail) => detail.checked)
                      .map((detail) => detail.dictId)}
                    options={dictGroup.dictDetails.map((detail) => {
                      return { label: detail.name, value: detail.dictId };
                    })}
                  />
                  <Button
                    type="link"
                    danger
                    onClick={(e) => {
                      console.log("onClick", e);
                      console.log("remove", dictGroup);
                      property.remove(i);
                    }}
                  >
                    删除
                  </Button>
                </Space>
              ))}
              {dictGroupList.length < 3 && (
                <Button
                  type="dashed"
                  size={"small"}
                  onClick={() => {
                    property.add({
                      dictGroupId: "",
                      name: "",
                      dictDetails: [],
                    } as DictGroupDTO);
                  }}
                >
                  添加规格
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
        <Form.Item label="Sku明细" wrapperCol={{ span: 16 }}>
          <Table
            pagination={false}
            size="small"
            columns={columns}
            dataSource={skuSpecList}
            bordered
          />
        </Form.Item>
      </div>
    </div>
  );
}
