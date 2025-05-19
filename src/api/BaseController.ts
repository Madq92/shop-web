import { AxiosRequestConfig } from "axios";
import {
  commonRequest,
  download,
  downloadBlob,
  upload,
} from "@/common/http/request";
import { RequestMethods, RequestOption } from "@/common/http/types";
import { ANY_OBJECT } from "@/api/generic";

export class BaseController {
  static async GET<D>(
    url: string,
    params?: ANY_OBJECT,
    options?: RequestOption,
    axiosOption?: AxiosRequestConfig,
  ) {
    if (!params) {
      params = {};
    }
    return await commonRequest<D>(url, params, "get", options, axiosOption);
  }

  static async POST<D>(
    url: string,
    params?: ANY_OBJECT,
    options?: RequestOption,
    axiosOption?: AxiosRequestConfig,
  ) {
    if (!params) {
      params = {};
    }
    return await commonRequest<D>(url, params, "post", options, axiosOption);
  }

  static async PUT<D>(
    url: string,
    params?: ANY_OBJECT,
    options?: RequestOption,
    axiosOption?: AxiosRequestConfig,
  ) {
    if (!params) {
      params = {};
    }
    return await commonRequest<D>(url, params, "put", options, axiosOption);
  }

  static async DELETE<D>(
    url: string,
    params?: ANY_OBJECT,
    options?: RequestOption,
    axiosOption?: AxiosRequestConfig,
  ) {
    if (!params) {
      params = {};
    }
    return await commonRequest<D>(url, params, "delete", options, axiosOption);
  }

  static download(
    url: string,
    params: ANY_OBJECT,
    filename: string,
    method?: RequestMethods,
    options?: RequestOption,
  ) {
    return download(url, params, filename, method, options);
  }

  static downloadBlob(
    url: string,
    params: ANY_OBJECT,
    method: RequestMethods = "post",
    options?: RequestOption,
  ) {
    return downloadBlob(url, params, method, options);
  }

  static upload(url: string, params: ANY_OBJECT, options?: RequestOption) {
    return upload(url, params, options);
  }
}
