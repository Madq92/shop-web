import { BaseController } from "@/api/BaseController";
import { UserDTO } from "@/api/sys/UserController";

export default class LoginController extends BaseController {
  static login(req: UserLoginReq) {
    return super.POST<UserLoginInfoResp>(`/login`, req, { loginRequest: true });
  }
}

export type UserLoginReq = {
  email: string;
  phonenumber: string;
  password: string;
};

export type UserLoginInfoResp = {
  tokenName: string;
  tokenValue: string;
  user: UserDTO;
};
