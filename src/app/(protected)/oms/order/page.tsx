'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Form, Input, Row, Space, Table, TableProps, Tag } from 'antd';
import Box from '@/components/box';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import OrderController, { OrderDTO, OrderPageReq, OrderStatusLabels } from '@/api/oms/OrderController';

export default function OrderPage() {
  const [modelList, setModelList] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryForm] = Form.useForm<OrderPageReq>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const columns: TableProps<OrderDTO>['columns'] = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
    },
    {
      title: '订单来源',
      dataIndex: 'orderSource',
      key: 'orderSource',
    },
    {
      title: '顾客名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '机构名称',
      dataIndex: 'partnerOrgName',
      key: 'partnerOrgName',
    },
    {
      title: '支付完成',
      dataIndex: 'paid',
      key: 'paid',
    },
    {
      title: '账单金额',
      dataIndex: 'billAmount',
      key: 'billAmount',
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (_, orderDTO) => <Tag>{OrderStatusLabels[orderDTO.orderStatus!].label}</Tag>,
    },
    {
      title: '操作',
      render: (_, orderDTO) => (
        <>
          <Button type="link" size="small" onClick={() => handleDetail(orderDTO)}>
            详情
          </Button>
        </>
      ),
    },
  ];

  const doQuery = async (currentPage = pageNum, currentPageSize = pageSize) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const result = await OrderController.page({
      ...queryParam,
      pageNum: currentPage,
      pageSize: currentPageSize,
    });
    setModelList(result.records || []);
    setTotal(result.total);
    setLoading(false);
  };

  function handleDetail(OrderDTO: OrderDTO) {
    console.log('handleDetail', OrderDTO);
  }

  useEffect(() => {
    doQuery(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              <Form.Item name="orderNo" label="订单编号">
                <Input placeholder="请输入订单编号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="customerId" label="顾客名称">
                <Input placeholder="请输入顾客名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="partnerOrgId" label="机构名称">
                <Input placeholder="请输入机构名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="状态">
                <Input placeholder="请输入订单状态" />
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
          <Button type="primary" icon={<SyncOutlined />} onClick={() => doQuery(pageNum)}>
            刷新
          </Button>
        </Space>
        <Table
          dataSource={modelList}
          columns={columns}
          rowKey={record => record.orderId!}
          loading={loading}
          pagination={{
            total,
            pageSize,
            current: pageNum,
            onChange: handlePageOnChange,
          }}
        />
      </Box>
    </>
  );
}
