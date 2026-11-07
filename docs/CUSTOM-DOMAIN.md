# 自定义域名接入记录（tianyi.fan）

## 当前状态

- Cloudflare Pages 侧：`mingyige.tianyi.fan` 已添加到项目 `mingyige`（status: initializing）
- DNS：`tianyi.fan` 托管在 **DNSPod**（colt/maggie.dnspod.net），根域无 A 记录、无冲突子域
- 待办：在 DNSPod 控制台加 CNAME 记录（唯一手工步骤），然后 Cloudflare 自动签发证书

## DNSPod 需要添加的记录

| 字段 | 值 |
|---|---|
| 主机记录 | `mingyige` |
| 记录类型 | `CNAME` |
| 记录值 | `mingyige.pages.dev` |
| TTL | 默认（600） |

操作路径：https://console.dnspod.cn → 域名解析 → tianyi.fan → 添加记录。

## 生效验证

```bash
nslookup mingyige.tianyi.fan 119.29.29.29   # 应返回 mingyige.pages.dev 或 CNAME 链
curl -skI https://mingyige.tianyi.fan/      # 证书签发后 200
```

Cloudflare 证书签发通常在 DNS 记录生效后几分钟到一小时内完成。

## 备注

- 未备案：国内访问依旧走 Cloudflare 海外节点，但 `tianyi.fan` 为自有域名，可后续做「优选 IP」（CNAME 换成优选解析线路）改善可达性
- 若以后想在根域 `tianyi.fan` 也展示站点：DNSPod 加 CNAME 记录（主机记录 `@`，记录值 `mingyige.pages.dev`）——注意 DNSPod 免费版根域 CNAME 支持有限，可能需改用显式 A 记录（Cloudflare Anycast IP）或升级 DNS 套餐
