import { BaseController } from "@/api/BaseController";
import { treeDataTranslate } from "@/common/utils";

export default class ResourceController extends BaseController {
  static list() {
    return super.GET<ResourceDTO[]>("/resource");
  }

  static async tree() {
    const resourceList = await this.list();
    const roleMenuList = resourceList.map((resourceDto) => ({
      title: resourceDto.resourceName,
      key: resourceDto.resourceId,
      parentId: resourceDto.parentResourceId,
    }));
    return treeDataTranslate(roleMenuList, "key", "parentId");
  }

  static detail(resourceId: string) {
    return super.GET<ResourceDTO>(`/resource/${resourceId}`);
  }

  static create(resource: ResourceDTO) {
    return super.POST<boolean>(`/resource`, resource);
  }

  static edit(resourceId: string, resource: ResourceDTO) {
    return super.PUT<boolean>(`/resource/${resourceId}`, resource);
  }

  static delete(resourceId: string) {
    return super.DELETE<boolean>(`/resource/${resourceId}`);
  }
}

export enum ResourceType {
  MENU = "菜单",
  API = "接口",
}

export type ResourceDTO = {
  /**
   * 资源ID
   */
  resourceId: string;

  /**
   * 资源名称
   */
  resourceName: string;

  /**
   * 父资源ID
   */
  parentResourceId: string;

  /**
   * 显示顺序
   */
  sort: number;

  /**
   * 请求地址
   */
  url: string;

  /**
   * 菜单类型（MENU菜单 BUTTON按钮）
   */
  resourceType: string;

  /**
   * 菜单状态
   */
  visible: boolean;

  /**
   * 权限标识
   */
  perms: string;

  /**
   * 菜单图标
   */
  icon: string;
};
