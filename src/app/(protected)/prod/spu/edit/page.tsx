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
import React, { useEffect, useMemo, useState } from "react";
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

type SkuProp = SkuDTO & {
  key: number | string;
  stock?: number;
};

export default function SpuEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spuId = searchParams.get("spuId");
  const [currentSpu, setCurrentSpu] = useState<SpuDTO>();

  // 下拉属性
  const [unitList, setUnitList] = useState<DictDTO[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryDTO[]>([]);

  // sku属性，计算属性
  const [dictGroupList, setDictGroupList] = useState<DictGroupDTO[]>([]);
  const [allDictGroupList, setAllDictGroupList] = useState<DictGroupDTO[]>([]);
  const [columns, setColumns] = useState<TableProps<SkuProp>["columns"]>();
  const [skuSpecList, setSkuSpecList] = useState<SkuProp[]>([]);

  // 表单
  const [spuForm] = Form.useForm<
    { categoryIdList: string[]; spuStatusChecked: boolean } & SpuDTO
  >();
  // 初始化单位、规格、分类、spu、sku
  useEffect(() => {
    DictController.list({ type: "UNIT" }).then((dictGroupList) => {
      if (dictGroupList) {
        setUnitList(dictGroupList[0].dictDetails);
      }
    });

    CategoryController.list().then((categoryList) => {
      if (categoryList) {
        setCategoryList(categoryList);
      }
    });

    DictController.list({ type: "SPEC" }).then((dictGroupList) => {
      if (dictGroupList) {
        setAllDictGroupList(dictGroupList);
      }
    });

    if (spuId) {
      SpuController.detail(spuId as string).then((res) => {
        setCurrentSpu(res);
        spuForm.setFieldsValue({
          categoryIdList: [res.parentCategoryId, res.categoryId],
          spuStatusChecked: res.status === ProdStatusEnum.ENABLE,
          ...res,
        });
        const skuList = res.skus.map((sku) => {
          return { stock: 0, key: sku.skuId, ...sku } as SkuProp;
        });
        setSkuSpecList(skuList);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 编辑的时候初始化商品规格
  useEffect(() => {
    if (currentSpu && allDictGroupList) {
      const distGroupIds = currentSpu.skus
        .flatMap((sku) => sku.specs)
        .map((spec) => spec?.dictGroupId);

      const distIds = currentSpu.skus
        .flatMap((sku) => sku.specs)
        .map((spec) => spec?.dictId);

      const dictGroupDTOS = allDictGroupList.filter((group) =>
        distGroupIds.includes(group.dictGroupId),
      );
      dictGroupDTOS.forEach((group) => {
        group.dictDetails.forEach((detail) => {
          if (distIds.includes(detail.dictId)) {
            detail.checked = true;
          }
        });
      });
      setDictGroupList(dictGroupDTOS);
    }
  }, [allDictGroupList, currentSpu]);

  // 计算可能的sku
  useEffect(() => {
    // 转换 编辑不计算sku
    if (spuId) {
      return;
    }
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

    const formattedList = cartesian.map((combination, index) => {
      const skuItem = combination.reduce<DictDTO[]>((acc, item) => {
        return [...acc, item];
      }, []);

      return {
        key: index,
        specs: skuItem,
        status: ProdStatusEnum.ENABLE,
      } as SkuProp;
    });
    setSkuSpecList(formattedList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictGroupList]);

  // 计算sku表头
  useEffect(() => {
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
      col.push(priceColumn);
      col.push(statusColumn);
      setColumns(col);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictGroupList]);

  const priceColumn = {
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
            value={Number(record.sellPrice)}
            onChange={(e) =>
              setSkuSpecList((prev) => {
                return prev.map((item) =>
                  item.key === record.key
                    ? ({
                        ...item,
                        sellPrice: Number(e.target.value),
                      } as SkuProp)
                    : item,
                );
              })
            }
          />
        </>
      );
    },
  };

  const statusColumn = {
    title: "状态",
    dataIndex: "status",
    key: 200,
    width: 80,
    render: (_: unknown, record: SkuProp) => {
      return (
        <>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="停用"
            value={record.status === ProdStatusEnum.ENABLE}
            onChange={(checked) => {
              setSkuSpecList((prev) => {
                return prev.map((item) =>
                  item.key === record.key
                    ? ({
                        ...item,
                        status: checked
                          ? ProdStatusEnum.ENABLE
                          : ProdStatusEnum.DISABLE,
                      } as SkuProp)
                    : item,
                );
              });
            }}
          />
        </>
      );
    },
  };

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

  const categoryCascaderOptions = useMemo(() => {
    if (!categoryList.length) return [];
    return treeDataTranslate(
      categoryList.map((category) => ({
        value: category.categoryId,
        label: category.name,
        parent: category.parentId,
      })),
      "value",
      "parent",
    );
  }, [categoryList]);

  const handleSubmit = () => {
    spuForm
      .validateFields()
      .then(async ({ categoryIdList, spuStatusChecked, ...spuDTO }) => {
        const status = spuStatusChecked
          ? ProdStatusEnum.ENABLE
          : ProdStatusEnum.DISABLE;
        const spu: SpuDTO = {
          ...spuDTO,
          status: status,
          categoryId: categoryIdList[1],
          skus: skuSpecList,
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
          name="categoryIdList"
          rules={[{ required: true, message: `请选择分类` }]}
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
        <Form.Item label="状态" name={"spuStatusChecked"}>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="停用"
            defaultChecked={false}
          />
        </Form.Item>

        {/*------------------ 规格 begin ------------------*/}
        <div className={"text-sm font-medium mb-6 "}>价格信息</div>

        {!spuId && (
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
        )}

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
