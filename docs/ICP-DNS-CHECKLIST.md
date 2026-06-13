# ICP 备案 + DNS 配置检查清单

> 适用域名: `shuanghongtech.com` / `www.shuanghongtech.com`
> 部署目标: 火山引擎 ECS(4C8G, 80GB SSD, Ubuntu 22.04)
> 预计耗时: 15-20 工作日(ICP 审核)

## ⚠️ 重要提示

中国大陆服务器(火山引擎/腾讯云/阿里云)要求域名**必须先完成 ICP 备案**才能解析到公网 IP。未备案的域名解析后会被运营商屏蔽(返回 80/443 端口不可达)。

## 📋 Phase 0.3: ICP 备案材料准备

### 必备材料(企业备案)

| 材料 | 说明 | 获取方式 |
|------|------|----------|
| 营业执照副本 | 彩色扫描件,清晰可读 | 市场监督管理局 |
| 法人身份证 | 正反面扫描件 | 法人本人提供 |
| 网站负责人身份证 | 同上(可与法人一致) | 法人本人提供 |
| 域名证书 | 在域名注册商处下载 | 阿里云/腾讯云/Cloudflare 控制台 |
| 服务器购买凭证 | ECS 订单截图或合同 | 火山引擎控制台 |
| 备案真实性核验单 | 火山引擎提供模板,法人签字 | 火山引擎备案系统 |
| 主体负责人授权书 | 如网站负责人 ≠ 法人,需法人签字的授权书 | 自备 |

### 准备步骤

1. **登录火山引擎备案系统**: https://console.volcengine.com/record
2. **新增备案**: 填写主体信息(企业营业执照信息)
3. **新增网站**: 填写网站信息(域名、服务器 IP)
4. **上传材料**: 按提示上传所有扫描件
5. **法人/负责人人脸核验**: 通过火山引擎 App 完成
6. **提交初审**: 火山引擎 1-2 工作日内审核
7. **工信部短信核验**: 初审通过后会收到工信部短信,需 24 小时内访问短信中的链接验证
8. **管局审核**: 15-20 工作日
9. **备案成功**: 获得 ICP 备案号(格式:`沪ICP备XXXXXXXX号`)

### 关键信息(请填写)

```
主办单位名称: 上海双泓信息科技有限公司
主办单位性质: 企业
网站名称: 上海双泓信息科技官网
网站首页: https://shuanghongtech.com/
域名列表: shuanghongtech.com, www.shuanghongtech.com
服务类型: 网站应用
网站语言: 简体中文
```

## 📋 Phase 0.4: DNS 记录配置

### 等 ICP 备案成功后再做!

```bash
# 域名注册商控制台 → DNS 解析
# 添加以下 A 记录:

主机记录    记录类型    记录值(IP)        TTL
@          A           <ECS 公网 IP>      600
www        A           <ECS 公网 IP>      600
```

### 获取 ECS 公网 IP

```bash
# 登录 ECS 后
curl -s ifconfig.me
# 或在火山引擎控制台 → 云服务器 → 实例详情
```

### 验证 DNS 生效

```bash
# 应返回 ECS 公网 IP
dig shuanghongtech.com A +short
dig www.shuanghongtech.com A +short

# 备用工具
nslookup shuanghongtech.com
```

## 🔒 备案号嵌入网站

ICP 备案成功后,需要把备案号添加到网站底部:

### 1. 在 Strapi 后台填写

访问 http://localhost:1337/admin → Content Manager → Site Setting:
- 字段: `icpNumber`
- 值: `沪ICP备XXXXXXXX号-1`(注意 `-1` 后缀,子域名前缀)

### 2. Footer 已自动显示

`web/components/Footer.tsx` 已实现自动渲染,无需改代码。

## ✅ 完成检查

- [ ] ICP 备案成功(收到工信部邮件)
- [ ] 备案号格式正确(沪ICP备XXXX号-1)
- [ ] DNS A 记录已添加
- [ ] DNS 生效(`dig` 返回 ECS IP)
- [ ] Strapi SiteSetting 已填入 ICP 备案号
- [ ] 网站 footer 显示备案号(带 beian.miit.gov.cn 链接)
- [ ] `https://shuanghongtech.com/` 可访问

## 📞 备案客服

- 火山引擎备案专线: 400-850-0000 转 1
- 工信部备案系统: https://beian.miit.gov.cn
- 备案常见问题: https://www.volcengine.com/docs/6258

## 💡 加速建议

1. **提前买域名 + 实名认证**: 域名必须实名 3 天后才能备案
2. **材料一次到位**: 缺材料会反复退回,延长周期
3. **工信部短信别错过**: 24 小时内必须验证,否则退回
4. **法人配合人脸核验**: 用火山引擎 App 几分钟搞定
5. **避开月初/月末**: 管局审核员月底冲量,月初反而更快
