import * as React from "react";
import { cn } from "@/lib/utils";

type TextareaWithCounterProps = React.ComponentProps<"textarea"> & {
  maxChars?: number;
};

function TextareaWithCounter({
  className,
  maxChars,
  ...props
}: TextareaWithCounterProps) {
  const [text, setText] = React.useState(props.value?.toString() || "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (maxChars && value.length > maxChars) return;
    setText(value);
    // 触发原始的 onChange 事件
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="relative">
      <textarea
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        value={text}
        onChange={handleChange}
        {...props}
      />
      <div className="absolute bottom-2 right-3 text-sm text-gray-500">
        {text.length} {maxChars && `/ ${maxChars}`}
      </div>
    </div>
  );
}

export { TextareaWithCounter };
