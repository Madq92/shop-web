import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { PageReq } from '@/api/generic';

export default class PartnerOrgController extends BaseController {
  /**
   * 公司列表
   */
  static page(req: PartnerOrgQueryReq) {
    return super.GET<PageDataType<PartnerOrgDTO>>('/partner-org', req);
  }

  /**
   * 公司详情
   */
  static detail(partnerOrgId: string) {
    return super.GET<PartnerOrgDTO>(`/partner-org/${partnerOrgId}`);
  }

  /**
   * 公司创建
   */
  static create(partnerOrg: PartnerOrgDTO) {
    return super.POST<string>('/partner-org', partnerOrg);
  }

  /**
   * 公司编辑
   */
  static edit(partnerOrgId: string, partnerOrg: PartnerOrgDTO) {
    return super.PUT<boolean>(`/partner-org/${partnerOrgId}`, partnerOrg);
  }

  /**
   * 公司删除
   */
  static delete(partnerOrgId: string) {
    return super.DELETE<boolean>(`/partner-org/${partnerOrgId}`);
  }
}

// ========== 类型定义 ==========

// 合作机构类型枚举
export type PartnerOrgTypeEnum = 'SUPPLIER' | 'CUSTOMER' | 'LOGISTICS' | 'BANK' | 'OTHER';

// 合作机构类型枚举描述映射
export const PartnerOrgTypeEnumLabels: Record<PartnerOrgTypeEnum, string> = {
  CUSTOMER: '顾客',
  SUPPLIER: '供应商',
  LOGISTICS: '物流',
  BANK: '银行',
  OTHER: '其他',
};

export type PartnerOrgQueryReq = PageReq & {
  partnerOrgId?: string;
  name?: string;
};

export type PartnerOrgStatusEnum = 'ENABLE' | 'DISABLE';

export const PartnerOrgStatusEnumLabels: Record<PartnerOrgStatusEnum, string> = {
  ENABLE: '启用',
  DISABLE: '禁用',
};

/**
 * 合作机构数据传输对象
 */
export type PartnerOrgDTO = {
  /**
   * 合作机构ID
   */
  partnerOrgId: string;

  /**
   * 合作机构名称
   */
  name: string;

  /**
   * 合作机构简称
   */
  shortName: string;

  /**
   * 类型：SUPPLIER,CUSTOMER,LOGISTICS,BANK,OTHER
   */
  type: PartnerOrgTypeEnum;

  /**
   * 税号/统一社会信用代码
   */
  taxId: string;

  /**
   * 注册地址/主要办公地址
   */
  address: string;

  /**
   * 开户行
   */
  bankName: string;

  /**
   * 开户账号
   */
  bankAccount: string;

  /**
   * 银行卡号
   */
  bankCardNumber: string;

  /**
   * 电话
   */
  phone: string;

  /**
   * 网址
   */
  website: string;

  /**
   * 顾客备注
   */
  remark: string;

  /**
   * 状态
   */
  status: PartnerOrgStatusEnum;
};
