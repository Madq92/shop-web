import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { PageReq } from '@/api/generic';
import { TagLabel, YesOrNoEnum } from '@/api/types';

export default class OrderController extends BaseController {
  /**
   * 获取订单分页列表
   * @param req 查询参数
   */
  static page(req: OrderPageReq): Promise<PageDataType<OrderDTO>> {
    return super.GET<PageDataType<OrderDTO>>('/order', req);
  }

  /**
   * 获取订单详情
   * @param orderId 订单ID
   */
  static detail(orderId: string): Promise<OrderDTO> {
    return super.GET<OrderDTO>(`/order/${orderId}`);
  }

  /**
   * 创建订单
   * @param order 订单信息
   */
  static create(order: OrderDTO): Promise<string> {
    return super.POST<string>(`/order`, order);
  }

  /**
   * 编辑订单
   * @param orderId 订单ID
   * @param order 订单信息
   */
  static edit(orderId: string, order: OrderDTO): Promise<boolean> {
    return super.PUT<boolean>(`/order/${orderId}`, order);
  }

  /**
   * 删除订单
   * @param orderId 订单ID
   */
  static delete(orderId: string): Promise<boolean> {
    return super.DELETE<boolean>(`/order/${orderId}`);
  }
}

/**
 * 订单数据传输对象
 */
export type OrderDTO = {
  /**
   * 订单ID
   */
  orderId?: string;

  /**
   * 订单编号
   */
  orderNo?: string;

  /**
   * 订单类型：PRE_SALE,SALE,PRE_PROCURE,PROCURE,PROCURE_RETURN
   */
  orderType?: OrderType;

  /**
   * 订单来源：SHOP,WX
   */
  orderSource?: string;

  /**
   * 版本
   */
  version?: string;

  /**
   * 顾客ID
   */
  customerId?: string;

  /**
   * 顾客名称
   */
  customerName?: string;

  /**
   * 机构ID
   */
  partnerOrgId?: string;

  /**
   * 机构名称
   */
  partnerOrgName?: string;

  /**
   * 商家备注
   */
  merchantRemark?: string;

  /**
   * 客户备注
   */
  customerRemark?: string;

  /**
   * 支付完成：Y-是,N-否
   */
  paid?: YesOrNoEnum;

  /**
   * 支付方式：ON_CREDIT,CASH_ON_DELIVERY,WX_PAY
   */
  payType?: PayType;

  /**
   * 账单金额，商品总计
   */
  billAmount?: number;

  /**
   * 整单折扣
   */
  discount?: number;

  /**
   * 打折后金额： bill_amount * discount
   */
  discountAmount?: number;

  /**
   * 运费金额
   */
  expressAmount?: number;

  /**
   * 总金额：discount_amount + express_amount
   */
  totalAmount?: number;

  /**
   * 付款金额，实际付款金额
   */
  payAmount?: number;

  /**
   * 配送完成：Y-是,N-否
   */
  delivered?: string;

  /**
   * 配送方式：PICKUP-买家自提，DELIVERY-商家发货
   */
  deliveryWay?: string;

  /**
   * 退货单ID
   */
  returnId?: string;

  /**
   * 退货状态：0-init，1-买家申请退款，2-商家同意退货，3-发货，4-收货
   */
  returnStatus?: number;

  /**
   * 订单状态：0-init，1-下单，2-付款，3-发货，4-收货，5-交易关闭
   */
  orderStatus?: OrderStatus;

  /**
   * 订单地址信息
   */
  orderAddress?: OrderAddressModel;

  /**
   * 订单详情列表
   */
  orderDetails?: OrderDetailModel[];
};

/**
 * 订单类型枚举
 */
export type OrderType = 'PRE_SALE' | 'SALE' | 'PRE_PROCURE' | 'PROCURE' | 'PROCURE_RETURN';
export const OrderTypeLabels: Record<OrderType, TagLabel> = {
  PRE_SALE: { label: '预售', color: 'blue', name: 'PRE_SALE' },
  SALE: { label: '销售', color: 'blue', name: 'SALE' },
  PRE_PROCURE: { label: '采购', color: 'blue', name: 'PRE_PROCURE' },
  PROCURE: { label: '采购', color: 'blue', name: 'PROCURE' },
  PROCURE_RETURN: { label: '采购退货', color: 'blue', name: 'PROCURE_RETURN' },
};

export type PayType = 'ON_CREDIT' | 'CASH_ON_DELIVERY' | 'WX_PAY';
export const PayTypeLabels: Record<PayType, TagLabel> = {
  ON_CREDIT: { label: '货到付款', color: 'blue', name: 'ON_CREDIT' },
  CASH_ON_DELIVERY: { label: '货到付款', color: 'blue', name: 'CASH_ON_DELIVERY' },
  WX_PAY: { label: '微信支付', color: 'blue', name: 'WX_PAY' },
};

export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5;
export const OrderStatusLabels: Record<OrderStatus, TagLabel> = {
  0: { label: '初始化', color: 'blue', name: 'INIT' },
  1: { label: '下单', color: 'blue', name: 'ORDER' },
  2: { label: '付款', color: 'blue', name: 'PAY' },
  3: { label: '发货', color: 'blue', name: 'DELIVER' },
  4: { label: '收货', color: 'blue', name: 'RECEIVE' },
  5: { label: '关闭', color: 'blue', name: 'CLOSE' },
};

/**
 * 订单地址信息模型
 */
export type OrderAddressModel = {
  /**
   * 收货人姓名
   */
  receiverName?: string;

  /**
   * 收货人电话
   */
  receiverPhone?: string;

  /**
   * 省份
   */
  province?: string;

  /**
   * 城市
   */
  city?: string;

  /**
   * 区县
   */
  district?: string;

  /**
   * 详细地址
   */
  detailAddress?: string;
};

/**
 * 订单详情模型
 */
export type OrderDetailModel = {
  /**
   * 商品ID
   */
  productId?: string;

  /**
   * 商品名称
   */
  productName?: string;

  /**
   * 商品价格
   */
  price?: number;

  /**
   * 数量
   */
  quantity?: number;

  /**
   * 小计金额
   */
  subtotal?: number;
};

/**
 * 订单分页查询请求参数
 */
export type OrderPageReq = PageReq & {
  status?: number;
  partnerOrgId?: string;
  customerId?: string;
};
