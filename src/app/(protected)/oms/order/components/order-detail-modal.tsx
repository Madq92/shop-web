'use client';

import { useEffect, useState } from 'react';
import { Button, Descriptions, Form, InputNumber, Modal, Skeleton, Space, Table, TableProps, Tag, message } from 'antd';
import OrderController, { OrderDTO, OrderDetailModel, OrderStatusLabels, OrderTypeLabels } from '@/api/oms/OrderController';
import { YesOrNoEnumLabels } from '@/api/types';

interface OrderDetailModalProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  editable?: boolean;
}

export default function OrderDetailModal({ orderId, open, onClose, editable = false }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ qty: number; price: number }>({ qty: 0, price: 0 });
  const [saving, setSaving] = useState(false);

  const loadDetail = () => {
    if (!orderId) return;
    setLoading(true);
    OrderController.detail(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open && orderId) {
      loadDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const startEdit = (record: OrderDetailModel) => {
    const key = record.detailId || record.skuId || '';
    setEditingKey(key);
    setEditValues({
      qty: record.qty ?? 0,
      price: record.price ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingKey(null);
  };

  const saveEdit = async (record: OrderDetailModel) => {
    const detailId = record.detailId;
    if (!detailId || !orderId) return;
    setSaving(true);
    try {
      await OrderController.editDetail(orderId, detailId, {
        ...record,
        qty: editValues.qty,
        price: editValues.price,
      });
      message.success('保存成功');
      setEditingKey(null);
      loadDetail();
    } finally {
      setSaving(false);
    }
  };

  const isEditing = (record: OrderDetailModel) => {
    const key = record.detailId || record.skuId || '';
    return key === editingKey;
  };

  const getRowKey = (record: OrderDetailModel) => record.detailId || record.skuId || '';

  const detailColumns: TableProps<OrderDetailModel>['columns'] = [
    { title: '商品名称', dataIndex: 'name' },
    {
      title: '单价',
      dataIndex: 'price',
      render: (_: unknown, record: OrderDetailModel) => {
        if (isEditing(record)) {
          return (
            <InputNumber
              value={editValues.price}
              onChange={(v) => setEditValues((prev) => ({ ...prev, price: v ?? 0 }))}
              min={0}
              style={{ width: 100 }}
            />
          );
        }
        return `¥${((record.price ?? 0) / 100).toFixed(2)}`;
      },
    },
    {
      title: '数量',
      dataIndex: 'qty',
      render: (_: unknown, record: OrderDetailModel) => {
        if (isEditing(record)) {
          return (
            <InputNumber
              value={editValues.qty}
              onChange={(v) => setEditValues((prev) => ({ ...prev, qty: v ?? 0 }))}
              min={1}
              style={{ width: 80 }}
            />
          );
        }
        return record.qty;
      },
    },
    {
      title: '小计',
      dataIndex: 'amount',
      render: (_: unknown, record: OrderDetailModel) => {
        if (isEditing(record)) {
          return `¥${((editValues.price * editValues.qty) / 100).toFixed(2)}`;
        }
        return `¥${((record.amount ?? 0) / 100).toFixed(2)}`;
      },
    },
  ];

  if (editable) {
    detailColumns.push({
      title: '操作',
      render: (_: unknown, record: OrderDetailModel) => {
        if (isEditing(record)) {
          return (
            <Space>
              <Button type="link" size="small" loading={saving} onClick={() => saveEdit(record)}>
                保存
              </Button>
              <Button type="link" size="small" onClick={cancelEdit}>
                取消
              </Button>
            </Space>
          );
        }
        return (
          <Button type="link" size="small" disabled={editingKey !== null} onClick={() => startEdit(record)}>
            编辑
          </Button>
        );
      },
    });
  }

  return (
    <Modal
      title="订单详情"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {loading || !order ? (
        <Skeleton active />
      ) : (
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          {/* 基础信息 */}
          <div className="text-sm font-medium mb-3">基础信息</div>
          <Descriptions column={2} size="small" bordered className="mb-4">
            <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
            <Descriptions.Item label="订单来源">{order.orderSource}</Descriptions.Item>
            <Descriptions.Item label="订单类型">
              {order.orderType && <Tag color={OrderTypeLabels[order.orderType].color}>{OrderTypeLabels[order.orderType].label}</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              {order.orderStatus != null && <Tag color={OrderStatusLabels[order.orderStatus].color}>{OrderStatusLabels[order.orderStatus].label}</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="顾客名称">{order.customerName}</Descriptions.Item>
            <Descriptions.Item label="机构名称">{order.partnerOrgName}</Descriptions.Item>
            <Descriptions.Item label="商家备注">{order.merchantRemark || '-'}</Descriptions.Item>
            <Descriptions.Item label="客户备注">{order.customerRemark || '-'}</Descriptions.Item>
          </Descriptions>

          {/* 金额信息 */}
          <div className="text-sm font-medium mb-3">金额信息</div>
          <Descriptions column={2} size="small" bordered className="mb-4">
            <Descriptions.Item label="商品总计">¥{((order.billAmount ?? 0) / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="折扣金额">-¥{((order.discountAmount ?? 0) / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="运费">¥{((order.expressAmount ?? 0) / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{((order.totalAmount ?? 0) / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="已付款">{order.paid ? YesOrNoEnumLabels[order.paid] : '-'}</Descriptions.Item>
            <Descriptions.Item label="支付方式">{order.payType || '-'}</Descriptions.Item>
            <Descriptions.Item label="实付金额">¥{((order.payAmount ?? 0) / 100).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="配送完成">{order.delivered === 'Y' ? '是' : '否'}</Descriptions.Item>
          </Descriptions>

          {/* 收货地址 */}
          {order.orderAddress && (
            <>
              <div className="text-sm font-medium mb-3">收货地址</div>
              <Descriptions column={1} size="small" bordered className="mb-4">
                <Descriptions.Item label="收货人">{order.orderAddress.receiverName}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{order.orderAddress.receiverPhone}</Descriptions.Item>
                <Descriptions.Item label="详细地址">
                  {[order.orderAddress.province, order.orderAddress.city, order.orderAddress.district, order.orderAddress.detailAddress].filter(Boolean).join(' ')}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}

          {/* 商品明细 */}
          {order.orderDetails && order.orderDetails.length > 0 && (
            <>
              <div className="text-sm font-medium mb-3">商品明细</div>
              <Table
                dataSource={order.orderDetails}
                rowKey={getRowKey}
                size="small"
                pagination={false}
                columns={detailColumns}
              />
            </>
          )}
        </Form>
      )}
    </Modal>
  );
}
