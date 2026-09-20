# unoanalyzer-cli · `uno`

一个**自更新**的命令行工具，把 UnoAnalyzer 学习智能平台（`cn.unoanalyzer.com`）里
**ENT207TC · Digital Startup Lab** 课程的学生操作全部搬到终端。

> A self-updating CLI for the UnoAnalyzer platform, built around the ENT207TC
> student workflow. Log in once; both the session and the command set stay
> current automatically.

## 亮点

- **只登一次** — Supabase 会话本地持久化并自动刷新；refresh 失效时用凭据文件静默重登。
- **与平台与时俱进** — 内置发现引擎实时抓取线上 SPA，提取当前**全部 API 端点**（本次 323 个）、
  路由和平台配置。平台重新部署后 `uno sync` 一跑即同步，新端点立刻通过 `uno call` / `uno endpoints` 可用。
- **精致的学生命令** + **通用逃生舱** — 常用操作有专门命令；任何端点都能用 `uno call <id>` 或 `uno api <方法> <路径>` 调用。
- **可被 AI 驱动** — 附带 [Agent Skill](skills/unoanalyzer/SKILL.md)，让 LLM 深刻掌握整套端点并代你操作。
- **脚本友好** — 所有命令支持 `--json`；支持 `HTTP(S)_PROXY`。
- 运行时仅一个第三方依赖（`commander`）+ `undici`（代理支持）。

## 安装

需要 Node.js ≥ 20。

```bash
git clone https://github.com/<your-account>/unoanalyzer-cli.git
cd unoanalyzer-cli
npm install
npm run build
npm link          # 之后即可全局使用 `uno`
```

或直接运行：`node dist/index.js <命令>`。

## 首次使用（输入账号密码）

第一次运行任意需要登录的命令，或直接 `uno login`，工具会在
**`~/.unoanalyzer/credentials.json`** 生成一个模板（权限 0600、已被 gitignore）：

```jsonc
{
  "email": "",       // ← 填入你的平台邮箱
  "password": ""     // ← 填入你的平台密码
}
```

填好后再次运行：

```bash
uno login
```

登录成功后会话保存在 `~/.unoanalyzer/session.json` 并自动刷新——**你只需登录这一次**。
（也可改用环境变量 `UNO_EMAIL` / `UNO_PASSWORD`，适合 CI。）

> 🔒 密码只存在你本地文件，仅发送给官方 Supabase 认证端点换取令牌，绝不上传别处。
> 想彻底登出：`uno logout` 并删除 `credentials.json`。

## 常用命令

```bash
uno whoami                       # 当前用户
uno courses                      # 我的课程
uno course show ENT207TC         # 课程总览（周次/作业/里程碑/课时）
uno course assessments ENT207TC  # 作业列表
uno brief ENT207TC               # 本周 AI 简报
uno mentor ENT207TC              # 我的导师
uno group show ENT207TC          # 我的小组
uno group activity ENT207TC      # 小组动态
uno log list ENT207TC            # 周记列表
uno log submit ENT207TC 2 -t "完成桌面调研与问题界定"
uno record list                  # 我的能力证据记录
uno record create -t "用户访谈" --course ENT207TC
uno record proof <id> --file ./photo.jpg
uno capability list --course ENT207TC
uno narrative show               # 能力叙事
uno chat ask ENT207TC "怎么界定我的问题？"
uno proposal requirements ENT207TC
```

课程可用**代码**（`ENT207TC`）或 **id**（`ent207tc_2026`）指定；“我的小组”会自动识别。
任何命令加 `--json` 得到机器可读输出。

## 自更新（核心能力）

```bash
uno sync                 # 重新发现整套 API，更新本地命令集
uno status               # 查看端点数量、平台构建号、会话状态
uno endpoints            # 浏览全部端点（策展 + 自动发现）
uno endpoints groups     # 按关键词过滤
uno describe course.detail
```

开启自动同步后（默认），工具在平台构建变化时会自动刷新本地目录（有频率限制、失败不阻塞）。

## 通用调用（任意端点，含未来新增）

```bash
uno call course.detail ent207tc_2026
uno call records.create -d '{"title":"Demo","date":"2026-09-20"}'
uno call weeklyLog.list ent207tc_2026 <groupId>
uno api GET /api/cn/me
uno api POST /api/cn/records -d '{"title":"X","date":"2026-09-20"}'
```

## 文件与配置

| 路径 | 用途 |
|------|------|
| `~/.unoanalyzer/credentials.json` | 你填写的邮箱/密码（0600，gitignore） |
| `~/.unoanalyzer/session.json` | 自动管理的会话令牌 |
| `~/.unoanalyzer/manifest.json` | 自动发现的端点目录 |
| `~/.unoanalyzer/config.json` | 平台配置（可被 `uno sync` 更新） |

环境变量：`UNO_HOME`（配置目录）、`UNO_EMAIL`/`UNO_PASSWORD`、`UNO_DEBUG=1`（打印 HTTP 细节）、
`UNO_BACKEND_URL`/`UNO_APP_URL`（指向测试环境）、`HTTP(S)_PROXY`。

## 文档 & Agent Skill

- 人类可读 API 文档：[`API.md`](API.md)
- 完整端点目录快照：[`skills/unoanalyzer/references/endpoints.md`](skills/unoanalyzer/references/endpoints.md)
- Agent Skill（供 Claude 等 LLM 使用）：[`skills/unoanalyzer/SKILL.md`](skills/unoanalyzer/SKILL.md)

### 安装 Agent Skill（Claude Code）

```bash
cp -r skills/unoanalyzer ~/.claude/skills/unoanalyzer
```

之后向 Claude Code 说“帮我看看 ENT207TC 本周要做什么”“提交我的周记”等，它会自动调用 `uno`。

## 开发

```bash
npm run dev -- <命令>    # 免编译直接跑 TS（node --experimental-strip-types）
npm run build            # 编译到 dist/
```

## 说明与边界

- 本工具通过平台自身的公开前端接口工作，使用你自己的账号；请遵守平台条款，仅访问你有权访问的数据。
- 部分端点为教师/助教/导师专用，学生账号会收到 `403`——属正常。
- 自动发现的端点为尽力而为解析，策展端点（`[C]`）经过人工核对，为权威。

## License

[MIT](LICENSE)
