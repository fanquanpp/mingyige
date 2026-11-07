# 自定义域名接入记录（tianyi.ty.fan）

## 当前状态

- Cloudflare Pages 侧：`tianyi.ty.fan` 已添加到项目 `mingyige`（status: initializing，等待 DNS 验证）
- DNS：`ty.fan` 目前**整域 NXDOMAIN**——尚未在任何 DNS 服务商配置解析（新注册或 NS 未生效）
- 历史尝试：`mingyige.tianyi.fan`（解析权在他人 DNSPod 账号，弃用）、`mingyige.ty.fan`（已换为 tianyi 子域）

## 待办（按顺序）

### 1. 在 `ty.fan` 的 DNS 服务商添加 TXT 校验记录（DNSPod 弹窗要求）

| 字段 | 值 |
|---|---|
| 主机记录 | `_dnspodcheck` |
| 记录类型 | `TXT` |
| 记录值 | `3571240a1e7e79bc128a703c835f7265` |
| 有效期 | 2026-11-08 21:59 前完成 |

「DNS 服务商」= 购买 `ty.fan` 的平台（注册商）的 DNS 管理页；若不确定，登录注册商后台找「域名 → DNS 解析」。

### 2. TXT 校验通过后，添加站点 CNAME

| 字段 | 值 |
|---|---|
| 主机记录 | `tianyi` |
| 记录类型 | `CNAME` |
| 记录值 | `mingyige.pages.dev` |
| TTL | 默认 |

## 生效验证

```bash
nslookup tianyi.ty.fan 119.29.29.29   # 应返回 mingyige.pages.dev 或 CNAME 链
curl -skI https://tianyi.ty.fan/      # 证书签发后 200
```

Cloudflare 证书签发通常在 DNS 记录生效后几分钟到一小时内完成。

## 备注

- 未备案：国内访问依旧走 Cloudflare 海外节点，但自有域名可后续做「优选 IP」（CNAME 换成优选解析线路）改善可达性
- Cloudflare 侧无需再手动配置：域已在项目上，DNS 验证通过即自动签证书并生效
