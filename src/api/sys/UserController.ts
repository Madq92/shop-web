import { BaseController } from "@/api/BaseController";
import { PageDataType } from "@/common/http/types";
import { RoleDTO } from "@/api/sys/RoleController";
import { ResourceDTO } from "@/api/sys/ResourceController";

export default class UserController extends BaseController {
  static page(params: UserPageReq) {
    return super.GET<PageDataType<UserDTO>>("/user", params);
  }

  static detail(userId: string) {
    return super.GET<UserDTO>(`/user/${userId}`);
  }

  static create(user: UserDTO) {
    return super.POST<boolean>(`/user`, user);
  }

  static edit(userId: string, user: UserDTO) {
    return super.PUT<boolean>(`/user/${userId}`, user);
  }

  static enable(userId: string) {
    return super.PUT<boolean>(`/user/${userId}`, { status: "ENABLE" });
  }

  static disable(userId: string) {
    return super.PUT<boolean>(`/user/${userId}`, { status: "DISABLE" });
  }

  static delete(userId: string) {
    return super.DELETE<boolean>(`/user/${userId}`);
  }
}

export enum UserStatus {
  ENABLE = "启用",
  DISABLE = "停用",
}

export enum UserGender {
  MALE = "男",
  FEMALE = "女",
  NONE = "未知",
}

export type UserDTO = {
  userId: string;
  name: string;
  email: string;
  phonenumber: string;
  gender: string;
  avatar: string;
  loginIp: string;
  loginDate: string;
  pwdUpdateDate: string;
  status: string;
  roles: RoleDTO[];
  resources: ResourceDTO[];
};

export type UserLoginReq = {
  email: string;
  phonenumber: string;
  password: string;
};

export type UserPageReq = PageReq & {
  name?: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  status?: string;
};

export type PageReq = {
  pageSize: number;
  pageNum: number;
};
