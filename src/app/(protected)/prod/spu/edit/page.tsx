"use client";

import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Cascader,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Table,
  TableProps,
  Typography,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import Box from "@/components/box";
import DictController, {
  DictDTO,
  DictGroupDTO,
} from "@/api/prod/DictController";
import CategoryController, { CategoryDTO } from "@/api/prod/CategoryController";
import { treeDataTranslate } from "@/common/utils";
import SpuController, {
  ProdStatusEnum,
  SkuDTO,
  SpuDTO,
} from "@/api/prod/SpuController";
import { useRouter, useSearchParams } from "next/navigation";

const { TextArea } = Input;

type SkuProp = {
  key: number;
  price?: number;
  stock?: number;
  specs?: DictDTO[];
};

export default function SpuEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spuId = searchParams.get("spuId");
  const [currentSpu, setCurrentSpu] = useState<SpuDTO>();

  // 下拉属性
  const [unitList, setUnitList] = useState<DictDTO[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryDTO[]>([]);

  // From表单外属性
  const [categoryId, setCategoryId] = useState<string>("");
  const [spuStatus, setSpuStatus] = useState<string>(ProdStatusEnum.ENABLE);
  // const [imgUrlList, setImgUrlList] = useState<string[]>([]);

  // sku属性，计算属性
  const [dictGroupList, setDictGroupList] = useState<DictGroupDTO[]>([]);
  const [allDictGroupList, setAllDictGroupList] = useState<DictGroupDTO[]>([]);
  const [skuSpecList, setSkuSpecList] = useState<SkuProp[]>([]);
  const [columns, setColumns] = useState<TableProps<SkuProp>["columns"]>();

  // 表单
  const [spuForm] = Form.useForm<SpuDTO>();
  // 初始化单位、规格、分类
  useEffect(() => {
    DictController.list({ type: "UNIT" }).then((dictGroupList) => {
      if (dictGroupList) {
        setUnitList(dictGroupList[0].dictDetails);
      }
    });

    DictController.list({ type: "SPEC" }).then((dictGroupList) => {
      if (dictGroupList) {
        setAllDictGroupList(dictGroupList);
      }
    });

    CategoryController.list().then((categoryList) => {
      if (categoryList) {
        setCategoryList(categoryList);
      }
    });

    if (spuId) {
      SpuController.detail(spuId as string).then((res) => {
        setCurrentSpu(res);
        spuForm.setFieldsValue(res);
      });
    }
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

    // 转换
    const formattedList = cartesian.map((combination, index) => {
      const skuItem = combination.reduce<DictDTO[]>((acc, item) => {
        return [...acc, item];
      }, []);

      return {
        key: index,
        specs: skuItem,
      } as SkuProp;
    });
    setSkuSpecList(formattedList);

    if (dictGroupList.length === 0 || !skuSpecList.length) {
      setColumns([]);
    } else {
      const col = dictGroupList.map((group, index) => ({
        title: group.name,
        dataIndex: `spec_${index}`,
        key: index,
        width: 100,
        render: (_: unknown, record: SkuProp) => {
          const spec = record!.specs![index];
          return <>{spec?.name ?? "-"}</>;
        },
      }));
      col.push({
        title: "价格",
        dataIndex: "price",
        key: 100,
        width: 200,
        render: (_: unknown, record: SkuProp) => {
          return (
            <>
              <Input
                type="number"
                step="0.1"
                prefix="￥"
                suffix="元"
                required
                value={Number(record.price)}
                onChange={(e) =>
                  setSkuSpecList((prev) => {
                    return prev.map((item) =>
                      item.key === record.key
                        ? ({
                            ...item,
                            price: Number(e.target.value),
                          } as SkuProp)
                        : item,
                    );
                  })
                }
              />
            </>
          );
        },
      });
      setColumns(col);
    }
  }, [dictGroupList]);

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

  const unitSelectOptions = unitList.map((dict) => ({
    value: dict.dictId,
    label: dict.name,
  }));

  const categoryCascaderOptions = treeDataTranslate(
    categoryList.map((category) => ({
      value: category.categoryId,
      label: category.name,
      parent: category.parentId,
    })),
    "value",
    "parent",
  );

  const handleSubmit = () => {
    spuForm.validateFields().then(async (spuDTO) => {
      const statusKey = (
        Object.keys(ProdStatusEnum) as Array<keyof typeof ProdStatusEnum>
      ).find((key) => ProdStatusEnum[key] === spuStatus);
      const spu: SpuDTO = {
        ...spuDTO,
        status: statusKey as string,
        categoryId: categoryId,
        skus: [
          {
            sellPrice: 100,
            sellPrice1: 200,
            sellPrice2: 300,
            sellPrice3: 400,
            specs: [
              {
                dictGroupId: "123",
                dictDetails: [{ dictId: "1233" } as DictDTO],
              } as DictGroupDTO,
            ],
          } as SkuDTO,
        ],
      };
      if (currentSpu) {
        // 编辑
        await SpuController.edit(currentSpu!.spuId, spu);
      } else {
        // 创建
        await SpuController.create(spu);
      }
      router.back();
    });
  };

  return (
    <Box>
      <Form form={spuForm} labelCol={{ span: 4 }}>
        <div className={"text-sm font-medium mb-6 "}>基础信息</div>
        <Form.Item
          labelAlign="right"
          label="分类"
          name={"categoryId"}
          rules={[{ required: true, message: `请选择分类` }]}
          getValueFromEvent={(categoryIdList: string[]) => {
            setCategoryId(categoryIdList[categoryIdList.length - 1]);
            return categoryIdList;
          }}
        >
          <Cascader options={categoryCascaderOptions} expandTrigger="hover" />
        </Form.Item>
        <Form.Item
          labelAlign="right"
          label="编码"
          name="code"
          rules={[{ required: true, message: `请输入编码` }]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>
        <Form.Item
          labelAlign="right"
          label="商品名称"
          name="name"
          rules={[{ required: true, message: `请输入商品名称` }]}
        >
          <Input placeholder="请输入商品名称" />
        </Form.Item>
        <Form.Item
          labelAlign="right"
          label="单位"
          name="unitId"
          rules={[{ required: true, message: `请选择单位` }]}
        >
          <Select options={unitSelectOptions}></Select>
        </Form.Item>
        <Form.Item label="排序" name="sort" labelAlign="right">
          <Input placeholder="请输入商品排序" type={"number"} />
        </Form.Item>
        <Form.Item
          label="状态"
          name={"status"}
          valuePropName="checked"
          getValueFromEvent={(checked: boolean) => {
            setSpuStatus(
              checked ? ProdStatusEnum.ENABLE : ProdStatusEnum.DISABLE,
            );
          }}
        >
          <Switch
            checkedChildren="启用"
            unCheckedChildren="停用"
            defaultChecked
          />
        </Form.Item>

        {/*------------------ 规格 begin ------------------*/}
        <div className={"text-sm font-medium mb-6 "}>价格信息</div>

        <Form.Item label="商品规格">
          <Space direction="vertical">
            {dictGroupList.map((dictGroup, i) => (
              <Space key={i}>
                <Select
                  placeholder="规格名"
                  style={{ minWidth: 200 }}
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
                  style={{ minWidth: 400 }}
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
                  onClick={() => {
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

        <Form.Item label="规格明细" wrapperCol={{ span: 16 }}>
          <Table
            pagination={false}
            size="small"
            columns={columns}
            dataSource={skuSpecList}
            bordered
          />
        </Form.Item>

        {/* ------------------ 规格 end ------------------*/}

        <div className={"text-sm font-medium mb-6 "}>图文信息</div>
        <Form.Item
          label="图片"
          getValueFromEvent={(file) => {
            console.log("file e:", file);

            return "http://img.oldhorse.tech/ul28wnbkoqseppe7g3094rk3.png";
          }}
        >
          <Upload
            listType="picture-card"
            customRequest={(e) => {
              console.log("customRequest", e);
              return true;
            }}
          >
            <button
              style={{
                color: "inherit",
                cursor: "inherit",
                border: 0,
                background: "none",
              }}
              type="button"
            >
              <PlusOutlined />
            </button>
          </Upload>
        </Form.Item>
        <Form.Item label="描述" name={"spuDesc"}>
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item label="调试信息" shouldUpdate>
          {() => (
            <Typography>
              <pre>{JSON.stringify(spuForm.getFieldsValue(), null, 2)}</pre>

              <pre>{JSON.stringify(skuSpecList, null, 2)}</pre>
            </Typography>
          )}
        </Form.Item>

        <Space className={"w-full justify-center py-4"}>
          <Button
            icon={<CloseOutlined />}
            onClick={() => {
              router.back();
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<CheckOutlined />}
            onClick={handleSubmit}
          >
            确认
          </Button>
        </Space>
      </Form>
    </Box>
  );
}
