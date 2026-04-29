'use client';

import { useState } from 'react';
import { Button, Descriptions, Modal, Space, Tag } from 'antd';
import OrderController, { OrderDTO, OrderStatusLabels } from '@/api/oms/OrderController';

interface ReturnModalProps {
  order: OrderDTO;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({ order, open, onClose, onSuccess }: ReturnModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!order.returnId) return;
    setLoading('approve');
    try {
      await OrderController.approveReturn(order.returnId);
      onSuccess();
      onClose();
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!order.returnId) return;
    setLoading('reject');
    try {
      await OrderController.rejectReturn(order.returnId);
      onSuccess();
      onClose();
    } finally {
      setLoading(null);
    }
  };

  const handleReceive = async () => {
    if (!order.returnId) return;
    setLoading('receive');
    try {
      await OrderController.receiveReturn(order.returnId);
      onSuccess();
      onClose();
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal title="售后管理" open={open} onCancel={onClose} footer={null}>
      <Descriptions column={1} size="small" bordered className="mb-4">
        <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
        <Descriptions.Item label="订单状态">
          {order.orderStatus != null && <Tag color={OrderStatusLabels[order.orderStatus].color}>{OrderStatusLabels[order.orderStatus].label}</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="退货单ID">{order.returnId || '-'}</Descriptions.Item>
        <Descriptions.Item label="退货状态">{order.returnStatus != null ? `状态代码: ${order.returnStatus}` : '-'}</Descriptions.Item>
      </Descriptions>
      <Space>
        <Button type="primary" loading={loading === 'approve'} onClick={handleApprove}>
          同意退货
        </Button>
        <Button danger loading={loading === 'reject'} onClick={handleReject}>
          拒绝退款
        </Button>
        <Button loading={loading === 'receive'} onClick={handleReceive}>
          确认收到退货
        </Button>
      </Space>
    </Modal>
  );
}
