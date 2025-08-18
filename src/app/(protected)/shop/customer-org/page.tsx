'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, TableProps, Tag } from 'antd';
import Box from '@/components/box';
import { CheckOutlined, CloseOutlined, PlusOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { enumToOptions, StatusLabels } from '@/api/types';
import CustomerOrgController, { CustomerOrgDTO, CustomerOrgPageReq } from '@/api/shop/CustomerOrgController';
import { PartnerOrgTypeEnumLabels } from '@/api/crm/PartnerOrgController';

const typeOption = enumToOptions(PartnerOrgTypeEnumLabels);
const statusOption = enumToOptions(StatusLabels);

export default function CustomerOrgPage() {
  const [modelList, setModelList] = useState<CustomerOrgDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modelForm] = Form.useForm<CustomerOrgDTO>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<CustomerOrgDTO>();
  const [queryForm] = Form.useForm<CustomerOrgPageReq>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const columns: TableProps<CustomerOrgDTO>['columns'] = [
    {
      title: '组织机构简称',
      dataIndex: 'shortName',
      key: 'shortName',
    },
    {
      title: '组织机构名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '注册地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '网址',
      dataIndex: 'website',
      key: 'website',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, CustomerOrgDTO) => <Tag color={CustomerOrgDTO.status === 'ENABLE' ? 'green' : 'gray'}>{StatusLabels[CustomerOrgDTO.status]}</Tag>,
    },
    {
      title: '操作',
      render: (_, customerOrgDTO) => (
        <>
          <Button type="link" size="small" onClick={() => handleDetail(customerOrgDTO)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(customerOrgDTO)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await CustomerOrgController.delete(customerOrgDTO.customerOrgId);
              doQuery();
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  const doQuery = async (currentPage = pageNum, currentPageSize = pageSize) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const result = await CustomerOrgController.page({
      ...queryParam,
      pageNum: currentPage,
      pageSize: currentPageSize,
    });
    setModelList(result.records || []);
    setTotal(result.total);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCurrentModel(undefined);
    modelForm.resetFields();

    setModalVisible(true);
  };

  const handleEdit = async (CustomerOrgDTO: CustomerOrgDTO) => {
    setCurrentModel(CustomerOrgDTO);
    modelForm.setFieldsValue(CustomerOrgDTO);
    setModalVisible(true);
  };

  function handleDetail(CustomerOrgDTO: CustomerOrgDTO) {
    console.log('handleDetail', CustomerOrgDTO);
  }

  useEffect(() => {
    doQuery(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    modelForm.validateFields().then(async dto => {
      if (currentModel) {
        // 编辑
        await CustomerOrgController.edit(currentModel.customerOrgId, dto);
      } else {
        // 创建
        await CustomerOrgController.create(dto);
      }
      await doQuery();
      setModalVisible(false);
    });
  }

  const handlePageOnChange = (page: number, pageSize: number) => {
    setPageNum(page);
    setPageSize(pageSize);
    doQuery(page, pageSize);
  };
  return (
    <>
      <Box className="mb-4">
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="组织机构名称">
                <Input placeholder="请输入组织机构名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space className="text-left">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} onClick={() => doQuery()}>
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

          <Button type="primary" icon={<SyncOutlined />} onClick={() => doQuery(pageNum)}>
            刷新
          </Button>
        </Space>
        <Table
          dataSource={modelList}
          columns={columns}
          rowKey={record => record.customerOrgId}
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
        title={currentModel ? '编辑联系人' : '创建联系人'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          modelForm.resetFields();
        }}
        footer={null}
      >
        <Form form={modelForm} layout="vertical" name="deviceForm">
          <Form.Item name="name" label="组织机构名称" rules={[{ required: true, message: '组织机构名称' }]}>
            <Input placeholder="请输入组织机构名称" />
          </Form.Item>

          <Form.Item name="shortName" label="组织机构简称" rules={[{ required: true, message: '组织机构简称' }]}>
            <Input placeholder="请输入组织机构简称" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={typeOption}></Select>
          </Form.Item>
          <Form.Item name="taxId" label="税号/统一社会信用代码">
            <Input placeholder="请输入税号/统一社会信用代码" />
          </Form.Item>
          <Form.Item name="address" label="办公地址">
            <Input placeholder="请输入办公地址" />
          </Form.Item>
          <Form.Item name="bankName" label="开户行">
            <Input placeholder="请输入开户行" />
          </Form.Item>

          <Form.Item name="bankAccount" label="开户账号">
            <Input placeholder="请输入开户账号" />
          </Form.Item>

          <Form.Item name="website" label="网址">
            <Input placeholder="请输入网址" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input placeholder="请输入备注" />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select options={statusOption}></Select>
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setModalVisible(false);
                  modelForm.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" icon={<CheckOutlined />} onClick={handleSubmit}>
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
