import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { PageReq } from '@/api/generic';
import { YesOrNoEnum } from '@/api/types';

export default class ContactController extends BaseController {
  /**
   * 获取联系人列表（分页）
   */
  static page(req?: ContactQueryReq) {
    return super.GET<PageDataType<ContactDTO>>('/contact', req);
  }

  /**
   * 获取联系人详情
   */
  static detail(contactId: string) {
    return super.GET<ContactDTO>(`/contact/${contactId}`);
  }

  /**
   * 创建联系人
   */
  static create(contact: ContactDTO) {
    return super.POST<string>(`/contact`, contact);
  }

  /**
   * 编辑联系人
   */
  static edit(contactId: string, contact: ContactDTO) {
    return super.PUT<boolean>(`/contact/${contactId}`, contact);
  }

  /**
   * 删除联系人
   */
  static delete(contactId: string) {
    return super.DELETE<boolean>(`/contact/${contactId}`);
  }

  /**
   * 获取联系人地址列表
   */
  static address(contactId: string) {
    return super.GET<PartnerAddressDTO[]>(`/contact/${contactId}/address`);
  }

  /**
   * 创建联系人地址
   */
  static createAddress(contactId: string, address: PartnerAddressDTO) {
    return super.POST<string>(`/contact/${contactId}/address`, address);
  }

  /**
   * 编辑联系人地址
   */
  static updateAddress(contactId: string, partnerAddressId: string, address: PartnerAddressDTO) {
    return super.PUT<boolean>(`/contact/${contactId}/address/${partnerAddressId}`, address);
  }

  /**
   * 删除联系人地址
   */
  static deleteAddress(contactId: string, partnerAddressId: string) {
    return super.DELETE<boolean>(`/contact/${contactId}/address/${partnerAddressId}`);
  }
}

// ========== 类型定义 ==========
export type ContactQueryReq = PageReq & {
  partnerOrgId?: string;
  name?: string;
  status?: ContactStatusEnum;
};
export type ContactStatusEnum = 'ENABLE' | 'DISABLE';

export const ContactStatusEnumLabels: Record<ContactStatusEnum, string> = {
  ENABLE: '启用',
  DISABLE: '禁用',
};
/**
 * 联系人数据传输对象
 */
export type ContactDTO = {
  contactId: string;
  partnerOrgId: string;
  partnerOrgName: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  wechat: string;
  defaultFlag: YesOrNoEnum;
  remark: string;
  status: ContactStatusEnum;
};

/**
 * 联系人地址数据传输对象
 */
export type PartnerAddressDTO = {
  partnerAddressId: string;
  partnerOrgId: string;
  contactId: string;
  name: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  areaCode: string;
  areaName: string;
  address: string;
  defaultFlag: YesOrNoEnum;
};
