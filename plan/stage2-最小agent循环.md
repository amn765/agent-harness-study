# 阶段 2 · 最小 Agent 循环（第 9–12 天）

> 目标：用模拟模型跑通“选择动作—校验—执行—观察—停止”的完整循环，并能准确区分模型逻辑和 harness 逻辑。

主线资料：[ReAct](https://arxiv.org/abs/2210.03629)、[Writing effective tools for AI agents](https://www.anthropic.com/engineering/writing-tools-for-agents)。阅读论文摘要、方法图与一个实例即可；此处不要求复现论文分数。

## 核心概念

模拟模型是一个确定性函数：给定目标和历史，就返回下一步动作。它不是语言模型，但能让你先检验循环、工具路由和终止逻辑。日后接真实模型时，替换这个函数即可；实验时应固定模型版本与参数。

## 任务清单

### ☐ 2-1 实现结构化动作协议

- 约定 `lookup`、`list_keys`、`finish` 三种动作。`finish` 必须提供 `answer`；工具动作必须提供对应参数。写 `validate_action(action)`，对未知名字、缺参数和错误类型返回明确错误。
- 给第 1 阶段的工具加简短描述：名称、输入、输出、失败条件。测试是否能从描述推断正确调用。
- 思考题：工具描述有歧义时，错误应归因于模型还是 harness？
- **完成标志**：至少 4 个有效或无效动作都得到预期校验结果。

### ☐ 2-2 写可替换的模拟策略

- 写 `mock_model(goal, history)`：对于“查 alpha”先返回 `lookup`，在看到观察结果后返回 `finish`。不要让模拟策略直接读取知识库，它只能读取传入的目标和历史。
- 把两个不同策略写成两个函数，例如一个先列键、一个直接查键，观察轨迹区别。
- 自测：若模型私自读取任务答案，是否还在测 harness？
- **完成标志**：同一任务可用两个策略运行，且轨迹显示不同的动作顺序。

### ☐ 2-3 ⭐ 运行有预算的 agent 循环

- 在 `run(goal, model_fn, max_steps=5)` 中重复：请求动作、校验、执行、记录观察。遇到 `finish` 或预算耗尽就返回含状态的结果。示意骨架如下：

```python
for step in range(max_steps):
    action = model_fn(goal, history)
    error = validate_action(action)
    if error:
        return {"status": "invalid_action", "error": error, "history": history}
    if action["tool"] == "finish":
        return {"status": "finished", "answer": action["args"]["answer"], "history": history}
    observation = dispatch(action)
    history.append({"action": action, "observation": observation})
return {"status": "budget_exhausted", "history": history}
```

- 思考题：`finished` 与“答案正确”为什么是两回事？
- **完成标志**：成功、非法动作、预算耗尽三条路径都能跑通并写入轨迹。

### ☐ 2-4 做第一次端到端回放

- 在 6 个固定任务上运行模拟策略；保存任务输入、动作轨迹、最终状态。写一个小脚本按轨迹重放工具结果，发现不一致就报告步骤号。
- 将第 0 阶段的系统图与代码对应起来，标记哪些函数属于 harness，哪些代表模型或环境。
- **完成标志**：可以用一条轨迹重现结果，并解释一次失败到底发生在哪一层。

## 阶段里程碑

一个无需 API 密钥的最小 harness 已经可运行、可停止、可回放；你能说明未来接入真实模型只需替换哪一层。
