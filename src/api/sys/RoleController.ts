import { BaseController } from "@/api/BaseController";
import { ResourceDTO } from "@/api/sys/ResourceController";

export default class RoleController extends BaseController {
  static list() {
    return super.GET<RoleDTO[]>("/role");
  }

  static detail(roleId: string) {
    return super.GET<RoleDTO>(`/role/${roleId}`);
  }

  static create(role: RoleDTO) {
    return super.POST<boolean>(`/role`, role);
  }

  static edit(roleId: string, role: RoleDTO) {
    return super.PUT<boolean>(`/role/${roleId}`, role);
  }

  static delete(roleId: string) {
    return super.DELETE<boolean>(`/role/${roleId}`);
  }
}

export type RoleDTO = {
  /**
   * 角色ID
   */
  roleId: string;

  /**
   * 角色名称
   */
  roleName: string;

  /**
   * 角色权限字符串
   */
  roleKey: string;

  /**
   * 显示顺序
   */
  sort: number;

  /**
   * 资源列表
   */
  resources: ResourceDTO[];
};

export type RoleAddResourceReq = {
  resourceIds: string[];
};

export type RoleDelResourceReq = {
  resourceIds: string[];
};
