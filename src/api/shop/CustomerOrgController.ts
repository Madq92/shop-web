import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { PageReq } from '@/api/generic';
import { StatusEnum, TagLabel } from '@/api/types';

export default class CustomerOrgController extends BaseController {
  static page(params: CustomerOrgPageReq) {
    return super.GET<PageDataType<CustomerOrgDTO>>('/customer-org', params);
  }

  static detail(customerOrgId: string) {
    return super.GET<CustomerOrgDTO>(`/customer-org/${customerOrgId}`);
  }

  static create(customerOrg: CustomerOrgDTO) {
    return super.POST<string>(`/customer-org`, customerOrg);
  }

  static edit(customerOrgId: string, customerOrg: CustomerOrgDTO) {
    return super.PUT<boolean>(`/customer-org/${customerOrgId}`, customerOrg);
  }

  static delete(customerOrgId: string) {
    return super.DELETE<boolean>(`/customer-org/${customerOrgId}`);
  }
}

export type CustomerOrgType = 'SUPPLIER' | 'CUSTOMER' | 'LOGISTICS' | 'BANK' | 'OTHER';
export const CustomerOrgTypeLabels: Record<CustomerOrgType, TagLabel> = {
  SUPPLIER: { label: '供应商', color: 'blue', name: 'SUPPLIER' },
  CUSTOMER: { label: '顾客', color: 'green', name: 'CUSTOMER' },
  LOGISTICS: { label: '物流', color: 'purple', name: 'LOGISTICS' },
  BANK: { label: '银行', color: 'purple', name: 'BANK' },
  OTHER: { label: '其他', color: 'purple', name: 'OTHER' },
};

export type CustomerOrgDTO = {
  customerOrgId: string;
  name: string;
  type: CustomerOrgType;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  status: StatusEnum;
  remark: string;
};

export type CustomerOrgPageReq = PageReq & {
  type?: CustomerOrgType;
  name?: string;
};
