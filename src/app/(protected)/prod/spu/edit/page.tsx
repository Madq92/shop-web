"use client";

import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Cascader,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const { TextArea } = Input;

export default function SpuEditPage() {
  const { spuId } = useParams();

  const [currentSpu, setCurrentSpu] = useState<SpuDTO>();
  if (spuId) {
    SpuController.detail(spuId as string).then((res) => {
      setCurrentSpu(res);
    });
  }

  const [unitList, setUnitList] = useState<DictDTO[]>([]);
  const [specList, setSpecList] = useState<DictGroupDTO[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryDTO[]>([]);
  const [spuForm] = Form.useForm<SpuDTO>();
  const router = useRouter();

  // 属性
  const [categoryId, setCategoryId] = useState<string>("");
  const [spuStatus, setSpuStatus] = useState<string>(ProdStatusEnum.ENABLE);
  // const [imgUrlList, setImgUrlList] = useState<string[]>([]);

  useEffect(() => {
    DictController.list({ type: "UNIT" }).then((dictGroupList) => {
      if (dictGroupList) {
        setUnitList(dictGroupList[0].dictDetails);
      }
    });

    DictController.list({ type: "SPEC" }).then((dictGroupList) => {
      if (dictGroupList) {
        setSpecList(dictGroupList);
      }
    });

    CategoryController.list().then((categoryList) => {
      if (categoryList) {
        setCategoryList(categoryList);
      }
    });
  }, []);

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

  const handleCancel = () => {
    router.back();
  };

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

        <Row>
          <Col offset={4} span={20}>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    rowGap: 16,
                    flexDirection: "column",
                  }}
                >
                  {fields.map((field) => (
                    <Card
                      size="small"
                      title={`Item ${field.name + 1}`}
                      key={field.key}
                      extra={
                        <CloseOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      }
                    >
                      <Form.Item label="Name" name={[field.name, "name"]}>
                        <Select
                          options={specList.map((item) => ({
                            value: item.dictGroupId,
                            label: item.name,
                          }))}
                        />
                      </Form.Item>

                      {/* Nest Form.List */}
                      <Form.Item label="List">
                        <Form.List name={[field.name, "list"]}>
                          {(subFields, subOpt) => (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                rowGap: 16,
                              }}
                            >
                              {subFields.map((subField) => (
                                <Space key={subField.key}>
                                  <Form.Item
                                    noStyle
                                    name={[subField.name, "first"]}
                                  >
                                    <Input placeholder="first" />
                                  </Form.Item>
                                  <Form.Item
                                    noStyle
                                    name={[subField.name, "second"]}
                                  >
                                    <Input placeholder="second" />
                                  </Form.Item>
                                  <CloseOutlined
                                    onClick={() => {
                                      subOpt.remove(subField.name);
                                    }}
                                  />
                                </Space>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => subOpt.add()}
                                block
                              >
                                + 添加规格明细
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  ))}

                  <Button type="dashed" onClick={() => add()} block>
                    + 添加规格
                  </Button>
                </div>
              )}
            </Form.List>

            <Form.Item noStyle shouldUpdate>
              {() => (
                <Typography>
                  <pre>{JSON.stringify(spuForm.getFieldsValue(), null, 2)}</pre>
                </Typography>
              )}
            </Form.Item>
          </Col>
        </Row>

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

        <Space className={"w-full justify-center py-4"}>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
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
