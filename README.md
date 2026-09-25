# Agent Harness：从零到持续学习科研

> 目标：用 28 天、每天约 90 分钟，从理解 agent harness 的组成与边界，走到能够实现最小 harness、设计可靠评测，并提出一个可复现的持续学习或自进化 harness 研究问题。
>
> 本路线按 2026-09-25 可获得的资料编写。论文结论只代表各自的实验设置；复现时以原文、代码和最新勘误为准。

## 先建立一个准确的心智模型

**Agent** 是根据目标选择下一步行动的系统。**Harness** 是支撑它运行的外部机制：模型调用循环、工具路由、运行环境、状态与记忆、上下文管理、权限、终止条件、日志和评测接口。模型权重、harness 配置、任务环境和评测器应当分开记录，才能判断性能变化究竟来自哪里。

课程主线是：看懂循环 → 用模拟模型亲手实现 → 加可靠性机制 → 建立评测 → 研究如何从反馈中修改 harness。复杂度逐步增加，最后一周只做一个小规模、可解释的实验，不追求堆叠框架。

## 学习路线总览

| 阶段 | 天数 | 主题 | 里程碑 |
| --- | --- | --- | --- |
| 0 | 第 1–4 天 | [概念与系统边界](plan/stage0-概念与边界.md) | 画出模型、harness、环境、评测器的关系 |
| 1 | 第 5–8 天 | [Python 与可控任务环境](plan/stage1-python与任务环境.md) | 用标准库实现受控工具和任务样例 |
| 2 | 第 9–12 天 | [最小 Agent 循环](plan/stage2-最小agent循环.md) | 跑通可停止、可回放的工具调用循环 |
| 3 | 第 13–16 天 | [可靠性与长期运行](plan/stage3-可靠性与长期运行.md) | 加入权限、状态、恢复和上下文交接 |
| 4 | 第 17–20 天 | [评测与实验方法](plan/stage4-评测与实验方法.md) | 建立固定任务集、指标和消融实验 |
| 5 | 第 21–24 天 | [持续学习与自进化](plan/stage5-持续学习与自进化.md) | 实现受约束的 harness 更新循环 |
| 6 | 第 25–28 天 | [科研选题与小型复现](plan/stage6-科研选题与复现.md) | 交付研究问题、对照实验和复现报告 |

每个阶段 4 个任务，每天约 20 分钟阅读、55 分钟动手、15 分钟记录或自测。若 Python 已熟悉，可将第 1 阶段压缩，留出时间阅读论文。若编码吃力，可延长到 5–6 周，保持任务顺序即可。

## 在线访问

| 入口 | 地址 |
| --- | --- |
| 📖 学习页 | [amn765.github.io/agent-harness-study](https://amn765.github.io/agent-harness-study/) |
| 📊 进度面板 | [amn765.github.io/agent-harness-study/tracker](https://amn765.github.io/agent-harness-study/tracker/) |
| 💻 源码仓库 | [github.com/amn765/agent-harness-study](https://github.com/amn765/agent-harness-study) |

## 如何使用

1. 在线打开学习页与进度面板。勾选任务、每日打卡、查看热力图；进度保存在当前浏览器的 `localStorage`。
2. 同一浏览器、同一网站来源下，学习页和面板共享勾选状态。换设备或浏览器前，在面板导出 JSON 并在新设备导入。之前本地 `file://` 或 `http://localhost:8000` 中的进度不会自动迁移到线上站点。
3. 若离线阅读，可直接打开 `plan/` 中的 Markdown 文件。若要在本地使用[学习页](index.html)，请在本目录运行 `python -m http.server 8000`，再访问 `http://localhost:8000/`；直接双击 `index.html` 通常无法加载 Markdown。
4. 每天留下一个小产物：概念图、脚本、日志、实验表或研究笔记。任务完成标准写在各阶段文档中。

## 第一轮最终产物

- 一个不依赖外部框架的 `toy_harness.py`，能按结构化动作调用受控工具、记录轨迹、达到预算后停止，并能从检查点恢复。
- 一组冻结的测试任务与一个 `evaluate.py`，输出成功率、步骤数、成本代理、旧任务保持率和新任务适应率。
- 一项只修改一种 harness 组件的受约束实验，以及一份说明失败案例、威胁和下一步的研究备忘录。

练习代码由你在学习过程中亲手创建；网站本身是零依赖静态文件，不预先替你生成实验结果。

## 核心资料与阅读顺序

| 层次 | 一手资料 | 建议关注点 |
| --- | --- | --- |
| 入门 | [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)；[ReAct 论文](https://arxiv.org/abs/2210.03629) | 工作流与 agent、行动与观察循环 |
| Harness 工程 | [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)；[Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | 环境、反馈、交接与长期任务 |
| 评测 | [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 任务、评分器、轨迹与失败分析 |
| 反馈学习 | [Reflexion](https://arxiv.org/abs/2303.11366)；[Continual Harness](https://arxiv.org/abs/2605.09998) | 反思记忆、在线修改 harness |
| 研究前沿 | [EVOHARNESSBENCH](https://arxiv.org/abs/2609.04280)；[Do Agent Optimizers Compound?](https://arxiv.org/abs/2607.14004)；[SkillLearnBench](https://arxiv.org/abs/2604.20087) | harness 演化、遗忘、迁移与回归控制 |

## 研究边界

“持续学习”可以指改模型权重、改长期记忆、改技能或改 harness。第一轮只研究**冻结模型后，harness 如何根据轨迹和外部反馈更新**；这让因果归因更清楚。第 6 阶段再讨论与模型参数更新的联系。实验必须保留未参与优化的旧任务和新任务，并记录每轮改变、成本与失败案例，避免仅在训练样例上自我感觉变好。
