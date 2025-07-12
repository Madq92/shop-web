import { BaseController } from "@/api/BaseController";
import { PageDataType } from "@/common/http/types";
import { DictDTO } from "./DictController";
import { PageReq } from "@/api/sys/UserController";

export default class SpuController extends BaseController {
  /**
   * 商品分页查询
   */
  static page(req: SpuQueryReq) {
    return super.GET<PageDataType<SpuDTO>>("/spu", req);
  }

  /**
   * 商品详情
   */
  static detail(spuId: string) {
    return super.GET<SpuDTO>(`/spu/${spuId}`);
  }

  /**
   * 商品创建
   */
  static create(spuDTO: SpuDTO) {
    return super.POST<string>("/spu", spuDTO);
  }

  /**
   * 商品编辑
   */
  static edit(spuId: string, spuDTO: SpuDTO) {
    return super.PUT<boolean>(`/spu/${spuId}`, spuDTO);
  }

  /**
   * 商品删除
   */
  static delete(spuId: string) {
    return super.DELETE<boolean>(`/spu/${spuId}`);
  }
}

export type SpuQueryReq = PageReq & {
  name?: string;
  status?: string;
};

export enum SpuTypeEnum {
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

export enum YesOrNoEnum {
  YES = "Y",
  NO = "N",
}

export enum ProdStatusEnum {
  ENABLE = "ENABLE",
  DISABLE = "DISABLE",
}

export type SkuDTO = {
  skuId?: string;
  spuId?: string;
  code?: string;
  sellPrice?: number;
  sellPrice1?: number;
  sellPrice2?: number;
  sellPrice3?: number;
  imgUrl?: string;
  weightFlag?: string;
  defaultWeight?: number;
  status?: string;
  specs?: DictDTO[];
};

export type SpuDTO = {
  spuId: string;
  name: string;
  code: string;
  type: string;
  unitId: string;
  unitName: string;
  categoryId: string;
  categoryName: string;
  parentCategoryId: string;
  parentCategoryName: string;
  weightFlag: string;
  imgUrlList: string[];
  spuDesc: string;
  sort: number;
  status: string;
  skus: SkuDTO[];
  props: DictDTO[];
};
