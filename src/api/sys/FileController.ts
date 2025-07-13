import { BaseController } from "@/api/BaseController";

export default class FileController extends BaseController {
  static uptoken() {
    return super.GET<string>("/file/uptoken");
  }
}
