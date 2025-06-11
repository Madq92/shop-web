"use client";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export default function FrontPage() {
  function getIconComponent(iconName: IconName) {
    return <DynamicIcon name={iconName} />;
  }

  return (
    <>
      <DynamicIcon name="camera" color="red" size={48} />
      {getIconComponent("a-arrow-down")}
      <div>前端文档</div>
    </>
  );
}
