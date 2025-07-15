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
  Tag,
} from "antd";
import Box from "@/components/box";
import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import ContactController, {
  ContactDTO,
  ContactQueryReq,
} from "@/api/crm/ContactController";

export default function CategoryPage() {
  const [contactList, setContactList] = useState<ContactDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [contactForm] = Form.useForm<ContactDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentContact, setCurrentContact] = useState<ContactDTO>();
  const [queryForm] = Form.useForm<ContactQueryReq>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const columns: TableProps<ContactDTO>["columns"] = [
    {
      title: "昵称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "职位",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ENABLE" ? "green" : "gray"}>
          {status === "ENABLE" ? "启用" : "停用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      render: (_, contactDto) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(contactDto)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await ContactController.delete(contactDto.contactId);
              doQuery();
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  const doQuery = async (currentPage = 1) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const result = await ContactController.page({
      ...queryParam,
      pageNum: currentPage,
      pageSize,
    });
    setContactList(result.records || []);
    setTotal(result.total);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCurrentContact(undefined);
    contactForm.resetFields();

    setModalVisible(true);
  };

  const handleEdit = async (contactDTO: ContactDTO) => {
    setCurrentContact(contactDTO);
    contactForm.setFieldsValue(contactDTO);
    setModalVisible(true);
  };

  useEffect(() => {
    doQuery();
  }, []);

  function handleSubmit() {
    contactForm.validateFields().then(async (contactDto) => {
      if (currentContact) {
        // 编辑
        await ContactController.edit(currentContact.contactId, contactDto);
      } else {
        // 创建
        await ContactController.create(contactDto);
      }
      await doQuery();
      setModalVisible(false);
    });
  }

  const handlePageOnChange = (page: number, pageSize: number) => {
    setPageNum(page);
    setPageSize(pageSize);
    doQuery(page);
  };
  return (
    <>
      <Box className="mb-4">
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="昵称">
                <Input placeholder="请输入昵称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space className="text-left">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  onClick={() => doQuery()}
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
            </Col>
          </Row>
        </Form>
      </Box>
      <Box>
        <Space className="pb-4">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建联系人
          </Button>

          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => doQuery()}
          >
            刷新
          </Button>
        </Space>
        <Table
          dataSource={contactList}
          columns={columns}
          rowKey={(record) => record.contactId}
          loading={loading}
          pagination={{
            total,
            pageSize,
            current: pageNum,
            onChange: handlePageOnChange,
          }}
        />
      </Box>
      {/*====> 弹窗 begin*/}
      <Modal
        title={currentContact ? "编辑联系人" : "创建联系人"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          contactForm.resetFields();
        }}
        footer={null}
      >
        <Form form={contactForm} layout="vertical" name="deviceForm">
          <Form.Item
            name="name"
            label="昵称"
            rules={[{ required: true, message: "请输入昵称" }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item name="title" label="职位">
            <Input placeholder="请输入职位" />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  contactForm.resetFields();
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
      {/*====> 弹窗 end*/}
    </>
  );
}
