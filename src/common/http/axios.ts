import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  getTokenName,
  getTokenValue,
  setTokenName,
  setTokenValue,
} from "@/common/utils";
import { serverDefaultCfg } from "@/common/http/config";

// 创建 axios 请求实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: serverDefaultCfg.baseURL, // 基础请求地址
  timeout: 50000, // 请求超时设置
  withCredentials: true, // 跨域请求是否需要携带 cookie
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    deviceType: "WEB_APP",
  },
  validateStatus: () => true,
});

// 创建请求拦截
// 1.添加请求头，添加token
axiosInstance.interceptors.request.use(
  (config) => {
    const tokenValue = getTokenValue();
    const tokenName = getTokenName();
    if (tokenValue != null && tokenName != null) {
      config.headers[tokenName] = tokenValue;
    }
    return config;
  },
  (error) => {
    console.log("axios request error:", error);
    Promise.reject({ errorMessage: "请求配置异常" });
  },
);

// 创建响应拦截
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, status } = response;
    // 1.401清除本地token
    if (status === 401) {
      setTokenName(null);
      setTokenValue(null);
    }

    // 2.header包含refreshedtoken时，更新token
    if (response.headers["refreshedtoken"] != null) {
      setTokenValue(response.headers["refreshedtoken"]);
    }

    return data;
  },
  (error) => {
    console.log("axios response error:", error);
    return Promise.reject({
      type: "network",
      message: "网络异常，请检查连接",
    });
  },
);

export default axiosInstance;
