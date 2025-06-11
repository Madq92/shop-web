"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  TreeSelect,
} from "antd";
import Box from "@/components/box";
import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import ResourceController, {
  ResourceDTO,
  ResourceType,
} from "@/api/sys/ResourceController";
import { treeDataTranslate } from "@/common/utils";

const ResourceTypeTag: React.FC<{ resourceTypeStr: string | undefined }> = ({
  resourceTypeStr,
}) => {
  if (!resourceTypeStr) {
    return <></>;
  }
  const resourceType =
    ResourceType[resourceTypeStr as keyof typeof ResourceType];
  return (
    <Tag color={resourceType === ResourceType.MENU ? "blue" : "magenta"}>
      {resourceType}
    </Tag>
  );
};

export default function ResourcePage() {
  const [resources, setResources] = useState<ResourceDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resourceForm] = Form.useForm<ResourceDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentResource, setCurrentResource] = useState<ResourceDTO>();
  const [resourceType, setResourceType] = useState<string>("MENU");

  const columns: TableProps<ResourceDTO>["columns"] = [
    {
      title: "资源名称",
      dataIndex: "resourceName",
      key: "resourceName",
    },
    {
      title: "资源图标",
      dataIndex: "icon",
      key: "icon",
    },
    {
      title: "资源类型",
      dataIndex: "resourceType",
      key: "resourceType",
      render: (_, resourceDto) => (
        <ResourceTypeTag
          resourceTypeStr={resourceDto.resourceType}
        ></ResourceTypeTag>
      ),
    },
    {
      title: "菜单路由",
      dataIndex: "url",
      key: "url",
    },
    {
      title: "权限标识",
      dataIndex: "perms",
      key: "perms",
    },
    {
      title: "显示顺序",
      dataIndex: "sort",
      key: "sort",
    },
    {
      title: "操作",
      render: (_, resourceDto) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setCurrentResource(resourceDto);
              setResourceType(resourceDto.resourceType);
              resourceForm.setFieldsValue(resourceDto);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await ResourceController.delete(resourceDto.resourceId);
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
    const result = await ResourceController.list();
    setResources(result || []);
    setLoading(false);
  };

  useEffect(() => {
    doQuery();
  }, []);

  const resourcesTree = useMemo(() => {
    return treeDataTranslate(resources, "resourceId", "parentResourceId");
  }, [resources]);

  const menuTree = useMemo(() => {
    const menuList = resources
      .filter((resourceDto) => resourceDto.resourceType === "MENU")
      .map((resourceDto) => ({
        title: resourceDto.resourceName,
        value: resourceDto.resourceId,
        parentId: resourceDto.parentResourceId,
      }));
    return treeDataTranslate(menuList, "value", "parentId");
  }, [resources]);

  function handleSubmit() {
    resourceForm.validateFields().then(async (resourceDto) => {
      if (currentResource) {
        // 编辑
        await ResourceController.edit(currentResource.resourceId, resourceDto);
      } else {
        // 创建
        await ResourceController.create(resourceDto);
      }
      await doQuery();
      setModalVisible(false);
    });
  }

  const handleParentResourceIdOnChange = (value: string) => {
    resourceForm.setFieldsValue({
      parentResourceId: value,
    });
  };

  return (
    <>
      <Box>
        <div className="pb-4">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentResource(undefined);
                setModalVisible(true);
                resourceForm.resetFields();
                resourceForm.setFieldsValue({
                  resourceType,
                });
              }}
            >
              创建资源
            </Button>

            <Button type="primary" icon={<SyncOutlined />} onClick={doQuery}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          dataSource={resourcesTree}
          columns={columns}
          rowKey={(record) => record.resourceId}
          loading={loading}
          pagination={false}
        />
      </Box>

      {/*====> 弹窗 begin*/}
      <Modal
        title={currentResource ? "编辑资源" : "创建资源"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          resourceForm.resetFields();
        }}
        footer={null}
      >
        <div className="pt-4">
          <Form form={resourceForm} layout="vertical" name="deviceForm">
            <Form.Item name="parentResourceId" label="上级资源ID">
              <TreeSelect
                value={
                  modalVisible
                    ? resourceForm.getFieldValue("parentResourceId")
                    : undefined
                }
                treeData={menuTree}
                placeholder="请选择父资源"
                treeDefaultExpandAll
                onChange={handleParentResourceIdOnChange}
              />
            </Form.Item>
            <Form.Item
              name="resourceName"
              label="资源名称"
              rules={[{ required: true, message: "请输入资源名称" }]}
            >
              <Input placeholder="请输入资源名称" />
            </Form.Item>
            <Form.Item
              name="resourceType"
              label="资源类型"
              rules={[{ required: true, message: "请输入资源类型" }]}
            >
              <Select
                onChange={(value) => {
                  setResourceType(value);
                }}
                options={[
                  { value: "MENU", label: "菜单" },
                  { value: "API", label: "接口" },
                ]}
              />
            </Form.Item>
            {resourceType && resourceType === "MENU" && (
              <Form.Item name="url" label="菜单URL">
                <Input placeholder="请输入菜单URL" />
              </Form.Item>
            )}
            {resourceType && resourceType === "API" && (
              <Form.Item name="perms" label="权限标识">
                <Input placeholder="请输入权限标识" />
              </Form.Item>
            )}
            <Form.Item name="sort" label="排序">
              <Input type="number" placeholder="请输入排序" />
            </Form.Item>
            <div className="text-right">
              <Space>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setModalVisible(false);
                    resourceForm.resetFields();
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
        </div>
      </Modal>
      {/*====> 弹窗 end*/}
    </>
  );
}
