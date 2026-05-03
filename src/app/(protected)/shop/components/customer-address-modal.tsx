'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Table, TableProps, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CustomerController, { CustomerAddressDTO } from '@/api/shop/CustomerController';

interface CustomerAddressModalProps {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function CustomerAddressModal({ customerId, open, onClose }: CustomerAddressModalProps) {
  const [addressList, setAddressList] = useState<CustomerAddressDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddressDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [addressForm] = Form.useForm<CustomerAddressDTO>();

  const loadAddresses = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const list = await CustomerController.address(customerId);
      setAddressList(list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && customerId) {
      loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  const handleAdd = () => {
    setEditingAddress(null);
    addressForm.resetFields();
    setFormOpen(true);
  };

  const handleEdit = (addr: CustomerAddressDTO) => {
    setEditingAddress(addr);
    addressForm.setFieldsValue(addr);
    setFormOpen(true);
  };

  const handleDelete = (addr: CustomerAddressDTO) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该地址吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await CustomerController.deleteAddress(customerId!, addr.customerAddressId);
        message.success('删除成功');
        loadAddresses();
      },
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const values = await addressForm.validateFields();
      const dto: CustomerAddressDTO = {
        ...values,
        customerAddressId: editingAddress?.customerAddressId || '',
        customerOrgId: editingAddress?.customerOrgId || '',
        customerId: editingAddress?.customerId || '',
        provinceCode: values.provinceCode || '',
        cityCode: values.cityCode || '',
        areaCode: values.areaCode || '',
      };

      if (editingAddress?.customerAddressId) {
        await CustomerController.updateAddress(customerId!, editingAddress.customerAddressId, dto);
        message.success('修改成功');
      } else {
        await CustomerController.createAddress(customerId!, dto);
        message.success('添加成功');
      }
      setFormOpen(false);
      loadAddresses();
    } finally {
      setSaving(false);
    }
  };

  const columns: TableProps<CustomerAddressDTO>['columns'] = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '所在地区',
      key: 'region',
      render: (_, addr) =>
        [addr.provinceName, addr.cityName, addr.areaName].filter(Boolean).join(' ') || '-',
    },
    {
      title: '详细地址',
      dataIndex: 'address',
      key: 'address',
      render: (v: string) => v || '-',
    },
    {
      title: '默认',
      dataIndex: 'defaultFlag',
      key: 'defaultFlag',
      render: (v: string) => <Tag color={v === 'Y' ? 'green' : 'default'}>{v === 'Y' ? '是' : '否'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, addr) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(addr)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(addr)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="地址管理"
        open={open}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加地址
          </Button>
        </div>
        <Table
          dataSource={addressList}
          columns={columns}
          rowKey="customerAddressId"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Modal>

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={addressForm} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ required: true, message: '请输入电话' }]}>
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="provinceName" label="省">
            <Input placeholder="请输入省份" />
          </Form.Item>
          <Form.Item name="cityName" label="市">
            <Input placeholder="请输入城市" />
          </Form.Item>
          <Form.Item name="areaName" label="区">
            <Input placeholder="请输入区/县" />
          </Form.Item>
          <Form.Item name="address" label="详细地址">
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="defaultFlag" label="默认标识">
            <Select
              allowClear
              placeholder="请选择"
              options={[
                { label: '是', value: 'Y' },
                { label: '否', value: 'N' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
