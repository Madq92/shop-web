import { BaseController } from '@/api/BaseController';
import { PageDataType } from '@/common/http/types';
import { RoleDTO } from '@/api/sys/RoleController';
import { ResourceDTO } from '@/api/sys/ResourceController';
import { PageReq } from '@/api/generic';
import { TagLabel } from '@/api/types';

export default class UserController extends BaseController {
  static page(params: UserPageReq) {
    return super.GET<PageDataType<UserDTO>>('/user', params);
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
    return super.PUT<boolean>(`/user/${userId}`, { status: 'ENABLE' });
  }

  static disable(userId: string) {
    return super.PUT<boolean>(`/user/${userId}`, { status: 'DISABLE' });
  }

  static delete(userId: string) {
    return super.DELETE<boolean>(`/user/${userId}`);
  }
}

export type UserStatus = 'ENABLE' | 'DISABLE';
export const UserStatusLabels: Record<UserStatus, TagLabel> = {
  ENABLE: { label: '启用', color: 'blue', name: 'ENABLE' },
  DISABLE: { label: '禁用', color: 'red', name: 'DISABLE' },
};
export const UserGenderLabels: Record<UserGender, TagLabel> = {
  MALE: { label: '男', color: 'blue', name: 'MALE' },
  FEMALE: { label: '女', color: 'magenta', name: 'FEMALE' },
  NONE: { label: '无', color: 'lime', name: 'NONE' },
};
export type UserGender = 'MALE' | 'FEMALE' | 'NONE';

export type UserDTO = {
  userId: string;
  name: string;
  email: string;
  phonenumber: string;
  gender: UserGender;
  avatar: string;
  loginIp: string;
  loginDate: string;
  pwdUpdateDate: string;
  status: UserStatus;
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
  status?: UserStatus;
};
