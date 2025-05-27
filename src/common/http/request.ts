import { AxiosRequestConfig } from "axios";
import { ANY_OBJECT } from "@/api/generic";
import axiosInstance from "./axios";
import { RequestMethods, RequestOption, ResponseDataType } from "./types";
import { toast } from "sonner";

const globalConfig = {
  requestOption: {
    mock: false,
    // 调用的时候是否显示蒙版
    showMask: true,
    // 是否显示公共的错误提示
    showError: true,
    // 是否开启节流功能，同一个url不能频繁重复调用
    throttleFlag: false,
    // 节流间隔
    throttleTimeout: 50,
  } as RequestOption,
  axiosOption: {
    responseType: "json",
  } as AxiosRequestConfig,
};

function showErrorMessage(message: string) {
  toast.error(message, {
    duration: 3000,
    position: "bottom-center",
    classNames: {
      toast: "toast-error",
    },
  });
}

// url调用节流Set
const ajaxThrottleSet = new Set();

/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 * @param url 请求地址
 * @param params 请求参数
 * @param method 请求方法，只接受"get" | "delete" | "head" | "post" | "put" | "patch"
 * @param requestOption 请求配置(针对当前本次请求)
 * @param axiosOption axios配置(针对当前本次请求)
 */
export async function commonRequest<D>(
  url: string,
  params: ANY_OBJECT,
  method: RequestMethods,
  requestOption?: RequestOption,
  axiosOption?: AxiosRequestConfig,
): Promise<D> {
  const finalOption = {
    ...globalConfig.requestOption,
    ...requestOption,
  };
  const { throttleFlag, throttleTimeout, loginRequest } = finalOption;

  if (ajaxThrottleSet.has(url) && throttleFlag) {
    return Promise.reject();
  } else {
    if (throttleFlag) {
      ajaxThrottleSet.add(url);
      setTimeout(() => {
        ajaxThrottleSet.delete(url);
      }, throttleTimeout || 50);
    }

    const finalAxiosOption = {
      ...globalConfig.axiosOption,
      ...axiosOption,
    };

    // get请求使用params字段
    let data: ANY_OBJECT = { params };
    // 非get请求使用data字段
    if (method !== "get") data = { data: params };

    try {
      const result: ResponseDataType<D> = await axiosInstance({
        url,
        method,
        ...data,
        ...finalAxiosOption,
      });
      if (result.success) {
        return Promise.resolve(result.data);
      } else {
        if (loginRequest) {
          // login-form里面自己处理
          return Promise.reject(result);
        }
        if (result.errorCode === "UNAUTHORIZED_EXCEPTION") {
          if (window.location) {
            window.location.href = "/login";
          }
        }
        showErrorMessage(
          result.errorMessage ? result.errorMessage : "服务器异常，请稍后重试",
        );
        // 显示错误信息
        return Promise.reject(result);
      }
    } catch (error) {
      console.log("request error:", error);
      // 显示错误信息
      showErrorMessage("网络异常，请稍后重试");
      return Promise.reject({ errorMessage: "网络异常，请稍后重试" });
    }
  }
}

/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const get = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, "get", options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const post = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, "post", options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const put = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, "put", options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const patch = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, "patch", options, axiosOption);
};
/***
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 * @param axiosOption
 */
export const del = async <D>(
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
  axiosOption?: AxiosRequestConfig,
) => {
  return await commonRequest<D>(url, params, "delete", options, axiosOption);
};
/**
 *
 * @param url 请求地址
 * @param params 请求参数
 * @param filename 文件名
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 */
export const download = async (
  url: string,
  params: ANY_OBJECT,
  filename: string,
  method: RequestMethods = "post",
  options?: RequestOption,
) => {
  return new Promise((resolve, reject) => {
    downloadBlob(url, params, method, options)
      .then((blobData) => {
        const blobUrl = window.URL.createObjectURL(blobData);
        const linkDom = document.createElement("a");
        linkDom.style.display = "none";
        linkDom.href = blobUrl;
        linkDom.setAttribute("download", filename);
        if (typeof linkDom.download === "undefined") {
          linkDom.setAttribute("target", "_blank");
        }
        document.body.appendChild(linkDom);
        linkDom.click();
        document.body.removeChild(linkDom);
        window.URL.revokeObjectURL(blobUrl);
        resolve(true);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
/**
 * 下载文件，返回blob
 * @param {String} url 请求的url
 * @param {Object} params 请求参数
 * @param {RequestMethods} method 请求方法
 * @returns {Promise}
 */
export const downloadBlob = (
  url: string,
  params: ANY_OBJECT,
  method: RequestMethods = "post",
  options?: RequestOption,
) => {
  return new Promise<Blob>((resolve, reject) => {
    const axiosOption: AxiosRequestConfig = {
      responseType: "blob",
      transformResponse: function (data) {
        return data instanceof Blob && data.size > 0 ? data : undefined;
      },
    };
    commonRequest<Blob>(url, params, method, options, axiosOption)
      .then((res) => {
        if (res instanceof Blob) {
          resolve(res);
        } else {
          console.warn("下载文件失败", res);
          reject(new Error("下载文件失败"));
        }
      })
      .catch((e) => {
        if (e instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            reject(
              reader.result
                ? JSON.parse(reader.result.toString()).errorMessage
                : "下载文件失败",
            );
          };
          reader.readAsText(e);
        } else {
          reject("下载文件失败");
        }
      });
  });
};
/**
 * 上传
 * @param url 请求地址
 * @param params 请求参数
 * @param options 请求设置(showMask-是否显示Loading层，默认为true；showError-是否显示错误信息，默认为true；throttleFlag-是否开户节流，默认为false；throttleTimeout-节流时效，默认为50毫秒)
 */
export const upload = async (
  url: string,
  params: ANY_OBJECT,
  options?: RequestOption,
) => {
  const axiosOption: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    transformRequest: [
      function (data) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        return formData;
      },
    ],
  };

  const finalOption = {
    ...globalConfig.requestOption,
    ...options,
  };
  const { showError } = finalOption;
  return new Promise((resolve, reject) => {
    commonRequest<ANY_OBJECT>(url, params, "post", options, axiosOption)
      .then((res) => {
        if (res?.success) {
          resolve(res);
        } else {
          if (showError)
            showErrorMessage(
              res.data.errorMessage ? res.data.errorMessage : "数据请求失败",
            );
          reject("数据请求失败");
        }
      })
      .catch((e) => {
        if (showError)
          showErrorMessage(e.errorMessage ? e.errorMessage : "网络请求错误");
        reject(e);
      });
  });
};
