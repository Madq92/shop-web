'use client';

import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Form, Input, Row, Select, Space, Table, message } from 'antd';
import React, { useState } from 'react';
import Box from '@/components/box';
import { useRouter } from 'next/navigation';
import OrderController, { OrderDTO, PayTypeLabels } from '@/api/oms/OrderController';
import ContactController, { ContactDTO } from '@/api/crm/ContactController';
import SpuController, { SpuDTO } from '@/api/prod/SpuController';
import DebounceSelect from '@/components/debounce-select';
import { enumToOptions } from '@/api/types';

const { TextArea } = Input;

const payTypeOptions = enumToOptions(PayTypeLabels);

/** 购物车中的临时SKU项 */
interface CartItem {
  key: string;
  spuId: string;
  skuId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function OrderCreatePage() {
  const router = useRouter();
  const [form] = Form.useForm<OrderDTO>();
  const [submitting, setSubmitting] = useState(false);

  // 选中的客户
  const [selectedContact, setSelectedContact] = useState<ContactDTO | null>(null);

  // SKU 明细
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 搜索 SPU/SKU
  const [spuSearchText, setSpuSearchText] = useState('');

  const fetchContactList = async (name: string) => {
    const result = await ContactController.page({ pageNum: 1, pageSize: 50, name: name || undefined });
    return (result.records || []).map(c => ({
      label: `${c.name} (${c.phone || ''})`,
      value: c.contactId,
      contact: c,
    }));
  };

  const fetchSpuList = async (name: string) => {
    const result = await SpuController.page({ pageNum: 1, pageSize: 20, name: name || undefined });
    return (result.records || []).map(s => ({
      label: `${s.name} - ¥${((s.skus?.[0]?.sellPrice ?? 0) / 100).toFixed(2)}`,
      value: s.spuId,
      spu: s,
    }));
  };

  const handleAddSku = (spu: SpuDTO) => {
    const sku = spu.skus?.[0];
    if (!sku) return;
    setCartItems(prev => [
      ...prev,
      {
        key: `${spu.spuId}-${Date.now()}`,
        spuId: spu.spuId,
        skuId: sku.skuId || '',
        productName: spu.name,
        price: (sku.sellPrice ?? 0),
        quantity: 1,
      },
    ]);
    setSpuSearchText('');
  };

  const billAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const orderDTO: OrderDTO = {
        ...values,
        customerId: selectedContact?.contactId,
        customerName: selectedContact?.name,
        orderDetails: cartItems.map(item => ({
          productId: item.skuId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        billAmount,
        totalAmount: billAmount,
      };
      await OrderController.create(orderDTO);
      message.success('创建订单成功');
      router.push('/oms/order');
    } finally {
      setSubmitting(false);
    }
  };

  const cartColumns = [
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    {
      title: '单价', dataIndex: 'price', key: 'price',
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '数量', dataIndex: 'quantity', key: 'quantity',
      render: (_: number, record: CartItem) => (
        <Input
          type="number"
          min={1}
          style={{ width: 80 }}
          value={record.quantity}
          onChange={e => {
            const qty = parseInt(e.target.value) || 1;
            setCartItems(prev => prev.map(item => item.key === record.key ? { ...item, quantity: qty } : item));
          }}
        />
      ),
    },
    {
      title: '小计', key: 'subtotal',
      render: (_: unknown, record: CartItem) => `¥${((record.price * record.quantity) / 100).toFixed(2)}`,
    },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: CartItem) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setCartItems(prev => prev.filter(item => item.key !== record.key))} />
      ),
    },
  ];

  return (
    <Box>
      <div className="flex items-center justify-center w-full m-4 font-medium">创建订单</div>
      <Form form={form} labelCol={{ span: 4 }}>
        {/* 基础信息 */}
        <div className="text-sm font-medium mb-6">基础信息</div>

        <Form.Item label="客户" rules={[{ required: true, message: '请选择客户' }]}>
          <DebounceSelect
            fetchOptions={fetchContactList}
            debounceTimeout={500}
            initLoad
            placeholder="搜索并选择客户"
            onChange={(value, option) => {
              const opt = Array.isArray(option) ? option[0] : option;
              setSelectedContact((opt as unknown as { contact: ContactDTO })?.contact || null);
            }}
          />
        </Form.Item>

        {selectedContact && (
          <Row gutter={24} className="mb-4">
            <Col offset={4} span={16}>
              <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="姓名">{selectedContact.name}</Descriptions.Item>
                <Descriptions.Item label="电话">{selectedContact.phone}</Descriptions.Item>
                <Descriptions.Item label="机构">{selectedContact.partnerOrgName}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}

        <Form.Item label="支付方式" name="payType">
          <Select placeholder="请选择支付方式" allowClear options={payTypeOptions} />
        </Form.Item>

        <Form.Item label="商家备注" name="merchantRemark">
          <TextArea rows={2} placeholder="商家备注（可选）" />
        </Form.Item>

        {/* 商品明细 */}
        <div className="text-sm font-medium mb-6">商品明细</div>

        <Form.Item label="添加商品">
          <Space>
            <DebounceSelect
              fetchOptions={fetchSpuList}
              debounceTimeout={500}
              placeholder="搜索并选择商品"
              style={{ width: 400 }}
              value={spuSearchText ? undefined : undefined}
              onChange={(value, option) => {
                const opt = Array.isArray(option) ? option[0] : option;
                const spu = (opt as unknown as { spu: SpuDTO })?.spu;
                if (spu) handleAddSku(spu);
              }}
            />
          </Space>
        </Form.Item>

        {cartItems.length > 0 && (
          <Form.Item label="商品列表">
            <Table dataSource={cartItems} columns={cartColumns} rowKey="key" pagination={false} size="small" bordered />
          </Form.Item>
        )}

        {/* 金额汇总 */}
        <Form.Item label="商品合计">
          <span className="text-lg font-medium">¥{(billAmount / 100).toFixed(2)}</span>
        </Form.Item>

        {/* 提交按钮 */}
        <Space className="w-full justify-center py-4">
          <Button icon={<CloseOutlined />} onClick={() => router.back()}>取消</Button>
          <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={submitting} onClick={handleSubmit}>
            确认创建
          </Button>
        </Space>
      </Form>
    </Box>
  );
}
