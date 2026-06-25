# Blaze Skate Training V1.5 Helper Utilities Centralization Plan

## Executive Summary

在继续抽取 `GoalsView`、`PlansView` 或 Dashboard 分区之前，先统一 helper 语义是更稳妥的顺序。当前只读功能已经开始从 `src/App.jsx` 外提，但多个核心计算规则仍然分散在 `src/App.jsx`、`src/features/trainingV1/plans.js`、`src/features/trainingV1/dashboardMetrics.js`、`src/features/trainingV1/goals.js`、`src/features/trainingV1/weeklyReport.js` 中。

如果现在直接继续拆视图，而不先统一工具语义，会把相同规则复制到更多文件里，后续会出现三个问题：

1. 一个语义多处实现，后续修复时容易漏改。
2. 视图抽取后会放大循环依赖风险，尤其是计划任务匹配、周范围计算、PB 映射。
3. 很难证明“只是重构，没有改行为”，因为行为边界没有被先锁定。

因此，建议先做一轮低风险的工具集中化，再进入更大的视图拆分。

## Current Duplication Areas

### 1. Date string handling

当前至少存在多处 `YYYY-MM-DD` 本地日期字符串拼装/推进逻辑：

- `src/App.jsx`
  - `getWeekStartDateString(...)`
- `src/features/trainingV1/plans.js`
  - `toDateString(...)`
  - `addDays(...)`
- `src/features/trainingV1/dashboardMetrics.js`
  - `toDateString(...)`
  - `addDays(...)`
  - `getWeekDateRange(...)`
- `src/features/trainingV1/weeklyReport.js`
  - `toDateString(...)`
  - `addDays(...)`

问题：

- 同一日期格式规则在多个文件重复实现。
- 某些实现带输入保护，某些没有。
- 后续若抽 Dashboard / Weekly Report / Plans 视图，会继续扩散。

### 2. Current week range calculation

当前“本周起始日 / 7 天范围”逻辑分散：

- `src/App.jsx`
  - `getWeekStartDateString(...)`
- `src/features/trainingV1/dashboardMetrics.js`
  - `getWeekDateRange(...)`
- `src/features/trainingV1/weeklyReport.js`
  - 周结束日通过本地 `addDays(...)` 计算

问题：

- “周起点”与“周范围”不是同一个统一入口。
- Weekly report、adherence、dashboard summary 未来可能各自继续复制。

### 3. Task matching by normalized text + target

当前计划任务和 Daily Tasks 的匹配语义已基本固定，但仍有分散：

- `src/features/trainingV1/plans.js`
  - `normalizeTaskText(...)`
  - `isPlanTaskAddedToToday(...)`
  - `getPlanTaskTodayStatus(...)`
  - `getPlanTaskDailyStatus(...)`
- `src/features/trainingV1/dashboardMetrics.js`
  - 本地 `getTaskMatchKey(...)`
  - `getDailyTasksMatchedToPlanTasks(...)`

问题：

- `normalizeTaskText` 已在 `plans.js`，但 match key 规则又在 `dashboardMetrics.js` 本地拼接。
- 一旦后续再抽 Plan cards、Dashboard execution、Weekly adherence widgets，这个语义很容易复制第三次。

### 4. Plan task matching daily tasks

当前“计划任务是否已加入今日任务”和“Daily Tasks 中哪些项来自计划”的计算在两个文件分别维护：

- `src/features/trainingV1/plans.js`
  - 面向单个 plan task 的匹配
- `src/features/trainingV1/dashboardMetrics.js`
  - 面向 dailyTasks + whole plan 的批量匹配

问题：

- 单任务匹配和批量匹配没有统一基础 helper。
- 去重 key 与匹配 key 目前依赖隐式一致，不是显式共享。

### 5. PB record distance normalization

PB 距离规范化目前集中在 `src/features/trainingV1/goals.js`，但 `src/App.jsx` 仍保留旧式 key 映射入口：

- `src/features/trainingV1/goals.js`
  - `normalizeGoalDistance(...)`
  - `getRecordsKeyForDistance(...)`
  - `getRecordHistoryForDistance(...)`
  - `getBestRecordForDistance(...)`
- `src/App.jsx`
  - `getRecordsKey(...)`

问题：

- 目标模块已经有较完整的距离归一化逻辑。
- `App.jsx` 仍保留旧入口，后续如果继续拆 Goals/Data/PB 视图，会继续形成双源。

### 6. Record array key mapping

当前 record key mapping 也存在重复来源：

- `src/App.jsx`
  - `getRecordsKey(...)`
- `src/features/trainingV1/goals.js`
  - `getRecordsKeyForDistance(...)`
  - `getRecordKeysForDistance(...)`

问题：

- `goals.js` 支持更完整的回退逻辑与标准化。
- `App.jsx` 的旧 key mapping 仍在直接驱动 PB 相关 UI 读路径。

### 7. Seconds / time formatting

当前秒数格式化至少有两层语义：

- `src/App.jsx`
  - `formatSeconds(...)`
  - `formatGoalSeconds(...)`
  - `formatSignedGoalSeconds(...)`
- `src/features/goals/GoalDetailModal.jsx`
  - 通过 props 消费 `formatGoalSeconds` / `formatSignedGoalSeconds`
- `src/features/weeklyReport/WeeklyReportModal.jsx`
  - 通过 props 消费同一组格式化函数

问题：

- 语义本身还在 `App.jsx`。
- 新抽出的只读组件已经依赖这些格式化函数，说明它们已经具备被集中化的价值。

### 8. Percent / gap formatting

当前 progress、gap、improvement 的展示规则分散在：

- `src/App.jsx`
  - `getGoalTrendSummaryText(...)`
  - 进度、gap、improvement 的 UI 组装
- `src/features/trainingV1/goals.js`
  - `getGoalProgress(...)`
  - `getGoalGap(...)`
  - `getGoalProgressWithPB(...)`
  - `getGoalGapWithPB(...)`
- `src/features/trainingV1/dashboardMetrics.js`
  - 多处百分比计算
- `src/features/trainingV1/weeklyReport.js`
  - completionPercent 聚合

问题：

- 核心数值计算已部分模块化。
- 展示格式和文本摘要仍混在 `App.jsx` 中。
- 后续拆分 Goals / Dashboard 视图前，建议先锁住格式语义。

## Proposed Utility Structure

建议先建立一个明确的工具目录，但本步骤只做规划，不创建这些文件。

建议结构：

```text
src/features/trainingV1/utils/dateUtils.js
src/features/trainingV1/utils/taskMatchUtils.js
src/features/trainingV1/utils/recordUtils.js
src/features/trainingV1/utils/formatUtils.js
src/features/trainingV1/utils/index.js
```

### `dateUtils.js`

建议承载：

- `toDateString(date)`
- `addDays(dateString, daysToAdd)`
- `getWeekStartDateString(date)`
- `getWeekDateRange(startDateString)`

原则：

- 全部使用本地 `YYYY-MM-DD` 字符串语义。
- 不引入外部日期库。
- 只做纯函数，不依赖 React 或 Firebase。

### `taskMatchUtils.js`

建议承载：

- `normalizeTaskText(value)`
- `getTaskMatchKey(task)`
- `isTaskMatch(taskA, taskB)`
- `isPlanTaskAddedToToday(planTask, dailyTasks)`
- `getPlanTaskDailyStatus(planTask, dayDateString, dailyTasks, todayString)`
- `getDailyTasksMatchedToPlanTasks(dailyTasks, plan)`

原则：

- 保持当前“normalized text + normalized target”语义不变。
- 去重 key 与匹配 key 使用同一入口。

### `recordUtils.js`

建议承载：

- `normalizeGoalDistance(value)`
- `getRecordsKeyForDistance(distance)`
- `getRecordKeysForDistance(distance)`
- `getBestRecordForDistance(data, distance)`
- `getRecordHistoryForDistance(data, distance)`

原则：

- 统一 PB 距离标准化与 records key mapping。
- `App.jsx` 后续不应继续保留单独 `getRecordsKey(...)`。

### `formatUtils.js`

建议承载：

- `formatSeconds(value)`
- `formatGoalSeconds(value)`
- `formatSignedGoalSeconds(value)`
- `formatPercent(value)`
- 可能的 `formatGoalTrendSummary(...)`

原则：

- 只做展示层纯格式化。
- 不掺杂 Firestore、状态更新或业务副作用。

### `index.js`

建议作为统一导出入口，降低未来 `App.jsx` 和 feature 文件的 import 噪音。

## Migration Order

不建议一次性抽所有 helper。推荐分阶段。

### Phase 1

优先抽：

- `taskMatchUtils`
- `dateUtils`

理由：

- 当前重复最明显。
- 影响范围大，但仍属于纯只读语义。
- 能直接降低后续 Plans / Dashboard / Weekly Report 抽取风险。

### Phase 2

再抽：

- `recordUtils`
- `formatUtils`

理由：

- PB 记录映射已在 `goals.js` 比较成型，适合在第二阶段统一。
- 格式化函数已经被多个抽取组件消费，第二阶段收口最自然。

### Phase 3

更新下列现有模块，改为消费 centralized utilities：

- `src/features/trainingV1/goals.js`
- `src/features/trainingV1/plans.js`
- `src/features/trainingV1/dashboardMetrics.js`
- `src/features/trainingV1/weeklyReport.js`
- `src/App.jsx`

目标：

- 让 feature helpers 自身也改为共享底层工具，而不是各自再维护私有实现。

### Phase 4

在未来引入测试框架后，增加：

- helper smoke tests
- 或正式 unit tests

本阶段不要求现在补测试框架。

## Risk Classification

### Low risk

- 纯 date helpers
- 纯 formatting helpers

特征：

- 无写路径
- 无 Firestore 依赖
- 无状态更新
- 容易通过 lint/build + 手工 smoke 检查验证

### Medium risk

- task matching helpers
- record key mapping helpers

特征：

- 虽然仍是只读纯函数，但它们决定了：
  - plan task 去重
  - dashboard execution 统计
  - weekly adherence 统计
  - PB / goal 当前成绩来源

这些语义一旦变化，用户会直接看到行为差异。

### High risk

- 任何触达写路径的 helper 提炼
- 任何触达 XP / streak / Daily Task completion 逻辑的 helper 提炼
- 任何触达 PB add/delete 行为的 helper 提炼

这些内容本轮不应纳入 utilities centralization。

## Semantic Lock Rules

后续所有 code-changing utility PR 必须锁住以下语义，不允许变更：

1. `normalized text + normalized target` 匹配规则必须保持向后兼容。
2. 文本匹配继续使用 `trim + lowercase`。
3. `null / undefined target` 继续按空字符串处理。
4. Speed skating 语义保持 `lower time is better`。
5. `gap = timeSeconds - targetTimeSeconds`。
6. `achieved = timeSeconds <= targetTimeSeconds`。
7. Daily task completion 必须继续独立于 plan task completion。
8. 当前 `Daily Tasks` 仍然是 today execution list，不是历史周任务列表。
9. Weekly report 保持只读。
10. PB records 在 Goals / Dashboard / Weekly Report 中保持只读。
11. Weekly adherence 继续为 client-side computed only。
12. `goal.currentTimeSeconds` 仍然只是 manual fallback，不得被 PB 自动覆盖写回。

## Validation Strategy

未来任何真正改代码的 centralization PR，至少要求：

- `npm run lint`
- `npm run build`

另外建议加 helper smoke checks，验证：

- task matching dedupe
- week date range
- PB distance mapping
- goal gap calculation
- weekly adherence calculation
- weekly report aggregation

如果未来引入测试框架，再把这些 smoke checks 落成正式 unit tests。

## Recommended First Code-Changing PR

建议下一步实际代码变更 PR 为：

**V1.5 Step 6: Extract `taskMatchUtils` and `dateUtils` only**

理由：

- 这是当前最重复、最影响后续视图抽取、但仍然可控的两个语义面。
- 它们能直接为后续 GoalsView / PlansView / Dashboard 分块抽取清理底层依赖。
- 不建议一次性抽 `recordUtils + formatUtils + taskMatchUtils + dateUtils`，范围过大，不利于验证“纯重构、无行为变化”。

## Explicit Non-Changes

本规划步骤明确不做以下改动：

- 不修改任何 source code
- 不新增 helper 文件
- 不移动现有 helper
- 不改 app behavior
- 不改 Firestore schema
- 不新增 subcollections
- 不做数据迁移
- 不加 React Router
- 不加 TypeScript
- 不加 dependencies
- 不加任何 product features

## Validation

本规划步骤的验证仅包括：

- `npm run lint`
- `npm run build`

不包含 typecheck，因为当前仓库没有 `npm run typecheck`。
