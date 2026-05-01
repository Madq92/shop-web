import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { PageReq } from '@/common/http/types';
import { TagLabel, YesOrNoEnum } from '@/api/types';

export default class OrderController extends BaseController {
  /**
   * 获取订单分页列表
   */
  static page(req: OrderPageReq): Promise<PageDataType<OrderDTO>> {
    return super.GET<PageDataType<OrderDTO>>('/order', req);
  }

  /**
   * 获取订单详情
   */
  static detail(orderId: string): Promise<OrderDTO> {
    return super.GET<OrderDTO>(`/order/${orderId}`);
  }

  /**
   * 创建订单
   */
  static create(order: OrderDTO): Promise<string> {
    return super.POST<string>(`/order`, order);
  }

  /**
   * 编辑订单
   */
  static edit(orderId: string, order: OrderDTO): Promise<boolean> {
    return super.PUT<boolean>(`/order/${orderId}`, order);
  }

  /**
   * 删除订单
   */
  static delete(orderId: string): Promise<boolean> {
    return super.DELETE<boolean>(`/order/${orderId}`);
  }

  // ========== 状态变更 ==========

  /** 确认下单：INIT → ORDERED */
  static confirmOrder(orderId: string): Promise<boolean> {
    return super.PUT<boolean>(`/mini/order/${orderId}/confirm`);
  }

  /** 支付：ORDERED → PAID */
  static pay(orderId: string): Promise<boolean> {
    return super.PUT<boolean>(`/mini/order/${orderId}/pay`);
  }

  /** 管理端发货：PAID → DELIVERED */
  static deliver(orderId: string, expressCompany: string, expressNo: string): Promise<boolean> {
    return super.PUT<boolean>(`/order/${orderId}/deliver`, { expressCompany, expressNo });
  }

  /** 取消订单（管理端）：ORDERED → CLOSED */
  static cancelOrder(orderId: string): Promise<boolean> {
    return super.PUT<boolean>(`/mini/order/${orderId}/cancel`);
  }

  /** 确认收货（管理端）：DELIVERED → RECEIVED */
  static receiveOrder(orderId: string): Promise<boolean> {
    return super.PUT<boolean>(`/mini/order/${orderId}/receive`);
  }

  /** 管理端关闭订单：PAID → CLOSED */
  static adminClose(orderId: string): Promise<boolean> {
    return super.PUT<boolean>(`/order/${orderId}/close`);
  }

  // ========== 售后 ==========

  /** 同意退货 */
  static approveReturn(returnId: string): Promise<boolean> {
    return super.PUT<boolean>(`/order/return/${returnId}/approve`);
  }

  /** 拒绝退款 */
  static rejectReturn(returnId: string): Promise<boolean> {
    return super.PUT<boolean>(`/order/return/${returnId}/reject`);
  }

  /** 确认收到退货 */
  static receiveReturn(returnId: string): Promise<boolean> {
    return super.PUT<boolean>(`/order/return/${returnId}/receive`);
  }
}

/**
 * 订单数据传输对象
 */
export type OrderDTO = {
  orderId?: string;
  orderNo?: string;
  orderType?: OrderType;
  orderSource?: string;
  version?: string;
  customerId?: string;
  customerName?: string;
  partnerOrgId?: string;
  partnerOrgName?: string;
  merchantRemark?: string;
  customerRemark?: string;
  paid?: YesOrNoEnum;
  payType?: PayType;
  billAmount?: number;
  discount?: number;
  discountAmount?: number;
  expressAmount?: number;
  totalAmount?: number;
  payAmount?: number;
  delivered?: string;
  deliveryWay?: string;
  returnId?: string;
  returnStatus?: number;
  orderStatus?: OrderStatus;
  orderAddress?: OrderAddressModel;
  orderDetails?: OrderDetailModel[];
};

/**
 * 订单类型枚举
 */
export type OrderType = 'PRE_SALE' | 'SALE' | 'PRE_PROCURE' | 'PROCURE' | 'PROCURE_RETURN';
export const OrderTypeLabels: Record<OrderType, TagLabel> = {
  PRE_SALE: { label: '预售', color: 'blue', name: 'PRE_SALE' },
  SALE: { label: '销售', color: 'green', name: 'SALE' },
  PRE_PROCURE: { label: '预采', color: 'blue', name: 'PRE_PROCURE' },
  PROCURE: { label: '采购', color: 'blue', name: 'PROCURE' },
  PROCURE_RETURN: { label: '采购退货', color: 'red', name: 'PROCURE_RETURN' },
};

export type PayType = 'ON_CREDIT' | 'CASH_ON_DELIVERY' | 'WX_PAY';
export const PayTypeLabels: Record<PayType, TagLabel> = {
  ON_CREDIT: { label: '信用支付', color: 'purple', name: 'ON_CREDIT' },
  CASH_ON_DELIVERY: { label: '货到付款', color: 'orange', name: 'CASH_ON_DELIVERY' },
  WX_PAY: { label: '微信支付', color: 'green', name: 'WX_PAY' },
};

export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5;
export const OrderStatusLabels: Record<OrderStatus, TagLabel> = {
  0: { label: '初始化', color: 'default', name: 'INIT' },
  1: { label: '已下单', color: 'blue', name: 'ORDERED' },
  2: { label: '已付款', color: 'green', name: 'PAID' },
  3: { label: '已发货', color: 'cyan', name: 'DELIVERED' },
  4: { label: '已收货', color: 'green', name: 'RECEIVED' },
  5: { label: '已关闭', color: 'red', name: 'CLOSED' },
};

/**
 * 订单地址信息模型
 */
export type OrderAddressModel = {
  partnerAddressId?: string;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
};

/**
 * 订单详情模型
 */
export type OrderDetailModel = {
  skuId?: string;
  name?: string;
  price?: number;
  qty?: number;
  amount?: number;
};

/**
 * 订单分页查询请求参数
 */
export type OrderPageReq = PageReq & {
  status?: number;
  partnerOrgId?: string;
  customerId?: string;
};
