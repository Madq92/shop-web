import { BaseController } from "@/api/BaseController";

export default class ConfigController extends BaseController {
  static list(req?: ConfigQueryReq) {
    return super.GET<ConfigDTO[]>("/config", req);
  }

  static detail(configId: string) {
    return super.GET<ConfigDTO>(`/config/${configId}`);
  }

  static create(config: ConfigDTO) {
    return super.POST<boolean>(`/config`, config);
  }

  static edit(configId: string, config: ConfigDTO) {
    return super.PUT<boolean>(`/config/${configId}`, config);
  }

  static delete(configId: string) {
    return super.DELETE<boolean>(`/config/${configId}`);
  }
}
export type ConfigQueryReq = {
  configType: string;
  configKey: string;
  configName: string;
};

/**
 * 系统参数数据传输对象
 */
export type ConfigDTO = {
  /**
   * 参数主键
   */
  configId: string;

  /**
   * 参数名称
   */
  configName: string;

  /**
   * 参数键名
   */
  configKey: string;

  /**
   * 参数键值
   */
  configValue: string;

  /**
   * 配置类型
   */
  configType: string;
};
