"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
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
import CategoryController, {
  CategoryDTO,
  CategoryQueryReq,
} from "@/api/prod/CategoryController";

export default function RolePage() {
  const [categoryList, setCategoryList] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryForm] = Form.useForm<CategoryDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryDTO>();
  const [queryForm] = Form.useForm<CategoryQueryReq>();

  const columns: TableProps<CategoryDTO>["columns"] = [
    {
      title: "分类名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
    },
    {
      title: "操作",
      render: (_, categoryDto) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(categoryDto)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await CategoryController.delete(categoryDto.categoryId);
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
    const result = await CategoryController.list(queryParam);
    setCategoryList(result || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCurrentCategory(undefined);
    categoryForm.resetFields();

    setModalVisible(true);
  };

  const handleEdit = async (categoryDto: CategoryDTO) => {
    setCurrentCategory(categoryDto);
    categoryForm.setFieldsValue(categoryDto);
    setModalVisible(true);
  };

  useEffect(() => {
    doQuery();
  }, []);

  function handleSubmit() {
    categoryForm.validateFields().then(async (category) => {
      if (currentCategory) {
        // 编辑
        await CategoryController.edit(currentCategory.categoryId, category);
      } else {
        // 创建
        await CategoryController.create(category);
      }
      await doQuery();
      setModalVisible(false);
    });
  }

  return (
    <>
      <div className="bg-white mb-4 p-6">
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="分类名称">
                <Input placeholder="请输入分类名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="parentId" label="父分类">
                <Input placeholder="请输入分类名称" />
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
      </div>
      <Box>
        <div className="pb-4">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建分类
            </Button>

            <Button type="primary" icon={<SyncOutlined />} onClick={doQuery}>
              刷新
            </Button>
          </Space>
        </div>
        <Table
          dataSource={categoryList}
          columns={columns}
          rowKey={(record) => record.categoryId}
          loading={loading}
          pagination={false}
        />
      </Box>
      {/*====> 弹窗 begin*/}
      <Modal
        title={currentCategory ? "编辑角色" : "创建角色"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          categoryForm.resetFields();
        }}
        footer={null}
      >
        <Form form={categoryForm} layout="vertical" name="deviceForm">
          <Form.Item name="parentId" label="父分类">
            <Card type="inner">下拉列表</Card>
          </Form.Item>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: "请输入分类名称" }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  categoryForm.resetFields();
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
