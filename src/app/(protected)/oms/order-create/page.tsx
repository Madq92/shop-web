'use client';

import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Form, Input, Row, Select, Space, Table, Tag, message } from 'antd';
import React, { useState } from 'react';
import Box from '@/components/box';
import { useRouter } from 'next/navigation';
import OrderController, { DeliveryWayLabels, OrderDTO, OrderDetailModel, PayTypeLabels } from '@/api/oms/OrderController';
import CustomerController, { CustomerDTO, CustomerAddressDTO } from '@/api/shop/CustomerController';
import SpuController, { SkuDTO, SpuDTO } from '@/api/prod/SpuController';
import DebounceSelect from '@/components/debounce-select';
import { enumToOptions } from '@/api/types';

const { TextArea } = Input;

const payTypeOptions = enumToOptions(PayTypeLabels);
const deliveryWayOptions = enumToOptions(DeliveryWayLabels);

/** 购物车中的临时SKU项 */
interface CartItem {
  key: string;
  spuId: string;
  skuId: string;
  productName: string;
  specDesc: string;
  price: number;
  quantity: number;
}

export default function OrderCreatePage() {
  const router = useRouter();
  const [form] = Form.useForm<OrderDTO>();
  const [submitting, setSubmitting] = useState(false);

  // 选中的顾客
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
  const [addressList, setAddressList] = useState<CustomerAddressDTO[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // SKU 明细
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 搜索 SPU
  const [selectedSpuDetail, setSelectedSpuDetail] = useState<SpuDTO | null>(null);
  const [selectedSku, setSelectedSku] = useState<SkuDTO | null>(null);
  const watchedDeliveryWay = Form.useWatch('deliveryWay', form);

  const fetchCustomerList = async (name: string) => {
    const result = await CustomerController.page({ pageNum: 1, pageSize: 50, name: name || undefined });
    return (result.records || []).map(c => ({
      label: `${c.name} (${c.phone || ''})`,
      value: c.customerId,
      customer: c,
    }));
  };

  const fetchSpuList = async (name: string) => {
    const result = await SpuController.page({ pageNum: 1, pageSize: 20, name: name || undefined });
    return (result.records || []).map(s => ({
      label: s.name,
      value: s.spuId,
      spu: s,
    }));
  };

  const handleSpuSelected = async (spuId: string) => {
    setSelectedSku(null);
    setSelectedSpuDetail(null);
    try {
      const detail = await SpuController.detail(spuId);
      setSelectedSpuDetail(detail);
    } catch {
      message.error('获取商品详情失败');
    }
  };

  const handleAddSku = () => {
    if (!selectedSpuDetail || !selectedSku) return;
    const specDesc = (selectedSku.specs ?? []).map(s => `${s.name}: ${s.type}`).join(' / ')
    setCartItems(prev => {
      const existing = prev.find(item => item.skuId === selectedSku.skuId);
      if (existing) {
        return prev.map(item =>
          item.skuId === selectedSku.skuId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          key: `${selectedSpuDetail.spuId}-${selectedSku.skuId}-${Date.now()}`,
          spuId: selectedSpuDetail.spuId,
          skuId: selectedSku.skuId || '',
          productName: selectedSpuDetail.name,
          specDesc,
          price: (selectedSku.sellPrice ?? 0),
          quantity: 1,
        },
      ];
    });
    setSelectedSpuDetail(null);
    setSelectedSku(null);
  };

  const billAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const orderDTO: OrderDTO = {
        ...values,
        customerId: selectedCustomer?.customerId,
        customerName: selectedCustomer?.name,
        orderAddress: selectedAddressId ? { customerAddressId: selectedAddressId } : undefined,
        orderDetails: cartItems.map(item => ({
          skuId: item.skuId,
          name: item.productName,
          price: item.price,
          qty: item.quantity,
          amount: item.price * item.quantity,
        })) as OrderDetailModel[],
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
      title: '规格', dataIndex: 'specDesc', key: 'specDesc',
      render: (v: string) => v || '-',
    },
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
            fetchOptions={fetchCustomerList}
            debounceTimeout={500}
            initLoad
            placeholder="搜索并选择顾客"
            onChange={(value, option) => {
              const opt = Array.isArray(option) ? option[0] : option;
              const customer = (opt as unknown as { customer: CustomerDTO })?.customer || null;
              setSelectedCustomer(customer);
              if (customer?.customerId) {
                CustomerController.address(customer.customerId).then(addresses => {
                  setAddressList(addresses || []);
                  const defaultAddr = (addresses || []).find(a => a.defaultFlag === 'Y');
                  setSelectedAddressId(defaultAddr?.customerAddressId || addresses?.[0]?.customerAddressId || null);
                }).catch(() => setAddressList([]));
              } else {
                setAddressList([]);
                setSelectedAddressId(null);
              }
            }}
          />
        </Form.Item>

        {selectedCustomer && (
          <Row gutter={24} className="mb-4">
            <Col offset={4} span={16}>
              <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="姓名">{selectedCustomer.name}</Descriptions.Item>
                <Descriptions.Item label="电话">{selectedCustomer.phone}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{selectedCustomer.email || '-'}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}

        <Form.Item label="支付方式" name="payType">
          <Select placeholder="请选择支付方式" allowClear options={payTypeOptions} />
        </Form.Item>

        <Form.Item label="配送方式" name="deliveryWay">
          <Select placeholder="请选择配送方式" allowClear options={deliveryWayOptions} />
        </Form.Item>

        {watchedDeliveryWay === 'DELIVERY' && addressList.length > 0 && (
          <Form.Item label="收货地址" rules={[{ required: true, message: '请选择收货地址' }]}>
            <Select
              placeholder="请选择收货地址"
              style={{ width: 400 }}
              value={selectedAddressId}
              onChange={setSelectedAddressId}
              options={addressList.map(addr => ({
                label: `${addr.name} ${addr.phone} - ${addr.provinceName}${addr.cityName}${addr.areaName}${addr.address}`,
                value: addr.customerAddressId,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item label="商家备注" name="merchantRemark">
          <TextArea rows={2} placeholder="商家备注（可选）" />
        </Form.Item>

        {/* 商品明细 */}
        <div className="text-sm font-medium mb-6">商品明细</div>

        <Form.Item label="选择商品">
          <Space direction="vertical" style={{ width: '100%' }}>
            <DebounceSelect
              fetchOptions={fetchSpuList}
              debounceTimeout={500}
              initLoad
              placeholder="搜索并选择商品（SPU）"
              style={{ width: 400 }}
              onChange={(value) => {
                if (value) handleSpuSelected(value as unknown as string);
              }}
              onClear={() => { setSelectedSpuDetail(null); setSelectedSku(null); }}
              allowClear
            />
            {selectedSpuDetail && (
              <div className="flex items-center gap-4">
                <Select
                  placeholder="请选择规格（SKU）"
                  style={{ width: 400 }}
                  value={selectedSku?.skuId || undefined}
                  onChange={(skuId) => {
                    const sku = selectedSpuDetail.skus?.find(s => s.skuId === skuId) || null;
                    setSelectedSku(sku);
                  }}
                  options={(selectedSpuDetail.skus ?? []).map(sku => {
                    const specDesc = (sku.specs ?? []).map(s => `${s.name}: ${s.type}`).join(' / ');
                    return {
                      label: (
                        <span>
                          {specDesc || sku.code || '默认'}
                          <Tag style={{ marginLeft: 8 }}>¥{((sku.sellPrice ?? 0) / 100).toFixed(2)}</Tag>
                        </span>
                      ),
                      text: `${specDesc || sku.code || '默认'} - ¥${((sku.sellPrice ?? 0) / 100).toFixed(2)}`,
                      value: sku.skuId,
                    };
                  })}
                  optionRender={(option) => option.data.text}
                />
                <Button type="primary" disabled={!selectedSku} onClick={handleAddSku}>
                  添加
                </Button>
              </div>
            )}
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
