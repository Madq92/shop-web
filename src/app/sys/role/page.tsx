"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Table,
  TableProps,
  Tree,
} from "antd";
import Box from "@/components/box";
import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import RoleController, { RoleDTO } from "@/api/sys/RoleController";
import ResourceController, { ResourceDTO } from "@/api/sys/ResourceController";
import type { DataNode } from "antd/es/tree";

export default function RolePage() {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [roleForm] = Form.useForm<RoleDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalDetailVisible, setModalDetailVisible] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<RoleDTO>();
  const [resourceTree, setResourceTree] = useState<DataNode[]>([]);
  const [checkedKeyList, setCheckedKeyList] = useState<string[]>([]);

  const columns: TableProps<RoleDTO>["columns"] = [
    {
      title: "角色名称",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "角色权限字符串",
      dataIndex: "roleKey",
      key: "roleKey",
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
    },
    {
      title: "操作",
      render: (_, roleDto) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              const data = await RoleController.detail(roleDto.roleId);
              setCurrentRole(data);
              const key = data.resources?.map((resource) => {
                return resource.resourceId;
              });
              ResourceController.tree().then((data) => {
                setResourceTree(data);
              });
              setCheckedKeyList(key);
              setModalDetailVisible(true);
            }}
          >
            详情
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(roleDto)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await RoleController.delete(roleDto.roleId);
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
    const result = await RoleController.list();
    setRoles(result || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCurrentRole(undefined);
    setCheckedKeyList([]);
    roleForm.resetFields();

    ResourceController.tree().then((data) => {
      setResourceTree(data);
    });

    setModalVisible(true);
  };

  const handleEdit = async (roleDto: RoleDTO) => {
    RoleController.detail(roleDto.roleId).then((data) => {
      setCurrentRole(data);
      setCheckedKeyList(data.resources.map((resource) => resource.resourceId));
      roleForm.setFieldsValue(data);
    });

    ResourceController.tree().then((data) => {
      setResourceTree(data);
    });

    setModalVisible(true);
  };

  useEffect(() => {
    doQuery();
  }, []);

  function handleSubmit() {
    roleForm.validateFields().then(async (roleDto) => {
      const resources = checkedKeyList?.map((resourceId) => {
        return {
          resourceId,
        } as ResourceDTO;
      });
      if (currentRole) {
        // 编辑
        await RoleController.edit(currentRole.roleId, {
          ...roleDto,
          resources,
        });
      } else {
        // 创建
        await RoleController.create({ ...roleDto, resources });
      }
      await doQuery();
      setModalVisible(false);
    });
  }

  const roleDetailItems = useMemo(() => {
    return [
      {
        key: "1",
        label: "角色名称",
        children: currentRole?.roleName,
      },
      {
        key: "2",
        label: "角色Key",
        children: currentRole?.roleKey,
      },
      {
        key: "3",
        label: "排序",
        children: currentRole?.sort,
      },
    ];
  }, [currentRole]);

  return (
    <>
      <div className="mt-4">
        <Box>
          <div className="pb-4">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                创建角色
              </Button>

              <Button type="primary" icon={<SyncOutlined />} onClick={doQuery}>
                刷新
              </Button>
            </Space>
          </div>
          <Table
            dataSource={roles}
            columns={columns}
            rowKey={(record) => record.roleId}
            loading={loading}
            pagination={false}
          />
        </Box>
      </div>

      {/*====> 弹窗 begin*/}
      <Modal
        title={currentRole ? "编辑角色" : "创建角色"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          roleForm.resetFields();
        }}
        footer={null}
      >
        <Form form={roleForm} layout="vertical" name="deviceForm">
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: "请输入角色名称" }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="roleKey"
            label="角色权限字符串"
            rules={[{ required: true, message: "请输入角色权限字符串" }]}
          >
            <Input placeholder="请输入角色权限字符串" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>
          <Form.Item name="resources" label="角色资源权限">
            <Card type="inner">
              <Tree
                treeData={resourceTree}
                checkedKeys={checkedKeyList}
                onCheck={(checkedKeys) => {
                  setCheckedKeyList(checkedKeys as string[]);
                }}
                checkable={true}
              ></Tree>
            </Card>
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  roleForm.resetFields();
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

      <Modal
        open={modalDetailVisible}
        onCancel={() => {
          setModalDetailVisible(false);
        }}
        footer={null}
      >
        <div className="pt-4">
          <Descriptions
            title="角色详情"
            bordered
            items={roleDetailItems}
            column={1}
          />
          <Card type="inner" title="角色资源权限">
            <Tree
              treeData={resourceTree}
              checkedKeys={checkedKeyList}
              checkable={true}
            ></Tree>
          </Card>
        </div>
      </Modal>
      {/*====> 弹窗 end*/}
    </>
  );
}
