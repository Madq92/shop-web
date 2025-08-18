import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { PageReq } from '@/api/generic';
import { StatusEnum, TagLabel, YesOrNoEnum } from '@/api/types';

export default class CustomerController extends BaseController {
  static page(params: CustomerPageReq) {
    return super.GET<PageDataType<CustomerDTO>>('/customer', params);
  }

  static detail(customerId: string) {
    return super.GET<CustomerDTO>(`/customer/${customerId}`);
  }

  static create(customer: CustomerDTO) {
    return super.POST<string>(`/customer`, customer);
  }

  static edit(customerId: string, customer: CustomerDTO) {
    return super.PUT<boolean>(`/customer/${customerId}`, customer);
  }

  static delete(customerId: string) {
    return super.DELETE<boolean>(`/customer/${customerId}`);
  }

  static address(customerId: string) {
    return super.GET<CustomerAddressDTO[]>(`/customer/${customerId}/address`);
  }

  static createAddress(customerId: string, address: CustomerAddressDTO) {
    return super.POST<string>(`/customer/${customerId}/address`, address);
  }

  static updateAddress(customerId: string, customerAddressId: string, address: CustomerAddressDTO) {
    return super.POST<boolean>(`/customer/${customerId}/address/${customerAddressId}`, address);
  }

  static deleteAddress(customerId: string, customerAddressId: string) {
    return super.DELETE<boolean>(`/customer/${customerId}/address/${customerAddressId}`);
  }
}

export const CustomerStatusLabels: Record<StatusEnum, TagLabel> = {
  ENABLE: { label: '启用', color: 'blue', name: 'ENABLE' },
  DISABLE: { label: '禁用', color: 'red', name: 'DISABLE' },
};

export type CustomerDTO = {
  customerId: string;
  customerOrgId: string;
  wxUserId: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  wechat: string;
  defaultFlag: YesOrNoEnum;
  remark: string;
  status: StatusEnum;
};

export type CustomerAddressDTO = {
  customerAddressId: string;
  customerOrgId: string;
  customerId: string;
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

export type CustomerPageReq = PageReq & {
  status?: StatusEnum;
  name?: string;
  customerOrgId?: string;
};
