"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  TableProps,
} from "antd";
import Box from "@/components/box";
import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import ConfigController, {
  ConfigDTO,
  ConfigQueryReq,
} from "@/api/sys/ConfigController";
import TextArea from "antd/es/input/TextArea";

export default function ConfigPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalDetailVisible, setModalDetailVisible] = useState<boolean>(false);
  const [currentConfig, setCurrentConfig] = useState<ConfigDTO>();
  const [queryForm] = Form.useForm<ConfigQueryReq>();
  const [configForm] = Form.useForm<ConfigDTO>();
  const [configDTOList, setConfigDTOList] = useState<ConfigDTO[]>();

  const columns: TableProps<ConfigDTO>["columns"] = [
    {
      title: "配置类型",
      dataIndex: "configType",
      key: "configType",
    },
    {
      title: "参数名称",
      dataIndex: "configName",
      key: "configName",
    },
    {
      title: "参数键",
      dataIndex: "configKey",
      key: "configKey",
    },
    {
      title: "参数键值",
      dataIndex: "configValue",
      key: "configValue",
    },
    {
      title: "操作",
      render: (_, configDTO) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              const config = await ConfigController.detail(configDTO.configId);
              setCurrentConfig(config);
              setModalDetailVisible(true);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              const currentConfig = await ConfigController.detail(
                configDTO.configId,
              );
              setCurrentConfig(currentConfig);
              configForm.setFieldsValue(currentConfig);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await ConfigController.delete(configDTO.configId);
              doQuery();
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  const doQuery = async () => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const data = await ConfigController.list(queryParam);
    setConfigDTOList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    doQuery();
  }, []);

  const handleSubmit = () => {
    configForm.validateFields().then(async (configDto) => {
      if (currentConfig) {
        // 编辑
        await ConfigController.edit(currentConfig.configId, configDto);
      } else {
        // 创建
        await ConfigController.create(configDto);
      }
      await doQuery();
      setModalVisible(false);
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
    configForm.resetFields();
  };

  return (
    <>
      <Box>
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="configType" label="配置类型">
                <Input placeholder="请输入配置类型" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="configKey" label="配置键">
                <Input placeholder="请输入配置键" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="configName" label="配置名称">
                <Input placeholder="请输入配置名称" />
              </Form.Item>
            </Col>
          </Row>
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
        </Form>
      </Box>

      <div className="mt-4">
        <Box>
          <div className="pb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentConfig(undefined);
                setModalVisible(true);
                configForm.resetFields();
              }}
            >
              创建配置
            </Button>
          </div>
          <Table
            dataSource={configDTOList}
            columns={columns}
            rowKey={(record) => record.configId}
            loading={loading}
            pagination={false}
          />
        </Box>
      </div>

      {/*====> 弹窗 begin*/}
      <Modal
        title={currentConfig ? "编辑配置" : "创建配置"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={configForm} layout="vertical" name="deviceForm">
          <Form.Item
            name="configType"
            label="配置类型"
            rules={[{ required: true, message: "请输入配置类型" }]}
          >
            <Input placeholder="请输入配置类型" />
          </Form.Item>
          <Form.Item
            name="configName"
            label="配置名称"
            rules={[{ required: true, message: "请输入配置名称" }]}
          >
            <Input placeholder="请输入配置名称" />
          </Form.Item>
          <Form.Item
            name="configKey"
            label="配置键名"
            rules={[{ required: true, message: "请输入配置键名" }]}
          >
            <Input placeholder="请输入配置键名" />
          </Form.Item>

          <Form.Item
            name="configValue"
            label="配置键值"
            rules={[{ required: true, message: "请输入配置键值" }]}
          >
            <TextArea rows={4} placeholder="请输入配置键值" />
          </Form.Item>

          <div className="text-right">
            <Space>
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
          </div>
        </Form>
      </Modal>

      <Modal
        title={"配置详情"}
        open={modalDetailVisible}
        onCancel={() => {
          setModalDetailVisible(false);
        }}
        footer={null}
      >
        <div className="pt-4">
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label="配置类型">{currentConfig?.configType}</Form.Item>
            <Form.Item label="配置键名">{currentConfig?.configKey}</Form.Item>
            <Form.Item label="参数名称">{currentConfig?.configName}</Form.Item>
            <Form.Item label="配置键值">{currentConfig?.configValue}</Form.Item>
          </Form>
        </div>
      </Modal>
      {/*====> 弹窗 end*/}
    </>
  );
}
