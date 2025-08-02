'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Form, Image, Input, MenuProps, Row, Space, Table, TableProps, Tag } from 'antd';
import Box from '@/components/box';
import { DownOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import SpuController, { SpuDTO, SpuQueryReq } from '@/api/prod/SpuController';
import { useRouter } from 'next/navigation';
import Dropdown from 'antd/es/dropdown/dropdown';
import { Barcode, Weight } from 'lucide-react';

export default function SpuPage() {
  const [spuList, setSpuList] = useState<SpuDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [queryForm] = Form.useForm<SpuQueryReq>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();
  const columns: TableProps<SpuDTO>['columns'] = [
    {
      title: '图片',
      dataIndex: 'imgUrlList',
      key: 'imgUrlList',
      render: (_, spuDTO) => <>{spuDTO.imgUrlList && spuDTO.imgUrlList.length > 0 && <Image width={80} src={spuDTO.imgUrlList[0]} alt="图片" />}</>,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '单位',
      dataIndex: 'unitName',
      key: 'unitName',
      render: (_, spuDTO) => <>{spuDTO.weightFlag === 'Y' ? spuDTO.weightUnitName + '（称重）' : spuDTO.unitName}</>,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (_, spuDTO) => (
        <>
          {spuDTO.parentCategoryName} - {spuDTO.categoryName}
        </>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => <Tag color={status === 'ENABLE' ? 'green' : 'gray'}>{status === 'ENABLE' ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作',
      render: (_, spuDTO) => (
        <>
          <Button type="link" size="small" onClick={() => handleEdit(spuDTO)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={async () => {
              await SpuController.delete(spuDTO.spuId);
              doQuery(pageNum);
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  const doQuery = async (currentPage = 1) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const result = await SpuController.page({
      ...queryParam,
      pageNum: currentPage,
      pageSize,
    });
    setSpuList(result.records || []);
    setTotal(result.total);
    setLoading(false);
  };

  const handleEdit = async (spuDTO: SpuDTO) => {
    router.push(`/prod/spu/edit?spuId=${spuDTO.spuId}`);
  };

  useEffect(() => {
    doQuery(pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageOnChange = (page: number, pageSize: number) => {
    setPageNum(page);
    setPageSize(pageSize);
    doQuery(page);
  };
  const handleMenuClick: MenuProps['onClick'] = e => {
    const url = '/prod/spu/edit?weightFlag=' + (e.key === 'weightProduct' ? 'Y' : 'N');
    router.push(url);
  };
  const items: MenuProps['items'] = [
    {
      label: '普通商品',
      key: 'normalProduct',
      icon: <Barcode />,
    },
    {
      label: '称重商品',
      key: 'weightProduct',
      icon: <Weight />,
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <>
      <Box className="mb-4">
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="商品名称">
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space className="text-left">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} onClick={() => doQuery(pageNum)}>
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
          {/*<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>*/}
          {/*  创建*/}
          {/*</Button>*/}

          <Dropdown menu={menuProps}>
            <Button type="primary">
              <Space>
                创建商品
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Button type="primary" icon={<SyncOutlined />} onClick={() => doQuery(pageNum)}>
            刷新
          </Button>
        </Space>
        <Table
          dataSource={spuList}
          columns={columns}
          rowKey={record => record.spuId}
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
