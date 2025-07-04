"use client";

import { Radio } from "antd";
import Box from "@/components/box";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { Microchip, Tags, Weight } from "lucide-react";
import { useState } from "react";

const options: CheckboxGroupProps<string>["options"] = [
  {
    value: "UNIT",
    label: (
      <div className={"flex items-center justify-center gap-2 w-full"}>
        <Weight />
        <div>单位</div>
      </div>
    ),
  },
  {
    value: "SPEC",
    label: (
      <div className={"flex items-center justify-center gap-2 w-full"}>
        <Microchip />
        <div>规格</div>
      </div>
    ),
  },
  {
    value: "LABEL",
    label: (
      <div className={"flex items-center justify-center gap-2 w-full"}>
        <Tags />
        <div>标签</div>
      </div>
    ),
  },
  // {
  //   value: "REMARK",
  //   label: (
  //     <div className={"flex items-center justify-center gap-2 w-full"}>
  //       <SquarePen />
  //       <div>备注</div>
  //     </div>
  //   ),
  // },
];

export default function DictPage() {
  const [dictType, setDictType] = useState<string>();

  return (
    <>
      <Box>
        <Radio.Group
          block
          options={options}
          defaultValue="UNIT"
          optionType="button"
          buttonStyle="solid"
          onChange={(e) => setDictType(e.target.value)}
        />
      </Box>
      {dictType == "UNIT" && <Box>单位</Box>}
      {dictType == "SPEC" && <Box>规格</Box>}
      {dictType == "LABEL" && <Box>标签</Box>}
    </>
  );
}
