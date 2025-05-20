import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from "axios";
import {
  getTokenName,
  getTokenValue,
  setTokenValue,
} from "@/common/utils/index";
import { ResponseDataType } from "./types";
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
  validateStatus: () => {
    return true; // 放行哪些状态的请求
  },
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
    Promise.reject(error);
  },
);

// 创建响应拦截
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse): AxiosPromise<ResponseDataType<T>> => {
    const { data, status } = response;
    // 1.401清除本地token
    if (status === 401) {
      setTokenValue(null);
      setTokenValue(null);
      const message = (data && data.errorMessage) || "登录失败";
      return Promise.reject({ type: "notLogin", message });
    }

    // 2.header包含refreshedtoken时，更新token
    if (response.headers["refreshedtoken"] != null) {
      setTokenValue(response.headers["refreshedtoken"]);
    }

    // 3.文件处理
    if (response.data instanceof Blob) {
      return data;
    }

    // 3.统一异常处理
    if (data && data.success) {
      return data.data;
    } else {
      const message = data.errorMessage || "服务器异常，请稍后重试";
      return Promise.reject({ type: "error", message });
    }
  },
  (error) => {
    console.log("axios error:", error);
    return Promise.reject({ type: "error", message: "网络异常，请稍后重试" });
  },
);

export default axiosInstance;
