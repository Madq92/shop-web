"use client";

import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Table,
  TableProps,
  Tag,
} from "antd";
import Box from "@/components/box";
import { Microchip, Tags, Weight } from "lucide-react";
import { useRef, useState } from "react";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import DictController, {
  DictDTO,
  DictGroupDTO,
  DictQueryReq,
  DictType,
} from "@/api/prod/DictController";

const options = Object.entries(DictType).map(([value, label]) => ({
  value,
  label: (
    <div className="flex items-center justify-center gap-2 w-full">
      {/* 图标根据需求动态渲染 */}
      {value === "UNIT" && <Weight />}
      {value === "SPEC" && <Microchip />}
      {value === "LABEL" && <Tags />}
      <div>{label}</div>
    </div>
  ),
}));

export default function DictPage() {
  const [dictType, setDictType] = useState<string>("UNIT");
  const [queryForm] = Form.useForm<DictQueryReq>();
  const [loading, setLoading] = useState<boolean>(false);
  const [dictGroupList, setDictGroupList] = useState<DictGroupDTO[]>();
  const [currentDictGroup, setCurrentDictGroup] = useState<DictGroupDTO>();
  const [dictGroupForm] = Form.useForm<DictGroupDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentDictDetail, setCurrentDictDetail] = useState<DictDTO>();
  const [dictDetailForm] = Form.useForm<DictDTO>();

  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");
  const tagInputRef = useRef<string>("");

  const doQuery = async (dictType: string) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    queryParam.type = dictType;
    const result = await DictController.list(queryParam);
    setDictGroupList(result || []);
    setLoading(false);
  };

  const handleEdit = async (dictGroup: DictGroupDTO) => {
    setCurrentDictGroup(dictGroup);
    dictGroupForm.setFieldsValue(dictGroup);
    setModalVisible(true);
  };

  const handleCreate = async () => {
    setCurrentDictGroup(undefined);
    dictGroupForm.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const values = await dictGroupForm.validateFields();
    values.type = dictType;
    if (currentDictGroup) {
      await DictController.edit(currentDictGroup.dictGroupId, values);
    } else {
      await DictController.create(values);
    }
    setModalVisible(false);
    dictGroupForm.resetFields();
    doQuery(dictType);
  };

  const handleDetailSubmit = async () => {
    const dictDetail = await dictDetailForm.validateFields();
    dictDetail.type = dictType;
    if (currentDictDetail) {
      await DictController.editDetail(
        currentDictGroup!.dictGroupId,
        currentDictDetail.dictId,
        dictDetail,
      );
    } else {
      await DictController.createDetail(
        currentDictGroup!.dictGroupId,
        dictDetail,
      );
    }
    setDetailModalVisible(false);
    dictDetailForm.resetFields();
    doQuery(dictType);
  };

  const dictTypeName = DictType[dictType as keyof typeof DictType];

  const columns: TableProps<DictGroupDTO>["columns"] = [
    {
      title: `${dictTypeName}名称`,
      dataIndex: "name",
      key: "name",
    },
    {
      title: `${dictTypeName}明细`,
      dataIndex: "dictDetails",
      key: "dictDetails",
      render: (_, dictGroup) => (
        <>
          {dictGroup.dictDetails &&
            dictGroup.dictDetails.map((dict) => (
              <Tag
                key={dict.dictId}
                closable={{
                  closeIcon: <DeleteOutlined />,
                  "aria-label": "Close Button",
                }}
                onClose={async (e) => {
                  e.preventDefault();
                  await DictController.deleteDetail(
                    dictGroup.dictGroupId,
                    dict.dictId,
                  );
                  doQuery(dictType);
                }}
              >
                {dict.name}
              </Tag>
            ))}
        </>
      ),
    },
    {
      title: "操作",
      render: (_, dictGroup) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(dictGroup)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await DictController.delete(dictGroup.dictGroupId);
              doQuery(dictType);
            }}
          >
            删除
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              setCurrentDictGroup(dictGroup);
              setCurrentDictDetail(undefined);
              setDetailModalVisible(true);
            }}
          >
            添加{dictTypeName}明细
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Box className="mb-4">
        <Radio.Group
          block
          options={options}
          defaultValue="UNIT"
          optionType="button"
          buttonStyle="solid"
          onChange={(e) => {
            setDictType(e.target.value);
            doQuery(e.target.value);
          }}
        />
      </Box>

      <Box>
        {/*查询窗口*/}
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label={`${dictTypeName}名称`}>
                <Input placeholder={`请输入${dictTypeName}名称`} />
              </Form.Item>
            </Col>
            <div className="text-left">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  onClick={() => doQuery(dictType)}
                >
                  查询
                </Button>
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => {
                    queryForm.resetFields();
                  }}
                >
                  重置
                </Button>
              </Space>
            </div>
          </Row>
        </Form>

        {/*数据列表*/}
        <Space className="pb-4">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建
          </Button>

          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => doQuery(dictType)}
          >
            刷新
          </Button>
        </Space>
        <Table
          dataSource={dictGroupList}
          columns={columns}
          rowKey={(record) => record.dictGroupId}
          loading={loading}
          pagination={false}
        />
      </Box>

      {/*====> 弹窗 begin*/}
      {/*字典组弹窗*/}
      <Modal
        title={
          currentDictGroup ? `编辑${dictTypeName}组` : `创建${dictTypeName}组`
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          dictGroupForm.resetFields();
        }}
        footer={null}
      >
        <Form form={dictGroupForm} layout="vertical" name="deviceForm">
          <Form.Item
            name="name"
            label={`${dictTypeName}组名称`}
            rules={[{ required: true, message: `请输入${dictTypeName}组名称` }]}
          >
            <Input placeholder={`请输入${dictTypeName}组名称`} />
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  dictGroupForm.resetFields();
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
          </div>
        </Form>
      </Modal>

      {/*字典详情弹窗*/}
      <Modal
        title={
          currentDictDetail ? `编辑${dictTypeName}` : `创建${dictTypeName}`
        }
        open={detailModalVisible}
        onOk={handleDetailSubmit}
        onCancel={() => {
          setDetailModalVisible(false);
          dictDetailForm.resetFields();
        }}
        footer={null}
      >
        <Form form={dictDetailForm} layout="vertical" name="deviceForm">
          <Form.Item
            name="name"
            label={`${dictTypeName}名称`}
            rules={[{ required: true, message: `请输入${dictTypeName}名称` }]}
          >
            <Input placeholder={`请输入${dictTypeName}名称`} />
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  dictDetailForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckOutlined />}
                onClick={handleDetailSubmit}
              >
                确认
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      {/*====> 弹窗 end*/}
    </>
  );
}
