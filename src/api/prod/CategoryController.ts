import { BaseController } from "@/api/BaseController";

export default class CategoryController extends BaseController {
  static list(req?: CategoryQueryReq) {
    return super.GET<CategoryDTO[]>("/category", req);
  }

  static detail(categoryId: string) {
    return super.GET<CategoryDTO>(`/category/${categoryId}`);
  }

  static create(category: CategoryDTO) {
    return super.POST<boolean>(`/category`, category);
  }

  static edit(categoryId: string, category: CategoryDTO) {
    return super.PUT<boolean>(`/category/${categoryId}`, category);
  }

  static delete(categoryId: string) {
    return super.DELETE<boolean>(`/category/${categoryId}`);
  }
}
export type CategoryQueryReq = {
  parentId: string;
  name: string;
};

/**
 * 分类数据传输对象
 */
export type CategoryDTO = {
  /**
   * 参数主键
   */
  categoryId: string;

  /**
   * 参数名称
   */
  parentId: string;

  /**
   * 参数键名
   */
  name: string;

  /**
   * 参数键值
   */
  sort: number;
};
