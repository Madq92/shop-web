import { useEffect } from "react";
import { notification } from "antd";
import { ArgsProps } from "antd/es/notification/interface";

export default function GlobalNotification() {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (prop: ArgsProps) => {
    api.open(prop);
  };
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 可选：验证来源
      // if (event.origin !== 'https://yourdomain.com') return;

      console.log("收到消息:", event.data);
      // 根据消息内容处理逻辑
      if (event.data.data?.type === "error") {
        // 触发错误提示或其他 UI 反馈
        openNotification({ message: event.data.data.text });
      }
    };

    window.addEventListener("message", handleMessage);

    // 清理函数
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <>{contextHolder}</>;
}
