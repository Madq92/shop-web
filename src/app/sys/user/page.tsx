"use client";

import UserController, {
  UserDTO,
  UserGender,
  UserStatus,
} from "@/api/sys/UserController";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
} from "antd";
import Box from "@/components/box";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

type QueryParamType = {
  name: string;
  email: string;
  phonenumber: string;
  sex: string;
  status: string;
};

const UserGenderTag: React.FC<{ genderStr: string | undefined }> = ({
  genderStr,
}) => {
  if (!genderStr) {
    return <></>;
  }
  const gender = UserGender[genderStr as keyof typeof UserGender];
  return (
    <Tag color={gender === UserGender.MALE ? "blue" : "magenta"}>{gender}</Tag>
  );
};

const UserStatusTag: React.FC<{ statusStr: string | undefined }> = ({
  statusStr,
}) => {
  if (!statusStr) {
    return <></>;
  }
  const status = UserStatus[statusStr as keyof typeof UserStatus];
  return (
    <Tag color={status === UserStatus.ENABLE ? "green" : "red"}>{status}</Tag>
  );
};

export default function UserPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userForm] = Form.useForm<UserDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalDetailVisible, setModalDetailVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserDTO>();
  const [queryForm] = Form.useForm<QueryParamType>();
  const [addRoleVisible, setAddRoleVisible] = useState<boolean>();

  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const columns: TableProps<UserDTO>["columns"] = [
    // {
    //     title: '头像',
    //     dataIndex: 'avatar',
    //     key: 'avatar',
    // },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "电话",
      dataIndex: "phonenumber",
      key: "phonenumber",
    },
    {
      title: "性别",
      dataIndex: "sex",
      key: "sex",
      render: (_, userDto) => (
        <UserGenderTag genderStr={userDto.gender}></UserGenderTag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (_, userDto) => (
        <UserStatusTag statusStr={userDto.status}></UserStatusTag>
      ),
    },
    {
      title: "上次登录时间",
      dataIndex: "loginDate",
      key: "loginDate",
      render: (_, userDto) => {
        const loginDate = dayjs(userDto.loginDate);
        if (!loginDate.isValid()) {
          return "";
        }
        return loginDate.format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "操作",
      render: (_, userDto) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              const data = await UserController.detail(userDto.userId);
              setCurrentUser(data);
              setModalDetailVisible(true);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setCurrentUser(userDto);
              userForm.setFieldsValue(userDto);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          {UserStatus[userDto.status as keyof typeof UserStatus] ===
          UserStatus.ENABLE ? (
            <Button
              type="link"
              size="small"
              onClick={() => handleUserDisable(userDto.userId)}
            >
              停用
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={() => handleUserEnable(userDto.userId)}
            >
              启用
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleUserDelete(userDto.userId)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  const doQueryUser = async (currentPage = 1) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const pageResult = await UserController.page({
      ...queryParam,
      pageNum: currentPage,
      pageSize,
    });
    setUsers(pageResult.records || []);
    setTotal(pageResult.total);
    setLoading(false);
  };

  useEffect(() => {
    doQueryUser(pageNum);
  }, []);

  const handleSubmit = () => {
    userForm.validateFields().then(async (userDTO) => {
      if (currentUser) {
        // 编辑
        await UserController.edit(currentUser.userId, userDTO);
      } else {
        // 创建
        await UserController.create(userDTO);
      }
      await doQueryUser(1);
      setModalVisible(false);
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
    userForm.resetFields();
  };

  const handleUserDisable = async (userId: string) => {
    await UserController.disable(userId);
    doQueryUser(1);
  };

  const handleUserEnable = async (userId: string) => {
    await UserController.enable(userId);
    doQueryUser(1);
  };

  const handleUserDelete = async (userId: string) => {
    await UserController.del(userId);
    doQueryUser(1);
  };

  const handlePageOnChange = (page: number, pageSize: number) => {
    setPageNum(page);
    setPageSize(pageSize);
    doQueryUser(page);
  };

  const reloadData = () => {
    setPageNum(1);
    doQueryUser(1);
  };

  return (
    <>
      <Box>
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="姓名">
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="phonenumber" label="电话">
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Option value="ENABLE">启用</Option>
                  <Option value="DISABLE">停用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="gender" label="性别">
                <Select>
                  <Option value="MALE">男</Option>
                  <Option value="FEMALE">女</Option>
                  <Option value="NONE">未知</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="text-left">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                onClick={reloadData}
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
                setCurrentUser(undefined);
                setModalVisible(true);
                userForm.resetFields();
              }}
            >
              创建用户
            </Button>
          </div>
          <Table
            dataSource={users}
            columns={columns}
            rowKey={(record) => record.userId}
            loading={loading}
            pagination={{
              total,
              pageSize,
              current: pageNum,
              onChange: handlePageOnChange,
            }}
          />
        </Box>
      </div>

      {/*====> 弹窗 begin*/}
      <Modal
        title={currentUser ? "编辑用户" : "创建用户"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={userForm} layout="vertical" name="deviceForm">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phonenumber"
            label="电话"
            rules={[{ required: true, message: "请输入电话" }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: false, message: "请输入邮箱" }]}
          >
            <Input placeholder="例如: admin@qq.com" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别" defaultValue={currentUser?.gender}>
              <Option value="MALE">男</Option>
              <Option value="FEMALE">女</Option>
            </Select>
          </Form.Item>
          {currentUser && (
            <Form.Item name="status" label="状态">
              <Select
                placeholder="请选择状态"
                defaultValue={currentUser.status}
              >
                <Option value="ENABLE">启用</Option>
                <Option value="DISABLE">停用</Option>
              </Select>
            </Form.Item>
          )}
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
        title={"用户详情"}
        open={modalDetailVisible}
        onCancel={() => {
          setModalDetailVisible(false);
        }}
        footer={null}
      >
        <div className="pt-4">
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label="姓名">{currentUser?.name}</Form.Item>
            <Form.Item label="邮箱">{currentUser?.email}</Form.Item>
            <Form.Item label="电话">{currentUser?.phonenumber}</Form.Item>
            <Form.Item label="上次登录时间">
              {currentUser?.loginDate
                ? dayjs(currentUser?.loginDate).format("YYYY-MM-DD HH:mm:ss")
                : ""}
            </Form.Item>
            <Form.Item label="性别">
              <UserGenderTag genderStr={currentUser?.gender}></UserGenderTag>
            </Form.Item>
            <Form.Item label="状态">
              <UserStatusTag statusStr={currentUser?.status}></UserStatusTag>
            </Form.Item>

            <Form.Item label="角色">
              {currentUser?.roles &&
                currentUser?.roles.map((role, index) => {
                  return (
                    <Tag
                      key={index}
                      closable={{
                        closeIcon: <DeleteOutlined />,
                        "aria-label": "Close Button",
                      }}
                      onClose={console.log}
                    >
                      {role.roleName}
                    </Tag>
                  );
                })}

              {addRoleVisible ? (
                <Input type="text" size="small" style={{ width: 78 }} />
              ) : (
                <Tag onClick={() => setAddRoleVisible(true)}>
                  <PlusOutlined /> 添加角色
                </Tag>
              )}
            </Form.Item>

            <Form.Item label="资源">
              {currentUser?.resources &&
                currentUser?.resources.map((resource, index) => {
                  return <Tag key={index}>{resource.resourceName}</Tag>;
                })}
            </Form.Item>
          </Form>
        </div>
      </Modal>
      {/*====> 弹窗 end*/}
    </>
  );
}
