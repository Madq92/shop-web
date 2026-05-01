'use client';

import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Form, Input, Row, Select, Skeleton, Space, Table, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';
import Box from '@/components/box';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderController, { OrderDTO, OrderDetailModel, PayTypeLabels } from '@/api/oms/OrderController';
import SpuController, { SkuDTO, SpuDTO } from '@/api/prod/SpuController';
import DebounceSelect from '@/components/debounce-select';
import { enumToOptions } from '@/api/types';

const { TextArea } = Input;

const payTypeOptions = enumToOptions(PayTypeLabels);

interface CartItem {
  key: string;
  detailId?: string;
  spuId?: string;
  skuId?: string;
  productName: string;
  specDesc: string;
  price: number;
  quantity: number;
}

export default function OrderEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [form] = Form.useForm<OrderDTO>();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 订单原始数据
  const [order, setOrder] = useState<OrderDTO | null>(null);

  // SKU 明细 (cart)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 搜索 SPU (用于添加新品)
  const [selectedSpuDetail, setSelectedSpuDetail] = useState<SpuDTO | null>(null);
  const [selectedSku, setSelectedSku] = useState<SkuDTO | null>(null);

  useEffect(() => {
    if (!orderId) {
      message.error('缺少订单ID');
      router.push('/oms/order');
      return;
    }
    setLoading(true);
    OrderController.detail(orderId)
      .then((res) => {
        setOrder(res);
        form.setFieldsValue({
          payType: res.payType,
          merchantRemark: res.merchantRemark,
        });
        // 初始化购物车
        const items: CartItem[] = (res.orderDetails || []).map((d) => ({
          key: d.detailId || d.skuId || '',
          detailId: d.detailId,
          skuId: d.skuId,
          productName: d.name || '',
          specDesc: '',
          price: d.price ?? 0,
          quantity: d.qty ?? 1,
        }));
        setCartItems(items);
      })
      .catch(() => message.error('获取订单详情失败'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchSpuList = async (name: string) => {
    const result = await SpuController.page({ pageNum: 1, pageSize: 20, name: name || undefined });
    return (result.records || []).map((s) => ({
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
    const specDesc = (selectedSku.specs ?? []).map((s) => `${s.name}: ${s.type}`).join(' / ');
    setCartItems((prev) => [
      ...prev,
      {
        key: `new-${selectedSpuDetail.spuId}-${selectedSku.skuId}-${Date.now()}`,
        spuId: selectedSpuDetail.spuId,
        skuId: selectedSku.skuId,
        productName: selectedSpuDetail.name,
        specDesc,
        price: selectedSku.sellPrice ?? 0,
        quantity: 1,
      },
    ]);
    setSelectedSpuDetail(null);
    setSelectedSku(null);
  };

  const billAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const orderDTO: OrderDTO = {
        ...order,
        ...values,
        orderDetails: cartItems.map((item) => ({
          detailId: item.detailId,
          skuId: item.skuId,
          name: item.productName,
          price: item.price,
          qty: item.quantity,
          amount: item.price * item.quantity,
        })) as OrderDetailModel[],
        billAmount,
      };
      await OrderController.edit(orderId!, orderDTO);
      message.success('保存成功');
      router.push('/oms/order');
    } finally {
      setSubmitting(false);
    }
  };

  const cartColumns = [
    { title: '商品名称', dataIndex: 'productName', key: 'productName' },
    {
      title: '规格',
      dataIndex: 'specDesc',
      key: 'specDesc',
      render: (v: string) => v || '-',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => `¥${(v / 100).toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_: number, record: CartItem) => (
        <Input
          type="number"
          min={1}
          style={{ width: 80 }}
          value={record.quantity}
          onChange={(e) => {
            const qty = parseInt(e.target.value) || 1;
            setCartItems((prev) => prev.map((item) => (item.key === record.key ? { ...item, quantity: qty } : item)));
          }}
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: unknown, record: CartItem) => `¥${((record.price * record.quantity) / 100).toFixed(2)}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: CartItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setCartItems((prev) => prev.filter((item) => item.key !== record.key))}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton active />
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Box>
      <div className="flex items-center justify-center w-full m-4 font-medium">编辑订单</div>
      <Form form={form} labelCol={{ span: 4 }}>
        {/* 客户信息（只读） */}
        <div className="text-sm font-medium mb-6">客户信息</div>
        <Row gutter={24} className="mb-4">
          <Col offset={4} span={16}>
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label="顾客名称">{order.customerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="机构名称">{order.partnerOrgName || '-'}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* 收货地址（只读） */}
        {order.orderAddress && (
          <>
            <div className="text-sm font-medium mb-6">收货地址</div>
            <Row gutter={24} className="mb-4">
              <Col offset={4} span={16}>
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="收货人">{order.orderAddress.receiverName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{order.orderAddress.receiverPhone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="详细地址">
                    {[order.orderAddress.province, order.orderAddress.city, order.orderAddress.district, order.orderAddress.detailAddress].filter(Boolean).join(' ')}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </>
        )}

        {/* 可编辑字段 */}
        <div className="text-sm font-medium mb-6">订单信息</div>

        <Form.Item label="支付方式" name="payType">
          <Select placeholder="请选择支付方式" allowClear options={payTypeOptions} />
        </Form.Item>

        <Form.Item label="商家备注" name="merchantRemark">
          <TextArea rows={2} placeholder="商家备注（可选）" />
        </Form.Item>

        {/* 商品明细 */}
        <div className="text-sm font-medium mb-6">商品明细</div>

        <Form.Item label="添加商品">
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
              onClear={() => {
                setSelectedSpuDetail(null);
                setSelectedSku(null);
              }}
              allowClear
            />
            {selectedSpuDetail && (
              <div className="flex items-center gap-4">
                <Select
                  placeholder="请选择规格（SKU）"
                  style={{ width: 400 }}
                  value={selectedSku?.skuId || undefined}
                  onChange={(skuId) => {
                    const sku = selectedSpuDetail.skus?.find((s) => s.skuId === skuId) || null;
                    setSelectedSku(sku);
                  }}
                  options={(selectedSpuDetail.skus ?? []).map((sku) => {
                    const specDesc = (sku.specs ?? []).map((s) => `${s.name}: ${s.type}`).join(' / ');
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
          <Button icon={<CloseOutlined />} onClick={() => router.back()}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={submitting} onClick={handleSubmit}>
            保存修改
          </Button>
        </Space>
      </Form>
    </Box>
  );
}
