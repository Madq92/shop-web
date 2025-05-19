import axios, { AxiosInstance, AxiosPromise, AxiosResponse } from "axios";
import { getToken, setToken } from "@/common/utils/index";
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
    const token = getToken();
    if (token != null) config.headers["satoken"] = token;
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
      setToken(null);
      return Promise.reject(
        new Error("您未登录，或者登录已经超时，请先登录！"),
      );
    }

    // 2.header包含refreshedtoken时，更新token
    if (response.headers["refreshedtoken"] != null) {
      setToken(response.headers["refreshedtoken"]);
    }

    // 3.同一异常处理
    if (!(response.data instanceof Blob) && !response.data.success) {
      return Promise.reject(
        new Error(response.data.errorMessage || "请求失败，请稍后重试"),
      );
    }

    return data;
  },
  (error) => {
    let message = "网络异常，请稍后重试";
    if (error && error.response) {
      message = error.response.data.errorMessage;
    }
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
