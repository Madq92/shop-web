'use client';

import { Form, Input, Modal, Space, Button } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import OrderController from '@/api/oms/OrderController';

interface DeliverModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeliverModal({ orderId, open, onClose, onSuccess }: DeliverModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      await OrderController.deliver(orderId, values.expressCompany, values.expressNo);
      form.resetFields();
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="发货"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="expressCompany" label="物流公司" rules={[{ required: true, message: '请输入物流公司' }]}>
          <Input placeholder="请输入物流公司" />
        </Form.Item>
        <Form.Item name="expressNo" label="物流单号" rules={[{ required: true, message: '请输入物流单号' }]}>
          <Input placeholder="请输入物流单号" />
        </Form.Item>
        <div className="text-right">
          <Space>
            <Button icon={<CloseOutlined />} onClick={() => { form.resetFields(); onClose(); }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={loading} onClick={handleSubmit}>
              确认发货
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
