# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

Shop Admin 管理后台 — 基于 Next.js 15 的全栈电商系统前端。后端在独立仓库 [shop](https://github.com/Madq92/shop)，提供 REST API。

## 常用命令

```bash
pnpm dev              # 启动开发服务器（Turbopack，localhost:3000）
pnpm build            # 生产构建（output: standalone）
pnpm lint             # ESLint 检查（next/core-web-vitals + next/typescript）
npx tsc --noEmit      # TypeScript 类型检查
```

需要在 `.env.local` 中配置 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/`。

## 架构

### 路由（Next.js App Router）

业务页面都在 `src/app/(protected)/` 下 — 使用括号路由组。`(auth)/login/` 为公开页面。中间件（`src/middleware.ts`）通过检查 `tokenValue` cookie 将未登录用户重定向到 `/login`。受保护布局（`src/app/(protected)/client-layout.tsx`）包裹侧边栏 + Antd Registry + Toast Provider。

```
src/app/
  (auth)/login/           # 登录页（公开）
  (protected)/
    crm/                  # 联系人、合作机构
    shop/                 # 顾客、顾客机构
    oms/                  # 订单（列表、创建、编辑）
    prod/                 # 商品（SPU、分类、字典）
    sys/                  # 用户、角色、资源、配置、日志
    dashboard/            # 仪表盘概览
```

### API 层（`src/api/`）

- **`BaseController`** — 提供 `GET/POST/PUT/DELETE` 静态方法，封装 `commonRequest`。所有 API 控制器继承此类。
- 每个后端 Controller 1:1 对应一个前端 API 类（如 `OrderController.ts` → 后端 `/order` 接口）。
- 控制器同时导出类（静态方法）和 TypeScript 类型（`*DTO`、`*PageReq`、带 `*Labels` 的枚举）。

### HTTP 客户端（`src/common/http/`）

- **`axios.ts`** — axios 实例，baseURL 从环境变量读取，请求拦截器注入 Token，响应拦截器处理 401 和 Token 刷新。Token 存储在 `sessionStorage`。
- **`request.ts`** — `commonRequest<D>()` 封装 axios，包含错误处理（通过 `sonner` 弹 toast）、请求节流，以及 `{ success, data, errorCode, errorMessage }` 响应约定。

### UI 技术栈

- **Ant Design 5** — 主要组件库（Table、Form、Modal、Select 等）
- **shadcn/ui**（new-york 风格） — 侧边栏、布局原语、Toast（`sonner`）。配置在 `components.json`。
- **Tailwind CSS 4** — 工具类。PostCSS 通过 `@tailwindcss/postcss`。
- **react-hook-form + zod** — 已安装，但多数页面目前使用 Antd `Form`。

### 核心模式

**页面模式** — 列表页遵循以下结构：
1. 顶部 `Box` + `Form`（查询筛选）
2. 下方 `Box` + `Table`（数据列表）
3. `Modal` 用于新建/编辑表单
4. 状态：`useState` 管理数据、加载、分页、弹窗可见性
5. `doQuery()` 获取数据，`useEffect` 挂载时调用，变更后刷新

**价格约定** — 后端以**分（cent）**为单位存储价格（Long 类型）。前端显示为 `¥{(cents / 100).toFixed(2)}`。

**枚举模式** — 枚举使用 TypeScript `type` 联合类型，配合 `*Labels` Record 映射到 `{ label, color, name }`（TagLabel）。使用 `enumToOptions()` 转换为 Antd `Select` 的 options。

**DebounceSelect**（`src/components/debounce-select.tsx`） — 带防抖的异步搜索下拉，用于查找顾客、机构、商品。接受 `fetchOptions` 异步函数。

**useTableQuery**（`src/hooks/use-table-query.ts`） — 通用分页表格查询 Hook（部分页面尚未使用，仍手动管理分页状态）。

### 模块 ↔ 后端对应关系

| 后端模块 | 前端目录 | 业务域 |
|---------|---------|--------|
| `crm` | `(protected)/crm/` | 联系人、合作机构 |
| `shop` | `(protected)/shop/` | 顾客、顾客机构 |
| `oms` | `(protected)/oms/` | 订单、退货 |
| `prod` | `(protected)/prod/` | 商品、SPU/SKU、分类、字典 |
| `sys` | `(protected)/sys/` | 用户、角色、资源、配置、日志 |

注意：订单（`oms_order`）的顾客来源是 `shop_customer`，不是 `crm_contact`。

### 路径别名

`@/*` 映射到 `./src/*`（在 `tsconfig.json` 中配置）。

### 构建

`next.config.ts` 设置 `output: 'standalone'` 用于容器化部署。参见 `Dockerfile` 和 `build.sh`/`build_ps.ps1`。
