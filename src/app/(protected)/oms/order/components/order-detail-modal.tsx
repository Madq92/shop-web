'use client';

import { useEffect, useState } from 'react';
import { Descriptions, Form, Modal, Skeleton, Table, Tag } from 'antd';
import OrderController, { OrderDTO, OrderStatusLabels, OrderTypeLabels } from '@/api/oms/OrderController';
import { YesOrNoEnumLabels } from '@/api/types';

interface OrderDetailModalProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, open, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      setLoading(true);
      OrderController.detail(orderId).then((res) => {
        setOrder(res);
      }).finally(() => setLoading(false));
    }
  }, [open, orderId]);

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
                rowKey="productId"
                size="small"
                pagination={false}
                columns={[
                  { title: '商品名称', dataIndex: 'productName' },
                  { title: '单价', dataIndex: 'price', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
                  { title: '数量', dataIndex: 'quantity' },
                  { title: '小计', dataIndex: 'subtotal', render: (v: number) => `¥${(v / 100).toFixed(2)}` },
                ]}
              />
            </>
          )}
        </Form>
      )}
    </Modal>
  );
}
