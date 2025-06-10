import React from "react";
import { Button } from "@/components/ui/button";
import { GithubOutlined } from "@ant-design/icons";

export default function CtaGithub() {
  return (
    <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
      <a
        href="https://github.com/Madq92/shop-web"
        rel="noopener noreferrer"
        target="_blank"
        className="dark:text-foreground"
      >
        <GithubOutlined />
      </a>
    </Button>
  );
}
