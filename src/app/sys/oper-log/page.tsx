"use client";

import Box from "@/components/box";
import { Button, Col, Form, Row, Select, Space, Table, TableProps } from "antd";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import OperLogController, {
  OperLogDTO,
  OperLogPageReq,
} from "@/api/sys/OperLogController";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const operLogSuccessOption = [
  {
    value: "1",
    label: "成功",
  },
  {
    value: "0",
    label: "失败",
  },
];

export default function OperLogPage() {
  const [queryForm] = Form.useForm<OperLogPageReq>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [operLogs, setOperLogs] = useState<OperLogDTO[]>([]);

  useEffect(() => {
    doQuery(1);
  }, []);
  const reloadData = () => {
    setPageNum(1);
    doQuery(1);
  };

  const doQuery = async (currentPage = 1) => {
    setLoading(true);
    const queryParam = queryForm.getFieldsValue();
    const pageResult = await OperLogController.page({
      ...queryParam,
      pageNum: currentPage,
      pageSize,
    });
    setOperLogs(pageResult.records || []);
    setTotal(pageResult.total);
    setLoading(false);
  };

  const handlePageOnChange = (page: number, pageSize: number) => {
    setPageNum(page);
    setPageSize(pageSize);
    doQuery(page);
  };

  const columns: TableProps<OperLogDTO>["columns"] = [
    {
      title: "模块",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "用户名称",
      dataIndex: "operUseName",
      key: "operUseName",
    },
    {
      title: "主机地址",
      dataIndex: "operIp",
      key: "operIp",
    },
    {
      title: "成功标识",
      dataIndex: "success",
      key: "success",
      render: (_, dto) => {
        return dto.success ? "成功" : "失败";
      },
    },
    {
      title: "消耗时间(ms)",
      dataIndex: "costTime",
      key: "costTime",
    },
    {
      title: "操作时间",
      dataIndex: "operTime",
      key: "operTime",
      render: (_, dto) => {
        const loginDate = dayjs(dto.operTime);
        if (!loginDate.isValid()) {
          return "";
        }
        return loginDate.format("YYYY-MM-DD HH:mm:ss");
      },
    },
  ];

  return (
    <>
      <Box>
        <Form form={queryForm} name="advanced_search">
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="success" label="状态">
                <Select options={operLogSuccessOption}></Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="text-left">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                onClick={reloadData}
              >
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
          </div>
        </Form>
      </Box>

      <div className="mt-4">
        <Box>
          <Table
            dataSource={operLogs}
            columns={columns}
            rowKey={(record) => record.id}
            loading={loading}
            pagination={{
              total,
              pageSize,
              current: pageNum,
              onChange: handlePageOnChange,
            }}
          />
        </Box>
      </div>
    </>
  );
}
