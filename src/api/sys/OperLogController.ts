import { BaseController } from "@/api/BaseController";
import { PageReq } from "@/api/sys/UserController";
import { PageDataType } from "@/common/http/types";

export default class OperLogController extends BaseController {
  static page(req?: OperLogPageReq) {
    return super.GET<PageDataType<OperLogDTO>>("/oper-log", req);
  }

  static detail(logId: string) {
    return super.GET<OperLogDTO>(`/oper-log/${logId}`);
  }
}

export type OperLogPageReq = PageReq & {
  success: boolean;
};

export type OperLogDTO = {
  /**
   * 日志主键
   */
  id: number;

  /**
   * 模块标题
   */
  title: string;

  /**
   * 操作用户名称
   */
  operUseName: string;

  /**
   * 主机地址
   */
  operIp: string;

  /**
   * 成功标识（1成功 0失败）
   */
  success: boolean;

  /**
   * 操作时间
   */
  operTime: string;

  /**
   * 消耗时间
   */
  costTime: number;
};
