import { BaseController } from "@/api/BaseController";

export default class DictController extends BaseController {
  // 字典组操作
  static list(req: DictQueryReq) {
    return super.GET<DictGroupDTO[]>("/dict", req);
  }

  static detail(dictGroupId: string) {
    return super.GET<DictGroupDTO>(`/dict/${dictGroupId}`);
  }

  static create(dictGroup: DictGroupDTO) {
    return super.POST<string>(`/dict`, dictGroup);
  }

  static edit(dictGroupId: string, dictGroup: DictGroupDTO) {
    return super.PUT<boolean>(`/dict/${dictGroupId}`, dictGroup);
  }

  static delete(dictGroupId: string) {
    return super.DELETE<boolean>(`/dict/${dictGroupId}`);
  }

  // 字典详情操作
  static createDetail(dictGroupId: string, dict: DictDTO) {
    return super.POST<string>(`/dict/${dictGroupId}`, dict);
  }

  static editDetail(dictGroupId: string, dictId: string, dict: DictDTO) {
    return super.PUT<boolean>(
      `/dict/${dictGroupId}/dictDetail/${dictId}`,
      dict,
    );
  }

  static deleteDetail(dictGroupId: string, dictId: string) {
    return super.DELETE<boolean>(`/dict/${dictGroupId}/dictDetail/${dictId}`);
  }
}

export enum DictType {
  UNIT = "单位",
  SPEC = "规格",
  LABEL = "标签",
}

// 数据传输对象

/**
 * 字典组数据传输对象
 */
export type DictGroupDTO = {
  /**
   * 字典组ID
   */
  dictGroupId: string;

  /**
   * 字典组名称
   */
  name: string;

  /**
   * 字典类型
   */
  type: string;

  /**
   * 子字典列表
   */
  dictDetails: DictDTO[];
};

/**
 * 字典数据传输对象
 */
export type DictDTO = {
  /**
   * 字典ID
   */
  dictId: string;

  /**
   * 字典组ID
   */
  dictGroupId: string;

  /**
   * 字典名称
   */
  name: string;

  /**
   * 字典类型
   */
  type: string;
};

/**
 * 查询请求参数
 */
export type DictQueryReq = {
  /**
   * 模糊匹配名称
   */
  name?: string;

  /**
   * 类型过滤
   */
  type?: string;
};
