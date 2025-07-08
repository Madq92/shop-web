"use client";
// import { useRouter } from "next/navigation";

import { Button, Form, Select, Space, Tag } from "antd";
import React, { useEffect, useState } from "react";
import DictController, { DictGroupDTO } from "@/api/prod/DictController";

export default function HomePage() {
  // const router = useRouter();
  // router.push("/sys/user");
  const [dictGroupList, setDictGroupList] = useState<DictGroupDTO[]>([]);
  // const [isShowDetail, setIsShowDetail] = useState(true);

  const [allDictGroupList, setAllDictGroupList] = useState<DictGroupDTO[]>([]);

  // setIsShowDetail(true);

  useEffect(() => {
    DictController.list({ type: "SPEC" }).then((dictGroupList) => {
      setAllDictGroupList(dictGroupList);
    });
  }, []);

  const property = {
    add(dictGroup: DictGroupDTO) {
      setDictGroupList((prev) => [...prev, dictGroup]);
    },
    remove(groupId: string) {
      setDictGroupList((prev) => {
        const ret = [...prev];
        return ret.filter((item) => item.dictGroupId !== groupId);
      });
    },
    change(i: number, dictGroupId: string) {
      const dictGroup = allDictGroupList.find(
        (item) => item.dictGroupId === dictGroupId,
      );
      if (dictGroup) {
        setDictGroupList((prev) => {
          const ret = [...prev];
          ret[i] = dictGroup;
          return ret;
        });
      }
    },
    onAddDetail(groupId: string, dictId: string) {
      setDictGroupList((prev) => {
        const ret = [...prev];
        const dg = ret.find((item) => item.dictGroupId === groupId);
        if (!dg) {
          return ret;
        }
        const dd = dg.dictDetails.find((item) => item.dictId === dictId);
        if (dd) {
          dd.checked = true;
        }
        return ret;
      });
    },
    onRemoveDetail(groupId: string, dictId: string) {
      setDictGroupList((prev) => {
        const ret = [...prev];
        const dg = ret.find((item) => item.dictGroupId === groupId);
        if (!dg) {
          return ret;
        }
        const dd = dg.dictDetails.find((item) => item.dictId === dictId);
        if (dd) {
          dd.checked = false;
        }
        return ret;
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
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      <div className="w-full">
        <Form>
          <Form.Item label="商品规格">
            <Space direction="vertical">
              {dictGroupList.map((dictGroup, i) => (
                <Space key={dictGroup.dictGroupId}>
                  <Select
                    placeholder="规格名"
                    style={{ width: 200 }}
                    options={allDictGroupList.map((item) => {
                      return { value: item.dictGroupId, label: item.name };
                    })}
                    onChange={(dictGroupId: string) =>
                      property.change(i, dictGroupId)
                    }
                  />
                  {dictGroup.dictDetails
                    .filter((item) => item.checked)
                    .map((dictDetail) => (
                      <Tag
                        key={dictDetail.dictId}
                        bordered={false}
                        closable
                        onClose={() =>
                          property.onRemoveDetail(
                            dictGroup.dictGroupId,
                            dictDetail.dictId,
                          )
                        }
                      ></Tag>
                    ))}

                  {/*<Select*/}
                  {/*  mode="tags"*/}
                  {/*  style={{ width: 400 }}*/}
                  {/*  placeholder="添加规格属性"*/}
                  {/*  value={dictGroup.dictDetails}*/}
                  {/*  onChange={(v) => property.onChangeValues(i, v)}*/}
                  {/*>*/}
                  {/*  {prop?.values?.map((value) => (*/}
                  {/*    <Option key={value} value={value}>*/}
                  {/*      {value}*/}
                  {/*    </Option>*/}
                  {/*  ))}*/}
                  {/*</Select>*/}
                  <Button
                    type="link"
                    danger
                    onClick={() => property.remove(dictGroup.dictGroupId)}
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
        {/*{isShowDetail ? (*/}
        {/*  <Form.Item label="规格明细" wrapperCol={{ span: 16 }}>*/}
        {/*    <Table*/}
        {/*      pagination={false}*/}
        {/*      size="small"*/}
        {/*      columns={columns}*/}
        {/*      dataSource={rows}*/}
        {/*      bordered*/}
        {/*      // footer={() => 'Footer'}*/}
        {/*    />*/}
        {/*  </Form.Item>*/}
        {/*) : null}*/}
      </div>
    </div>
  );
}
