"use client";

import {
  Button,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Space,
  Table,
  TableProps,
} from "antd";
import Box from "@/components/box";
import { Microchip, Tags, Weight } from "lucide-react";
import { useState } from "react";
import { PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import DictController, {
  DictGroupDTO,
  DictQueryReq,
  DictType,
} from "@/api/prod/DictController";
import RoleController from "@/api/sys/RoleController";

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
  const [dictType, setDictType] = useState<string>();
  const [queryForm] = Form.useForm<DictQueryReq>();
  const [loading, setLoading] = useState<boolean>(false);
  const [dictGroupList, setDictGroupList] = useState<DictGroupDTO[]>();
  const [currentDictGroup, setCurrentDictGroup] = useState<DictGroupDTO>();

  const doQuery = async () => {
    setLoading(true);

    const queryParam = queryForm.getFieldsValue();
    queryParam.type = dictType;
    const result = await DictController.list(queryParam);
    setDictGroupList(result || []);
    setLoading(false);
  };

  const handleEdit = async (dictGroup: DictGroupDTO) => {
    await DictController.edit(dictGroup.dictGroupId, dictGroup);
  };

  const handleCreate = async () => {
    // const dictGroup = await DictController.create(currentDictGroup);
    // setCurrentDictGroup(dictGroup);
    // setModalDetailVisible(true);
  };

  const columns: TableProps<DictGroupDTO>["columns"] = [
    {
      title: "字典组名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "子字典列表",
      dataIndex: "dictDetails",
      key: "dictDetails",
      render: (_, dictGroup) => (
        <>
          {dictGroup.dictDetails.map((dict) => (
            <div key={dict.dictId}>{dict.name}</div>
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
            onClick={async () => {
              const data = await DictController.detail(dictGroup.dictGroupId);
              setCurrentDictGroup(data);
              // setModalDetailVisible(true);
            }}
          >
            详情
          </Button>
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
              await RoleController.delete(dictGroup.dictGroupId);
              doQuery();
            }}
          >
            删除
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
          onChange={(e) => setDictType(e.target.value)}
        />
      </Box>
      {dictType == "UNIT" && <Box>单位</Box>}
      {dictType == "LABEL" && <Box>标签</Box>}
      {dictType == "SPEC" && (
        <Box>
          {/*查询窗口*/}
          <Form form={queryForm} name="advanced_search">
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item name="name" label="名称">
                  <Input placeholder="请输入名称" />
                </Form.Item>
              </Col>
              <div className="text-left">
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    onClick={doQuery}
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建
            </Button>

            <Button type="primary" icon={<SyncOutlined />} onClick={doQuery}>
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
      )}
    </>
  );
}
