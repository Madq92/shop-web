'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Col, Form, Input, Modal, Row, Select, Space, Table, TableProps, Tag, message } from 'antd';
import Box from '@/components/box';
import { PlusOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import OrderController, { DeliveryWay, DeliveryWayLabels, OrderDTO, OrderPageReq, OrderStatus, OrderStatusLabels } from '@/api/oms/OrderController';
import { enumToOptions } from '@/api/types';
import OrderDetailModal from './components/order-detail-modal';
import DeliverModal from './components/deliver-modal';
import ReturnModal from './components/return-modal';

const orderStatusOptions = enumToOptions(OrderStatusLabels);

/** 根据 orderStatus 返回可执行的操作类型 */
function getActions(status?: OrderStatus): string[] {
  switch (status) {
    case 0: return ['confirm', 'edit', 'delete'];
    case 1: return ['pay', 'cancel', 'edit'];
    case 2: return ['deliver', 'close', 'edit'];
    case 3: return ['receive'];
    case 5: return ['delete'];
    default: return [];
  }
}

export default function OrderPage() {
  const router = useRouter();
  const [modelList, setModelList] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryForm] = Form.useForm<OrderPageReq>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // 弹窗状态
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEditable, setDetailEditable] = useState(false);
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<OrderDTO | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);

  const handleAction = useCallback(async (orderId: string, action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'confirm':
          await OrderController.confirmOrder(orderId);
          message.success('确认下单成功');
          break;
        case 'pay':
          await OrderController.pay(orderId);
          message.success('支付成功');
          break;
        case 'cancel':
          await OrderController.cancelOrder(orderId);
          message.success('取消成功');
          break;
        case 'receive':
          await OrderController.receiveOrder(orderId);
          message.success('收货成功');
          break;
        case 'close':
          await OrderController.adminClose(orderId);
          message.success('关闭成功');
          break;
      }
      doQuery(pageNum);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  const handleDelete = useCallback((orderId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除该订单吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          await OrderController.delete(orderId);
          message.success('删除成功');
          doQuery(pageNum);
        } finally {
          setLoading(false);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum]);

  const columns: TableProps<OrderDTO>['columns'] = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 200,
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
      title: '账单金额',
      dataIndex: 'billAmount',
      key: 'billAmount',
      render: (v: number) => v != null ? `¥${(v / 100).toFixed(2)}` : '-',
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (_, orderDTO) => (
        <Tag color={orderDTO.orderStatus != null ? OrderStatusLabels[orderDTO.orderStatus].color : 'default'}>
          {orderDTO.orderStatus != null ? OrderStatusLabels[orderDTO.orderStatus].label : '-'}
        </Tag>
      ),
    },
    {
      title: '配送方式',
      dataIndex: 'deliveryWay',
      key: 'deliveryWay',
      render: (v: DeliveryWay) => v ? <Tag color={DeliveryWayLabels[v]?.color}>{DeliveryWayLabels[v]?.label}</Tag> : '-',
    },
    {
      title: '操作',
      width: 320,
      render: (_, orderDTO) => {
        const actions = getActions(orderDTO.orderStatus);
        return (
          <Space>
            <Button type="link" size="small" onClick={() => { setDetailOrderId(orderDTO.orderId!); setDetailOpen(true); setDetailEditable(orderDTO.orderStatus === 0 || orderDTO.orderStatus === 1); }}>
              详情
            </Button>
            {actions.includes('edit') && (
              <Button type="link" size="small" onClick={() => router.push(`/oms/order-edit?orderId=${orderDTO.orderId}`)}>
                编辑
              </Button>
            )}
            {actions.includes('confirm') && (
              <Button type="link" size="small" onClick={() => handleAction(orderDTO.orderId!, 'confirm')}>
                确认下单
              </Button>
            )}
            {actions.includes('pay') && (
              <Button type="link" size="small" onClick={() => handleAction(orderDTO.orderId!, 'pay')}>
                支付
              </Button>
            )}
            {actions.includes('cancel') && (
              <Button type="link" size="small" danger onClick={() => handleAction(orderDTO.orderId!, 'cancel')}>
                取消
              </Button>
            )}
            {actions.includes('deliver') && (
              <Button type="link" size="small" onClick={() => { setDeliverOrderId(orderDTO.orderId!); setDeliverOpen(true); }}>
                发货
              </Button>
            )}
            {actions.includes('close') && (
              <Button type="link" size="small" danger onClick={() => handleAction(orderDTO.orderId!, 'close')}>
                关闭
              </Button>
            )}
            {actions.includes('receive') && (
              <Button type="link" size="small" onClick={() => handleAction(orderDTO.orderId!, 'receive')}>
                确认收货
              </Button>
            )}
            {orderDTO.returnId && (
              <Button type="link" size="small" onClick={() => { setReturnOrder(orderDTO); setReturnOpen(true); }}>
                售后
              </Button>
            )}
            {actions.includes('delete') && (
              <Button type="link" size="small" danger onClick={() => handleDelete(orderDTO.orderId!)}>
                删除
              </Button>
            )}
          </Space>
        );
      },
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

  useEffect(() => {
    doQuery(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageOnChange = (page: number, size: number) => {
    setPageNum(page);
    setPageSize(size);
    doQuery(page, size);
  };

  const onDeliverSuccess = () => doQuery(pageNum);
  const onReturnSuccess = () => doQuery(pageNum);

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
                <Select placeholder="请选择状态" allowClear options={orderStatusOptions} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space className="text-left">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} onClick={() => doQuery()}>
                  查询
                </Button>
                <Button icon={<SyncOutlined />} onClick={() => { queryForm.resetFields(); }}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Box>
      <Box>
        <Space className="pb-4">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/oms/order-create')}>
            创建订单
          </Button>
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

      <OrderDetailModal orderId={detailOrderId} open={detailOpen} editable={detailEditable} onClose={() => { setDetailOpen(false); setDetailOrderId(null); }} />
      {deliverOrderId && <DeliverModal orderId={deliverOrderId} open={deliverOpen} onClose={() => { setDeliverOpen(false); setDeliverOrderId(null); }} onSuccess={onDeliverSuccess} />}
      {returnOrder && <ReturnModal order={returnOrder} open={returnOpen} onClose={() => { setReturnOpen(false); setReturnOrder(null); }} onSuccess={onReturnSuccess} />}
    </>
  );
}
