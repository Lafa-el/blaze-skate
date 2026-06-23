import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Home, 
  ListTodo, 
  ShoppingCart, 
  LineChart, 
  Target,
  Archive,
  Flame, 
  Trophy, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle,
  User,
  Zap,
  Globe,
  Loader2,
  Trash2,
  Edit2,
  X,
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Palette,
  Dumbbell,
  ArrowLeft,
  Check,
  Camera,
  Unlock,
  ShieldCheck,
  Clock,
  Quote,
  Sparkles,
  Info,
  Crown,
  Cloud,
  Mail,
  Smartphone,
  UserCircle,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  LockKeyhole
} from 'lucide-react';
import { signInAnonymously, onAuthStateChanged, EmailAuthProvider, linkWithCredential, signOut, signInWithEmailAndPassword } from 'firebase/auth';

import { DEFAULT_LANGUAGE, DEFAULT_THEME, TABS } from './constants/app';
import { auth, db } from './firebase/firebaseApp';
import { initializeFirestorePersistence } from './firebase/firestore';
import { saveProfilePatch, subscribeToProfile } from './services/profileRepository';
import {
  archiveCompetitionGoal,
  createCompetitionGoal,
  getActiveCompetitionGoals,
  getGoalGap,
  getGoalProgress,
  sortGoalsByPriorityAndDate,
  updateCompetitionGoal,
} from './features/trainingV1/goals.js';
import {
  archiveTrainingPlan,
  completePlanTask,
  convertPlanTaskToDailyTask,
  createPlanTask,
  createTrainingPlan,
  getActiveTrainingPlan,
  getActiveTrainingPlans,
  getWeeklyPlanCompletion,
  updatePlanTask,
  updateTrainingPlan,
} from './features/trainingV1/plans.js';

initializeFirestorePersistence();

// --- 主题配置 ---
const THEMES = {
  purple: { id: 'purple', name: '薰衣草紫', enName: 'Lavender', appBg: 'bg-[#f8f7ff]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-purple-100', inputBg: 'bg-purple-50 border-purple-100 text-gray-800 focus:ring-purple-400', textPrimary: 'text-purple-600', textHeading: 'text-purple-900', textMuted: 'text-gray-500', btnPrimary: 'bg-purple-600 hover:bg-purple-500 text-white', btnCancel: 'bg-purple-100 text-purple-700 hover:bg-purple-200', gradientCard: 'from-purple-500 to-indigo-600 text-white', gradientIcon: 'from-purple-400 to-purple-600', navActive: 'text-purple-600 bg-purple-50', navHover: 'text-gray-400 hover:text-purple-500 hover:bg-purple-50/50', checkActive: 'text-purple-500', svgLine: '#a855f7', svgGrid: '#e9d5ff', spinner: 'border-purple-200 border-t-purple-600', badgeBg: 'bg-purple-100', borderLight: 'border-purple-100', focusRing: 'focus:ring-purple-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-purple-100' },
  blue: { id: 'blue', name: '破风蓝', enName: 'Aero Blue', appBg: 'bg-[#f0f9ff]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-blue-100', inputBg: 'bg-blue-50 border-blue-100 text-gray-800 focus:ring-blue-400', textPrimary: 'text-blue-600', textHeading: 'text-blue-900', textMuted: 'text-gray-500', btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white', btnCancel: 'bg-blue-100 text-blue-700 hover:bg-blue-200', gradientCard: 'from-blue-500 to-cyan-500 text-white', gradientIcon: 'from-blue-400 to-blue-600', navActive: 'text-blue-600 bg-blue-50', navHover: 'text-gray-400 hover:text-blue-500 hover:bg-blue-50/50', checkActive: 'text-blue-500', svgLine: '#3b82f6', svgGrid: '#dbeafe', spinner: 'border-blue-200 border-t-blue-600', badgeBg: 'bg-blue-100', borderLight: 'border-blue-100', focusRing: 'focus:ring-blue-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-blue-100' },
  green: { id: 'green', name: '极光绿', enName: 'Aurora Green', appBg: 'bg-[#f0fdf4]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-green-100', inputBg: 'bg-green-50 border-green-100 text-gray-800 focus:ring-green-400', textPrimary: 'text-green-600', textHeading: 'text-green-900', textMuted: 'text-gray-500', btnPrimary: 'bg-green-600 hover:bg-green-500 text-white', btnCancel: 'bg-green-100 text-green-700 hover:bg-green-200', gradientCard: 'from-green-500 to-emerald-600 text-white', gradientIcon: 'from-green-400 to-green-600', navActive: 'text-green-600 bg-green-50', navHover: 'text-gray-400 hover:text-green-500 hover:bg-green-50/50', checkActive: 'text-green-500', svgLine: '#22c55e', svgGrid: '#dcfce7', spinner: 'border-green-200 border-t-green-600', badgeBg: 'bg-green-100', borderLight: 'border-green-100', focusRing: 'focus:ring-green-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-green-100' },
  pink: { id: 'pink', name: '樱花粉', enName: 'Sakura Pink', appBg: 'bg-[#fdf2f8]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-pink-100', inputBg: 'bg-pink-50 border-pink-100 text-gray-800 focus:ring-pink-400', textPrimary: 'text-pink-600', textHeading: 'text-pink-900', textMuted: 'text-gray-500', btnPrimary: 'bg-pink-600 hover:bg-pink-500 text-white', btnCancel: 'bg-pink-100 text-pink-700 hover:bg-pink-200', gradientCard: 'from-pink-500 to-rose-500 text-white', gradientIcon: 'from-pink-400 to-pink-600', navActive: 'text-pink-600 bg-pink-50', navHover: 'text-gray-400 hover:text-pink-500 hover:bg-pink-50/50', checkActive: 'text-pink-500', svgLine: '#ec4899', svgGrid: '#fce7f3', spinner: 'border-pink-200 border-t-pink-600', badgeBg: 'bg-pink-100', borderLight: 'border-pink-100', focusRing: 'focus:ring-pink-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-pink-100' },
  orange: { id: 'orange', name: '竞速橙', enName: 'Racing Orange', appBg: 'bg-[#fff7ed]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-orange-100', inputBg: 'bg-orange-50 border-orange-100 text-gray-800 focus:ring-orange-400', textPrimary: 'text-orange-600', textHeading: 'text-orange-900', textMuted: 'text-gray-500', btnPrimary: 'bg-orange-600 hover:bg-orange-500 text-white', btnCancel: 'bg-orange-100 text-orange-700 hover:bg-orange-200', gradientCard: 'from-orange-500 to-red-500 text-white', gradientIcon: 'from-orange-400 to-orange-600', navActive: 'text-orange-600 bg-orange-50', navHover: 'text-gray-400 hover:text-orange-500 hover:bg-orange-50/50', checkActive: 'text-orange-500', svgLine: '#f97316', svgGrid: '#ffedd5', spinner: 'border-orange-200 border-t-orange-600', badgeBg: 'bg-orange-100', borderLight: 'border-orange-100', focusRing: 'focus:ring-orange-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-orange-100' },
  gray: { id: 'gray', name: '钛金灰', enName: 'Titanium Gray', appBg: 'bg-[#f8fafc]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-slate-200', inputBg: 'bg-slate-50 border-slate-200 text-gray-800 focus:ring-slate-400', textPrimary: 'text-slate-600', textHeading: 'text-slate-900', textMuted: 'text-gray-500', btnPrimary: 'bg-slate-700 hover:bg-slate-600 text-white', btnCancel: 'bg-slate-200 text-slate-700 hover:bg-slate-300', gradientCard: 'from-slate-500 to-zinc-600 text-white', gradientIcon: 'from-slate-400 to-slate-600', navActive: 'text-slate-700 bg-slate-100', navHover: 'text-gray-400 hover:text-slate-600 hover:bg-slate-50/50', checkActive: 'text-slate-600', svgLine: '#475569', svgGrid: '#e2e8f0', spinner: 'border-slate-200 border-t-slate-600', badgeBg: 'bg-slate-200', borderLight: 'border-slate-200', focusRing: 'focus:ring-slate-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-slate-100' },
  white: { id: 'white', name: '纯粹白', enName: 'Pure White', appBg: 'bg-[#f3f4f6]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white', cardBg: 'bg-white border-gray-200 shadow-sm', inputBg: 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-400', textPrimary: 'text-gray-800', textHeading: 'text-black', textMuted: 'text-gray-500', btnPrimary: 'bg-black hover:bg-gray-800 text-white', btnCancel: 'bg-gray-100 text-gray-700 hover:bg-gray-200', gradientCard: 'from-gray-700 to-gray-900 text-white', gradientIcon: 'from-gray-400 to-gray-600', navActive: 'text-black bg-gray-100', navHover: 'text-gray-400 hover:text-black hover:bg-gray-50', checkActive: 'text-black', svgLine: '#1f2937', svgGrid: '#e5e7eb', spinner: 'border-gray-200 border-t-black', badgeBg: 'bg-gray-200', borderLight: 'border-gray-200', focusRing: 'focus:ring-gray-400', badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700', calEmpty: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
  black: { id: 'black', name: '暗夜黑', enName: 'Stealth Black', appBg: 'bg-[#020617]', appText: 'text-slate-300', headerBg: 'bg-slate-900/90 border-b-slate-800', navBg: 'bg-slate-900 border-t-slate-800', cardBg: 'bg-slate-800 border-slate-700 shadow-sm', inputBg: 'bg-slate-900 border-slate-700 text-white focus:ring-slate-500', textPrimary: 'text-slate-100', textHeading: 'text-white', textMuted: 'text-slate-500', btnPrimary: 'bg-white hover:bg-slate-200 text-slate-900', btnCancel: 'bg-slate-700 text-slate-300 hover:bg-slate-600', gradientCard: 'from-slate-700 to-slate-900 text-white border border-slate-700', gradientIcon: 'from-slate-500 to-slate-700', navActive: 'text-white bg-slate-800', navHover: 'text-slate-500 hover:text-white hover:bg-slate-800/50', checkActive: 'text-slate-300', svgLine: '#cbd5e1', svgGrid: '#334155', spinner: 'border-slate-700 border-t-slate-200', badgeBg: 'bg-slate-700', borderLight: 'border-slate-700', focusRing: 'focus:ring-slate-500', badgeOrange: 'bg-orange-900/30 border-orange-900/50 text-orange-400', badgeYellow: 'bg-yellow-900/30 border-yellow-900/50 text-yellow-400', calEmpty: 'bg-slate-800 text-slate-400 hover:bg-slate-700' }
};

const FREE_THEMES = ['purple', 'blue', 'white'];

// --- 💎 独家青训体系数据 (BLAZE ACADEMY) 完整提取版 ---
const BLAZE_ACADEMY = {
  zh: [
    {
      id: 'age4_6',
      title: '启蒙阶段',
      age: '4-6岁',
      target: '以游戏化训练为核心，建立运动兴趣与基础协调能力。每次训练30-45分钟，每周2-3次，重在参与感与动作习惯养成，绝不以竞技成绩为导向。',
      duration: '30-45 分钟',
      frequency: '每周 2-3 次',
      core: '游戏化、互动性',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'text-amber-500',
      modules: [
        {
          name: '一、 基础平衡与体态感知训练',
          items: [
            { name: '单脚站立游戏', target: '左右脚各10秒', tag: '平衡 协调', desc: '闭眼/睁眼单脚站立，从3秒逐步延长至10秒。可用“金鸡独立比赛”形式激发兴趣。要求站立腿微屈（约15°），上身直立，双臂自然展开维持平衡。' },
            { name: '平衡垫/泡沫垫站立', target: '3组 x 15秒', tag: '本体感觉 踝关节', desc: '在不稳定平面上站立，激活踝关节本体感觉。可从双脚开始，过渡到单脚，最后加入手臂动作（如拍球、接球）增加干扰难度。' },
            { name: '走平衡木 / 地板胶带线行走', target: '2-3趟', tag: '平衡 姿态控制', desc: '沿直线、曲线、之字形路线行走，双臂平展。进阶：倒退走、横向走、头顶放沙袋走。培养身体中线意识与腰背控制能力。' },
            { name: '俯卧撑位平板支撑 (改良版)', target: '2-3组 x 10-15秒', tag: '核心', desc: '以膝盖着地的改良平板支撑为主，保持头-脊-臀成一直线，维持10-15秒。目的在于激活核心肌群意识，而非追求时长。' }
          ]
        },
        {
          name: '二、 速滑基础体位模仿训练',
          items: [
            { name: '“鸭子步”低姿走', target: '10-15米 x 3趟', tag: '技术模仿 体位感知', desc: '双脚外八字，膝盖弯曲约90°，上身前倾约45°，双手背后或扶膝，模拟速滑预备体位。要求重心稳定不起伏，距离10-15米往返。这是速滑陆地训练最核心的基础动作。' },
            { name: '原地速滑摆臂练习', target: '3组 x 10次', tag: '摆臂 协调', desc: '站立位，模仿速滑摆臂动作：单臂前后钟摆摆动（短道速滑）或双臂后摆动作（大道速滑）。要求肘关节微屈，摆臂幅度配合节奏，理解“力从摆臂传导至腿部”的发力链概念。' },
            { name: '原地连贯提臀练习', target: '3组 x 10次', tag: '冰感 协调', desc: '站立位，单腿或双脚交替体验冰面收腿动作（或大腿后摆），要求髋关节收紧，手臂配合节奏。理解“力从蹬地传导至腿部”的发力链概念。' },
            { name: '侧滑步基础 (横向移动)', target: '每侧5-8步', tag: '蹬地方向 技术模仿', desc: '双脚与肩同宽，低姿（膝屈约60°），以侧向蹬地步伐横向移动，模拟速滑弯道内侧蹬冰动作。每次5-8步换方向。强调蹬腿方向（侧向而后方）和重心转移。' },
            { name: '蹲位保持 (静态速滑位)', target: '2-3组 x 20-30秒', tag: '静态力量 速滑体位', desc: '贴墙静蹲，大腿平行地面，膝盖不超过脚尖，躯干前倾。初始目标10-20秒，逐渐增加到30秒。配合教练口令，帮助儿童建立速滑低姿位的肌肉记忆。' }
          ]
        },
        {
          name: '三、 全身协调与灵敏游戏',
          items: [
            { name: '梯格游戏 (速度梯)', target: '3-4趟', tag: '敏捷 步频', desc: '使用敏捷梯，进行双脚跳入跳出、单脚交替、侧向进出等基础步伐练习。强调脚步轻盈不拖拉，节奏感是核心。从慢到快，不计时间求动作干净。' },
            { name: '追逐反应游戏', target: '5-8次', tag: '反应 变向', desc: '教练或家长手持不同颜色卡片，儿童根据颜色指令定向跑动（如红色=向右，蓝色=向左）。训练视觉反应、方向变换与加速能力。全程保持低姿位有奖励加分。' },
            { name: '跳房子 (多样化版)', target: '3-5分钟', tag: '跳跃 协调', desc: '传统跳房子游戏变体：加入单脚跳接、双脚并跳、转身跳等元素。发展下肢爆发力基础、落地缓冲意识和空间感知能力。' },
            { name: '动物爬行模仿', target: '3-5趟', tag: '核心稳定 全身协调', desc: '熊爬（四肢同侧交替）、螃蟹爬（侧向横移移动）、毛毛虫蠕动（俯撑前行）等，建立上下肢分离控制能力和躯干稳定性，趣味性强且极为有效。' }
          ]
        },
        {
          name: '四、 柔韧性与关节灵活性训练',
          items: [
            { name: '髋关节环绕与蝴蝶展翅', target: '20-30秒', tag: '髋部 柔韧', desc: '坐位蝴蝶式，双脚底相对，双手按压膝盖轻柔向下，维持20-30秒。站位髋关节环绕（顺、逆各10圈）。速滑髋部灵活性极为关键，越早培养越好。' },
            { name: '踝关节灵活性练习', target: '2-3组', tag: '踝关节 灵活性', desc: '坐位踝关节绕环（顺逆各10次），站位踝关节背屈拉伸（脚尖顶墙弓步），深蹲踝关节活动度感知。踝关节是速滑蹬冰的末端发力点，需特别重视。' },
            { name: '儿童瑜伽体式 (游戏化)', target: '每个10-15秒', tag: '全身拉伸 脊柱', desc: '以“猫牛式”（脊柱灵活）、“下犬式”（后链拉伸）、“勇士一式”（髋屈肌拉伸）等为主。配合动物名称讲解，提高参与兴趣。每个体式维持10-15秒。' }
          ]
        }
      ],
      weeklyPlan: [
        { day: '周二', title: '体态与冰感基础', duration: '35分钟', tasks: ['单脚站立游戏 3组', '“鸭子步”低姿走 3趟', '梯格游戏 (速度梯)', '髋关节环绕与蝴蝶展翅'] },
        { day: '周四', title: '动态平衡与反应', duration: '40分钟', tasks: ['平衡垫站立 3组', '侧滑步基础 每侧5步', '追逐反应游戏 6次', '儿童瑜伽体式'] },
        { day: '周六', title: '综合协调与力量', duration: '45分钟', tasks: ['走胶带线/平衡木', '蹲位保持 (静态速滑)', '动物爬行模仿', '俯卧撑位平板支撑'] }
      ]
    },
    {
      id: 'age7_10',
      title: '进阶阶段',
      age: '7-10岁',
      target: '系统建立速滑专项陆地技术，引入基础力量与爆发力训练。每次60-75分钟，每周3-4次。开始区分短道/大道方向，技术动作规范化是核心。',
      duration: '60-75 分钟',
      frequency: '每周 3-4 次',
      core: '中低强度 + 动作质量优先',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-500',
      modules: [
        {
          name: '一、 速滑专项技术规范化训练',
          items: [
            { name: '速滑基本站位与重心控制', target: '5分钟', tag: '基本站位', desc: '区分大道与短道姿态细节（膝角、上身前倾度）。每日训练前配合镜子进行5分钟体位确认检查。' },
            { name: '靠墙单腿姿势核心控制', target: '3组 x 每侧30秒', tag: '专项耐力 核心', desc: '大腿平行地面，膝角90度，躯干前倾。下侧脚发力，且脚跟贴地，膝盖最大（约100°）。上身要稳，单腿控制感觉要找到。' },
            { name: '陆地侧推步 (连贯技术)', target: '4组 x 每侧15次', tag: '蹬冰技术 单腿平衡', desc: '重心从支撑腿完全平移至另一侧，推冰腿必须完全伸展并在空中停留1秒，收腿要迅速。要求动作连贯，不拖泥带水。' },
            { name: '弯道交叉步模仿', target: '3组 x 10次', tag: '弯道技术 重心转移', desc: '外腿向内发力跨步交叉，右腿在外交叉。注意跨腿时重心向内侧倾斜，模拟入弯感觉。' },
            { name: '摆臂技术专项训练', target: '3组 x 10次', tag: '摆臂节奏', desc: '区分大道（双臂背部交叉/单臂）与短道（单手背，内侧手摆动）摆臂。配合腿部节奏原地练习，强化手臂协调。' },
            { name: '侧蹬抗阻模仿', target: '3组 x 10次', tag: '爆发力 力量', desc: '腰部绑弹力带，一侧固定，另一侧发力侧蹬。注意保持低姿，感受大腿和臀部的发力，核心收紧。' },
            { name: '滑行板 (Slide Board) 训练', target: '4组 x 1分钟', tag: '核心力量 专项耐力', desc: '穿鞋套在滑行板上进行连贯的滑行模拟。头与躯干保持稳定不随腿晃动，从每次滑行（约40次）开始，逐渐增加到1分钟或更多。' }
          ]
        },
        {
          name: '二、 基础力量与核心能力构建',
          items: [
            { name: '徒手深蹲 (体能基础)', target: '4组 x 12次', tag: '腿部力量 发力', desc: '双脚与肩同宽，臀部向后坐，膝盖不超过脚尖。下蹲时吸气，起立时呼气，保持躯干挺直，重心放在脚后跟。' },
            { name: '单腿深蹲 (重组推刃力量)', target: '3组 x 每侧8次', tag: '单侧力量 平衡', desc: '单腿站立，另一条腿前伸，缓慢下蹲。初学者可手扶固定物辅助，下蹲至大腿平行于地面。' },
            { name: '侧向跨跳 (行进间)', target: '3组 x 每侧8次', tag: '侧向爆发', desc: '单腿发力侧向跃起，对侧单腿稳定支撑，停顿1-2秒后再次起跳。模拟推刃与缓冲，距离从0.5米逐渐增至1.5米。' },
            { name: '臀桥 (后侧链激活)', target: '3组 x 15次', tag: '伸髋发力 臀大肌', desc: '仰卧屈膝，脚跟踩地，臀部发力将髋部顶起至大腿与躯干呈一直线。顶峰收缩1秒。' },
            { name: '蛙跳 (爆发力基础)', target: '4组 x 10次', tag: '下肢爆发力 跳跃', desc: '深蹲姿势起跳，双手向前摆动带动身体，落地时注意缓冲，连续跳跃。' },
            { name: '臀肌激活 (弹力带侧走)', target: '3组 x 每侧15步', tag: '臀中肌 激活', desc: '弹力带套于膝盖上方，低姿侧向行走。感受臀中肌发力，这是滑冰推刃力量的极大来源。' },
            { name: '俯卧撑 (静/动态核心)', target: '3组 x 10次', tag: '上肢力量 核心稳定', desc: '双手撑地与肩同宽，身体呈一直线，屈肘下放至胸部贴近地面，然后推起。' }
          ]
        },
        {
          name: '三、 核心与心肺耐力进阶',
          items: [
            { name: '平板支撑变式', target: '3组 x 1分钟', tag: '核心稳定 抗旋转', desc: '包括单腿抬起、单臂前伸等变式，增加核心抗旋转能力。' },
            { name: '死虫式 (Dead Bug)', target: '3组 x 15次', tag: '核心控制 协调', desc: '仰卧，双臂伸直，双腿屈膝90度。对侧手臂和腿同时下放至贴近地面，腰部始终贴地。' },
            { name: '速滑位等长收缩 + 上肢稳定', target: '3组 x 20次摆臂', tag: '专项核心', desc: '保持标准速滑低姿，同时进行单臂前后摆动。核心必须始终紧绷使躯干稳定，不随摆臂晃动。' },
            { name: '登山跑 (Mountain Climber)', target: '4组 x 30秒', tag: '心肺耐力 核心', desc: '俯卧撑姿势，双腿交替提膝向胸部靠拢，保持高步频，核心收紧。' }
          ]
        },
        {
          name: '四、 爆发力与敏捷度提升',
          items: [
            { name: '侧向滑步跳 (Skater Jumps)', target: '4组 x 16次', tag: '侧向爆发 敏捷', desc: '单腿向侧面大幅度跳跃，另一条腿在身后交叉落地。落地时保持平衡。' },
            { name: '敏捷梯进阶', target: '4-6趟', tag: '步频 协调', desc: '引入更复杂的步伐，如交叉步、阿里洗牌步等。' },
            { name: '折返跑 (T字测验/变向跑)', target: '4-6趟', tag: '敏捷变向 加速', desc: '短距离内的全力冲刺与急停变向，模拟赛道突发情况。' }
          ]
        },
        {
          name: '五、 有氧基础与速度耐力训练',
          items: [
            { name: '持续低姿态陆地连滑步', target: '1-2组 x 5-8分钟', tag: '有氧 冰感耐力', desc: '连续横向移动，重心保持低位，专注动作而非速度。心率控制在130-145bpm的有氧区间。' },
            { name: '间歇冲刺 (20米 x 6-8次)', target: '2组', tag: '加速 爆发力', desc: '低姿位起跑，全力冲刺20米，走回原点作为间歇。强调起跑时的蹬地爆发力和前几步的低姿加速。' },
            { name: '变速跑 (节奏感知训练)', target: '4-6圈', tag: '变速 有氧耐力', desc: '田径场直道加速（约80%强度），弯道减速维持低姿位侧滑。训练在不同速度下维持技术动作的能力。' }
          ]
        }
      ],
      weeklyPlan: [
        { day: '周一', title: '专项技术规范', duration: '60分钟', tasks: ['速滑基本站位与重心控制', '陆地侧推步 (连贯技术)', '摆臂技术专项训练', '滑行板训练', '平板支撑变式'] },
        { day: '周二', title: '基础力量与激活', duration: '60分钟', tasks: ['臀肌激活 (弹力带侧走)', '徒手深蹲 (体能基础)', '单腿深蹲 (重组推刃力量)', '臀桥', '俯卧撑'] },
        { day: '周四', title: '爆发力与敏捷', duration: '60分钟', tasks: ['侧向跨跳 (行进间)', '蛙跳 (爆发力基础)', '侧向滑步跳', '敏捷梯进阶', '折返跑'] },
        { day: '周五', title: '专项耐力与核心', duration: '75分钟', tasks: ['持续低姿态陆地连滑步', '速滑位等长收缩 + 上肢稳定', '死虫式 (Dead Bug)', '靠墙单腿姿势控制'] },
        { day: '周六', title: '速度速度与节奏', duration: '75分钟', tasks: ['间歇冲刺 (20米 x 6-8次)', '变速跑 (节奏感知训练)', '弯道交叉步模仿', '侧蹬抗阻模仿'] }
      ]
    },
    {
      id: 'age11_16',
      title: '青少年专项阶段',
      age: '11-16岁',
      target: '全面转向高强度的专项竞技体能体系。最大力量、爆发力、专项无氧耐力全面提升，每次90-120分钟，每周4-6次。以陆地测验成绩对标冰上能力表现。',
      duration: '90-120 分钟',
      frequency: '每周 4-6 次',
      core: '高强度、大负荷',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      iconColor: 'text-rose-500',
      modules: [
        {
          name: '一、 最大力量与绝对力量储备',
          items: [
            { name: '负重深蹲 (杠铃/哑铃)', target: '4-5组 x 6-8次', tag: '最大力量', desc: '使用杠铃进行最大力量储备，注意下蹲深度和核心始终收紧，避免骨盆翻转。' },
            { name: '保加利亚分腿蹲', target: '4组 x 每侧8次', tag: '单腿力量', desc: '极大提升单腿支撑时的稳定性和力量，消除双腿力量不平衡。' },
            { name: '罗马尼亚硬拉 (RDL)', target: '4组 x 8-10次', tag: '后侧链', desc: '强化腘绳肌和臀大肌，提升伸髋爆发力。' },
            { name: '北欧腘绳肌 (Nordic Curl)', target: '3-4组 x 5-8次', tag: '腘绳肌 离心控制', desc: '双人搭档配合，极度控制身体前倾下放，刺激腘绳肌离心力量。这是预防大腿后侧拉伤的最高效动作之一。' },
            { name: '臀推 (杠铃/弹力带)', target: '4组 x 10次', tag: '伸髋爆发', desc: '冰上推进力的核心来源，强调顶峰收缩1-2秒。' },
            { name: '上肢拉力训练 (引体向上/划船)', target: '3组 x 8-10次', tag: '上肢力量', desc: '速滑起跑和冲刺阶段需要强有力的上肢摆臂协同。' }
          ]
        },
        {
          name: '二、 爆发力与增强式训练 (Plyometrics)',
          items: [
            { name: '连续跳箱训练 (Box Jumps)', target: '4组 x 6次', tag: '增强式', desc: '追求极致的起跳速度和高度，落地要求轻盈缓冲。' },
            { name: '深跳 (Drop Jump) + 连续跳', target: '4组 x 6次', tag: '反应时间', desc: '从箱上落下，触地瞬间迅速起跳，训练离心到向心的转化速度。' },
            { name: '壶铃摇摆 (Kettlebell Swing)', target: '4组 x 15次', tag: '核心连贯', desc: '利用伸髋爆发力将壶铃荡起，非手臂发力。' },
            { name: '侧向跳跃 (连贯性单腿)', target: '4组 x 每侧10次', tag: '侧向爆发', desc: '连续的侧向推蹬跳跃，完美模拟冰上连续加速。' },
            { name: '医药球侧向抛掷', target: '4组 x 每侧10次', tag: '核心爆发', desc: '利用核心躯干的旋转爆发力掷出实心球，提升整体发力连贯性。' },
            { name: '敏捷梯/锥桶组合变向 (In-Out-Cut)', target: '4-6组', tag: '变向 敏捷', desc: '结合冰上起跑步法，进行快速的切入与折返跑，强调重心转换、步频和双脚协同。' }
          ]
        },
        {
          name: '三、 专项无氧耐力与心肺负荷',
          items: [
            { name: '滑行板高强度间歇 (HIIT)', target: '8-10组 x 45秒', tag: '无氧耐力', desc: '全力滑行45秒，休息30秒。极大挑战肌肉抗乳酸能力。' },
            { name: '动感单车冲刺 (Sprint Intervals)', target: '10组 x 20秒', tag: '绝对速度', desc: '20秒最大功率极速冲刺，40秒极慢骑恢复。刺激磷酸原系统。' },
            { name: '阻力冲刺 (雪橇拖拽/降落伞)', target: '6-8趟 x 20米', tag: '抗阻爆发', desc: '强迫下肢在疲劳和高阻力状态下维持爆发力和高步频。' },
            { name: '400米/800米田径场冲刺', target: '4-6组', tag: '心肺极限', desc: '无氧糖酵解系统训练，建立冲刺阶段的速度耐力。' }
          ]
        },
        {
          name: '四、 高级核心与静力抗疲劳',
          items: [
            { name: '负重平板支撑 / 健腹轮抗伸展', target: '4组 x 1分钟/10次', tag: '抗伸展', desc: '背部放杠铃片，或使用健腹轮，极致的前侧核心考验。' },
            { name: '抗旋转核心训练 (Pallof Press)', target: '4组 x 12次/侧', tag: '抗旋转 核心', desc: '使用弹力带或龙门架，侧向站立抗拒侧向拉力，保持躯干稳定不扭转。极大地提升弯道抗离心力能力。' },
            { name: '悬垂举腿 / 俄罗斯转体', target: '4组 x 15次', tag: '核心控制', desc: '强化下腹屈髋能力与核心抗旋转能力。' },
            { name: '靠墙静蹲 (负重/单腿/TRX)', target: '3组 x 1.5-2分钟', tag: '专项耐力', desc: '提升速滑低姿态下的肌肉静力耐力和抗乳酸能力。' }
          ]
        },
        {
          name: '五、 放松、恢复与伤病预防',
          items: [
            { name: '筋膜枪与泡沫轴 (深层组织松解)', target: '15-20分钟', tag: '促进循环', desc: '针对股四头肌、腘绳肌、臀大肌进行深层放松。' },
            { name: '静态拉伸 (全面柔韧性)', target: '10-15分钟', tag: '肌肉延展', desc: '保持肌肉弹性，预防关节活动度受限导致的拉伤。' },
            { name: '髋部屈肌深层拉伸 (Couch Stretch)', target: '每侧 45-60秒', tag: '髋关节 柔韧', desc: '针对长期处于低姿态导致的髋部屈肌紧张，进行深度沙发拉伸，极大地缓解下背部压力。' },
            { name: '核心-骨盆控制与激活 (Bird-Dog)', target: '3组 x 每侧10次', tag: '骨盆中立 稳定', desc: '鸟狗式伸展，专注于保持骨盆的中立位和核心深层肌群的激活，防止滑行中塌腰代偿。' },
            { name: '踝关节强化与本体感觉进阶', target: '3组 x 15次', tag: '踝关节 预防崴脚', desc: '单脚站立于平衡垫上进行抛接球或闭眼保持，极大增强踝关节周围微小肌群的力量与稳定性。' },
            { name: '冰浴与冷热交替浴', target: '10分钟', tag: '消除炎症', desc: '大强度训练后加速乳酸代谢和微小炎症恢复。' }
          ]
        }
      ],
      weeklyPlan: [
        { day: '周一', title: '最大力量储备', duration: '90分钟', tasks: ['负重深蹲 (杠铃/哑铃) 5组x6次', '北欧腘绳肌 (Nordic Curl) 4组', '罗马尼亚硬拉 (RDL) 4组', '上肢拉力训练 (引体向上/划船) 3组', '负重平板支撑 / 健腹轮抗伸展 1分钟'] },
        { day: '周二', title: '专项爆发与敏捷', duration: '80分钟', tasks: ['连续跳箱训练 (Box Jumps) 4组x6次', '敏捷梯/锥桶组合变向 (In-Out-Cut) 5趟', '侧向跳跃 (连贯性单腿) 4组', '壶铃摇摆 (Kettlebell Swing) 4组', '医药球侧向抛掷 4组'] },
        { day: '周三', title: '主动恢复与预防', duration: '45分钟', tasks: ['核心-骨盆控制与激活 (Bird-Dog) 3组', '踝关节强化与本体感觉进阶 3组', '髋部屈肌深层拉伸 (Couch Stretch) 每侧60秒', '筋膜枪与泡沫轴 (深层组织松解) 20分'] },
        { day: '周四', title: '专项耐力与抗阻', duration: '100分钟', tasks: ['滑行板高强度间歇 (HIIT) 10组', '动感单车冲刺 (Sprint Intervals) 10组', '靠墙静蹲 (负重/单腿/TRX) 3组', '抗旋转核心训练 (Pallof Press) 4组'] },
        { day: '周五', title: '综合力量与速度', duration: '90分钟', tasks: ['阻力冲刺 (雪橇拖拽/降落伞) 8趟', '保加利亚分腿蹲 4组', '深跳 (Drop Jump) + 连续跳 4组', '悬垂举腿 / 俄罗斯转体 4组'] },
        { day: '周六', title: '比赛模拟与高光', duration: '90分钟', tasks: ['400米/800米田径场冲刺 4组', '臀推 (杠铃/弹力带) 4组x10次', '敏捷梯/锥桶组合变向 (In-Out-Cut) 6趟'] },
        { day: '周日', title: '深度恢复日', duration: '60分钟', tasks: ['静态拉伸 (全面柔韧性) 15分', '髋部屈肌深层拉伸 (Couch Stretch) 2组', '冰浴与冷热交替浴 10分'] }
      ]
    }
  ],
  en: [
    {
      id: 'age4_6',
      title: 'Intro Stage',
      age: 'Age 4-6',
      target: 'Gamified training to build interest & basic coordination. Focus on participation and habits, absolutely no competition-driven results.',
      duration: '30-45 Mins',
      frequency: '2-3 / per week',
      core: 'Gamified & Interactive',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'text-amber-500',
      modules: [
        {
          name: '1. Balance & Posture Awareness',
          items: [
            { name: 'Single-leg Stance Game', target: '10s each leg', tag: 'Balance Coord', desc: 'Eyes closed/open, extend from 3s to 10s. Use "Flamingo Contest" for fun. Standing leg slightly bent (~15°), torso straight, arms extended.' },
            { name: 'Balance Pad/Foam Stance', target: '3 sets x 15s', tag: 'Proprioception Ankle', desc: 'Stand on unstable surface to activate ankle proprioception. Double to single leg, add arm movements (catching/bouncing) to increase difficulty.' },
            { name: 'Balance Beam / Tape Walk', target: '2-3 laps', tag: 'Balance Posture', desc: 'Walk on straight, curved, zig-zag lines with arms extended. Advance: backwards, sideways, sandbag on head. Develop midline awareness.' },
            { name: 'Modified Plank (Kneeling)', target: '2-3 sets x 10-15s', tag: 'Core', desc: 'Knees on the floor. Keep head, back, and hips aligned. Focus on core muscle activation, not holding time.' }
          ]
        },
        {
          name: '2. Basic Skating Posture Mimicking',
          items: [
            { name: 'Duck Walk', target: '10-15m x 3 laps', tag: 'Tech Mimic Posture', desc: 'Feet turned out, knees at 90°, chest at 45°. Hands behind back or on knees. Mimic ready position. Stable CoG, 10-15m back and forth.' },
            { name: 'Arm Swing Practice', target: '3 sets x 10 reps', tag: 'Arm Swing Coord', desc: 'Standing mimic of short track (one arm pendulum) or long track (double back). Slight elbow bend, coordinate rhythm.' },
            { name: 'Stationary Heel Kicks', target: '3 sets x 10 reps', tag: 'Ice Feel', desc: 'Mimic the ice recovery phase. Lock joints, swing arms in rhythm. Understand power transfer from push to leg.' },
            { name: 'Lateral Push (Moving)', target: '5-8 reps/side', tag: 'Push Direction', desc: 'Shoulder-width, low posture (60° knee bend), move laterally to mimic corner pushes. Focus on push direction and weight shift.' },
            { name: 'Squat Hold (Static Skating)', target: '2-3 sets x 20-30s', tag: 'Static Power', desc: 'Wall-sit, thigh parallel, knees behind toes, trunk forward. Start 10-20s, up to 30s. Build muscle memory for low posture.' }
          ]
        },
        {
          name: '3. Full-Body Coordination & Agility',
          items: [
            { name: 'Agility Ladder Drills', target: '3-4 laps', tag: 'Agility Cadence', desc: 'In-and-out jumps, single-leg hops. Emphasize light feet, rhythm is core. Slow to fast, clean form over speed.' },
            { name: 'Reaction Chase Game', target: '5-8 reps', tag: 'Reaction Agility', desc: 'React to colored cards (Red=Right). Train visual reaction, direction change. Bonus points for maintaining low posture.' },
            { name: 'Hopscotch (Variations)', target: '3-5 mins', tag: 'Jumping Coord', desc: 'Add one-leg landings, double jumps, turn jumps. Develop leg explosive base, landing absorption, and spatial awareness.' },
            { name: 'Animal Crawls', target: '3-5 laps', tag: 'Core Stability', desc: 'Bear crawls, crab walks, caterpillar. Build alternating limb control and trunk stability. Fun and effective.' }
          ]
        },
        {
          name: '4. Flexibility & Joint Mobility',
          items: [
            { name: 'Butterfly & Hip Circles', target: '20-30s', tag: 'Hips Flex', desc: 'Seated butterfly, press knees down gently 20-30s. Standing hip circles (10x each way). Hip mobility is crucial for push-off.' },
            { name: 'Ankle Mobility Exercises', target: '2-3 sets', tag: 'Ankle Mobility', desc: 'Seated ankle circles (10x), standing calf stretch. Squat ankle mobility check. Ankles are the terminal push point.' },
            { name: 'Kids Yoga (Gamified)', target: '10-15s / pose', tag: 'Full Stretch Spine', desc: 'Cat-Cow (spine), Downward Dog (posterior), Warrior I (hip flexors). Use animal names to engage. Hold 10-15s each.' }
          ]
        }
      ],
      weeklyPlan: [
        { day: 'Tue', title: 'Posture & Ice Feel', duration: '35 mins', tasks: ['Single-leg Stance 3 sets', 'Duck Walk 3 laps', 'Agility Ladder Drills', 'Butterfly & Hip Circles'] },
        { day: 'Thu', title: 'Dynamic Balance', duration: '40 mins', tasks: ['Balance Pad Stance', 'Lateral Push 5 reps/side', 'Reaction Chase Game', 'Kids Yoga (Gamified)'] },
        { day: 'Sat', title: 'Full Coordination', duration: '45 mins', tasks: ['Tape Walk/Beam', 'Squat Hold (Static)', 'Animal Crawls', 'Modified Plank'] }
      ]
    },
    {
      id: 'age7_10',
      title: 'Advanced Stage',
      age: 'Age 7-10',
      target: 'Systematically establish dryland skating techniques, introduce basic strength & plyometrics. Quality of form is the absolute priority.',
      duration: '60-75 Mins',
      frequency: '3-4 / per week',
      core: 'Form & Quality First',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-500',
      modules: [
        {
          name: '1. Specific Tech Mimicking',
          items: [
            { name: 'Basic Stance & CoG Control', target: '5 mins', tag: 'Stance', desc: 'Differentiate long vs. short track posture (knee angle, forward lean). 5-min daily mirror check before training.' },
            { name: 'Wall-sit Single Leg Hold', target: '3 sets x 30s/leg', tag: 'Core Control', desc: 'Thigh parallel, knee at 90°, chest forward. Push from the bottom leg, keep the knee max at 100°.' },
            { name: 'Dryland Lateral Pushes', target: '4 sets x 15 reps/leg', tag: 'Push Tech', desc: 'Full weight transfer. Push leg fully extended, 1s pause in air, quick recovery.' },
            { name: 'Corner Crossovers Mimic', target: '3 sets x 10 reps', tag: 'Cornering', desc: 'Outer leg pushes inward and crosses over. Focus on inner lean to simulate entering a corner.' },
            { name: 'Arm Swing Specific Training', target: '3 sets x 10 reps', tag: 'Arm Rhythm', desc: 'Specific arm mechanics for long track (back cross) vs. short track (one hand back). Coordinate with leg rhythm.' },
            { name: 'Banded Lateral Pushes', target: '3 sets x 10 reps', tag: 'Power', desc: 'Resistance band on waist. Stay low, feel the glute and quad activation.' },
            { name: 'Slide Board Training', target: '4 sets x 1 min', tag: 'Endurance', desc: 'Continuous slide mimicking. Keep head/trunk stable, increase duration gradually.' }
          ]
        },
        {
          name: '2. Foundation Strength',
          items: [
            { name: 'Bodyweight Squats', target: '4 sets x 12 reps', tag: 'Legs', desc: 'Feet shoulder-width apart, sit back, keep weight on heels, straight back.' },
            { name: 'Assisted Pistol Squats', target: '3 sets x 8 reps/leg', tag: 'Single Leg', desc: 'Hold onto a stable object, lower until thigh is parallel to ground.' },
            { name: 'Lateral Bounds (Moving)', target: '3 sets x 8 reps/side', tag: 'Lateral Power', desc: 'Leap side-to-side, land on single leg and pause 1-2s. Distance 0.5m to 1.5m.' },
            { name: 'Glute Bridges', target: '3 sets x 15 reps', tag: 'Hips', desc: 'Squeeze glutes at the top to train hip extension power.' },
            { name: 'Frog Jumps', target: '4 sets x 10 reps', tag: 'Explosive', desc: 'Deep squat start, use arm swing for momentum, absorb impact on landing.' },
            { name: 'Glute Activation (Banded Walk)', target: '3 sets x 15 steps', tag: 'Glute Medius', desc: 'Band above knees, low posture lateral walk. Feel the glute medius, crucial for push-off power.' },
            { name: 'Push-ups', target: '3 sets x 10 reps', tag: 'Upper Body', desc: 'Keep body straight, lower chest to the ground.' }
          ]
        },
        {
          name: '3. Advanced Core & Cardio',
          items: [
            { name: 'Plank Variations', target: '3 sets x 1 min', tag: 'Core', desc: 'Include single-leg raises or arm reaches to build anti-rotation core strength.' },
            { name: 'Dead Bug', target: '3 sets x 15 reps', tag: 'Coordination', desc: 'Lower opposite arm and leg simultaneously while keeping lower back glued to the floor.' },
            { name: 'Skating Iso-Hold + Arm Swing', target: '3 sets x 20 swings', tag: 'Specific Core', desc: 'Hold low skating posture while performing arm swings. Core must stay perfectly stable without swaying.' },
            { name: 'Mountain Climbers', target: '4 sets x 30s', tag: 'Cardio', desc: 'High knee drive in push-up position, maintain high cadence.' }
          ]
        },
        {
          name: '4. Plyometrics & Agility',
          items: [
            { name: 'Skater Jumps', target: '4 sets x 16 reps', tag: 'Lateral Plyo', desc: 'Wide lateral leaps, land on single leg with stability.' },
            { name: 'Agility Ladder Advanced', target: '4-6 laps', tag: 'Quick Feet', desc: 'Introduce complex patterns like Ali shuffle or cross-steps.' },
            { name: 'T-Drill / Shuttle Runs', target: '4-6 laps', tag: 'Agility', desc: 'Max sprint and sudden stops to simulate race-day scenarios.' }
          ]
        },
        {
          name: '5. Aerobic Base & Speed Endurance',
          items: [
            { name: 'Continuous Low Posture Slide', target: '1-2 sets x 5-8 mins', tag: 'Aerobic', desc: 'Continuous lateral movement. Focus on form, keep HR in aerobic zone (130-145bpm).' },
            { name: 'Interval Sprints (20m)', target: '2 sets x 6-8 reps', tag: 'Acceleration', desc: 'Low start, max sprint 20m, walk back to rest. Emphasize explosive first steps.' },
            { name: 'Fartlek (Pace Perception)', target: '4-6 laps', tag: 'Fartlek', desc: 'Accelerate on straights (80%), slow down and hold low posture on corners.' }
          ]
        }
      ],
      weeklyPlan: [
        { day: 'Mon', title: 'Tech Standardization', duration: '60 mins', tasks: ['Basic Stance & CoG Control', 'Dryland Lateral Pushes', 'Arm Swing Specific Training', 'Slide Board Training', 'Plank Variations'] },
        { day: 'Tue', title: 'Strength & Activation', duration: '60 mins', tasks: ['Glute Activation (Banded Walk)', 'Bodyweight Squats', 'Assisted Pistol Squats', 'Glute Bridges', 'Push-ups'] },
        { day: 'Thu', title: 'Plyo & Agility', duration: '60 mins', tasks: ['Lateral Bounds (Moving)', 'Frog Jumps', 'Skater Jumps', 'Agility Ladder Advanced', 'T-Drill / Shuttle Runs'] },
        { day: 'Fri', title: 'Endurance & Core', duration: '75 mins', tasks: ['Continuous Low Posture Slide', 'Skating Iso-Hold + Arm Swing', 'Dead Bug', 'Wall-sit Single Leg Hold'] },
        { day: 'Sat', title: 'Speed & Rhythm', duration: '75 mins', tasks: ['Interval Sprints (20m)', 'Fartlek (Pace Perception)', 'Corner Crossovers Mimic', 'Banded Lateral Pushes'] }
      ]
    },
    {
      id: 'age11_16',
      title: 'Pro Youth Stage',
      age: 'Age 11-16',
      target: 'Full transition to high-intensity competitive conditioning. Maximize strength, explosive power, and anaerobic endurance.',
      duration: '90-120 Mins',
      frequency: '4-6 / per week',
      core: 'High Intensity & Load',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      iconColor: 'text-rose-500',
      modules: [
        {
          name: '1. Max Strength & Absolute Power',
          items: [
            { name: 'Barbell Back Squats', target: '4-5 sets x 6-8 reps', tag: 'Absolute', desc: 'Heavy load max strength reserve, deep squat, tight core. Avoid pelvic tilt.' },
            { name: 'Bulgarian Split Squats', target: '4 sets x 8 reps/leg', tag: 'Single Max', desc: 'Ultimate single-leg stability to fix power imbalances.' },
            { name: 'Romanian Deadlift (RDL)', target: '4 sets x 8-10 reps', tag: 'Posterior', desc: 'Hamstrings and glutes focus for hip extension.' },
            { name: 'Nordic Hamstring Curls', target: '3-4 sets x 5-8 reps', tag: 'Eccentric', desc: 'Partner-assisted eccentric hamstring control. One of the most effective exercises for preventing hamstring strains.' },
            { name: 'Barbell Hip Thrusts', target: '4 sets x 10 reps', tag: 'Hip Power', desc: 'The source of on-ice propulsion. 1-2s pause at the top.' },
            { name: 'Pull-ups / Rows', target: '3 sets x 8-10 reps', tag: 'Upper Body', desc: 'Upper body synergy required for starts and sprints.' }
          ]
        },
        {
          name: '2. Explosive & Plyometrics',
          items: [
            { name: 'Box Jumps', target: '4 sets x 6 reps', tag: 'Explosive', desc: 'Max height and fast takeoff. Soft landing.' },
            { name: 'Drop Jump to Bound', target: '4 sets x 6 reps', tag: 'Reaction', desc: 'Drop from box, immediate takeoff. Trains eccentric-concentric transition.' },
            { name: 'Kettlebell Swings', target: '4 sets x 15 reps', tag: 'Hip Snap', desc: 'Power comes from hips, not arms.' },
            { name: 'Continuous Lateral Bounds', target: '4 sets x 10 reps/side', tag: 'Specific', desc: 'Mimics continuous on-ice lateral pushes.' },
            { name: 'Med Ball Rotational Throws', target: '4 sets x 10 reps/side', tag: 'Core Power', desc: 'Rotational power transfer through the core.' },
            { name: 'Agility Cuts (In-Out-Cut)', target: '4-6 sets', tag: 'Agility', desc: 'Combined with start footwork. Rapid cuts emphasizing weight shift, cadence, and bilateral coordination.' }
          ]
        },
        {
          name: '3. Anaerobic & Speed Endurance',
          items: [
            { name: 'Slide Board HIIT', target: '8-10 sets x 45s', tag: 'Anaerobic', desc: '45s all-out, 30s rest. Lactic threshold challenge.' },
            { name: 'Spin Bike Sprints', target: '10 sets x 20s', tag: 'Speed Endure', desc: '20s max power sprint, 40s slow recovery. Targets phosphagen system.' },
            { name: 'Sled Pushes / Parachute Sprints', target: '6-8 laps x 20m', tag: 'Resistance', desc: 'Maintain high cadence under heavy fatigue and resistance.' },
            { name: '400m/800m Track Sprints', target: '4-6 sets', tag: 'Cardio Max', desc: 'Anaerobic glycolysis training for late-race speed endurance.' }
          ]
        },
        {
          name: '4. Advanced Core & Anti-Fatigue',
          items: [
            { name: 'Weighted Plank / Ab Wheel', target: '4 sets x 1 min / 10 reps', tag: 'Anti-extension', desc: 'Extreme anterior core test.' },
            { name: 'Pallof Press (Anti-Rotation)', target: '4 sets x 12 reps/side', tag: 'Anti-Rotation', desc: 'Resist lateral pull to keep the torso stable. Greatly enhances anti-centrifugal force capability in corners.' },
            { name: 'Hanging Leg Raises / Russian Twists', target: '4 sets x 15 reps', tag: 'Core Control', desc: 'Lower ab flexion and anti-rotation.' },
            { name: 'Wall-sit (Weighted/Single-leg/TRX)', target: '3 sets x 1.5-2 mins', tag: 'Static Endure', desc: 'Isometric endurance for low skating posture.' }
          ]
        },
        {
          name: '5. Recovery & Injury Prevention',
          items: [
            { name: 'Massage Gun & Foam Rolling', target: '15-20 mins', tag: 'Circulation', desc: 'Deep tissue release for quads, hamstrings, and glutes.' },
            { name: 'Static Stretching', target: '10-15 mins', tag: 'Flexibility', desc: 'Maintain muscle elasticity and joint ROM.' },
            { name: 'Couch Stretch (Deep Hip Flexors)', target: '45-60s / side', tag: 'Hip Mobility', desc: 'Target tight hip flexors caused by prolonged low posture. Deep stretch to relieve lower back pressure.' },
            { name: 'Core-Pelvic Activation (Bird-Dog)', target: '3 sets x 10 reps/side', tag: 'Stability', desc: 'Maintain neutral pelvis and activate deep core to prevent lumbar compensation during skating.' },
            { name: 'Advanced Ankle Proprioception', target: '3 sets x 15 reps', tag: 'Ankle Prev', desc: 'Single-leg stand on balance pad with eyes closed or catching a ball. Strengthens micro-muscles to prevent sprains.' },
            { name: 'Ice / Contrast Baths', target: '10 mins', tag: 'Recovery', desc: 'Accelerate lactic acid metabolism after high-intensity days.' }
          ]
        }
      ],
      weeklyPlan: [
        { day: 'Mon', title: 'Max Strength', duration: '90 mins', tasks: ['Barbell Back Squats 5x6', 'Nordic Hamstring Curls 4 sets', 'Romanian Deadlift (RDL) 4x8', 'Pull-ups / Rows 3 sets', 'Weighted Plank / Ab Wheel 1 min'] },
        { day: 'Tue', title: 'Explosive & Agility', duration: '80 mins', tasks: ['Box Jumps 4x6', 'Agility Cuts (In-Out-Cut) 5 laps', 'Continuous Lateral Bounds 4 sets', 'Kettlebell Swings 4 sets', 'Med Ball Rotational Throws 4 sets'] },
        { day: 'Wed', title: 'Active Recovery', duration: '45 mins', tasks: ['Core-Pelvic Activation (Bird-Dog) 3 sets', 'Advanced Ankle Proprioception 3 sets', 'Couch Stretch (Deep Hip Flexors) 60s/side', 'Massage Gun & Foam Rolling 20 mins'] },
        { day: 'Thu', title: 'Specific Endurance', duration: '100 mins', tasks: ['Slide Board HIIT 10 sets', 'Spin Bike Sprints 10 sets', 'Wall-sit (Weighted/Single-leg/TRX) 3 sets', 'Pallof Press (Anti-Rotation) 4 sets'] },
        { day: 'Fri', title: 'Combo Power', duration: '90 mins', tasks: ['Sled Pushes / Parachute Sprints 8 laps', 'Bulgarian Split Squats 4 sets', 'Drop Jump to Bound 4 sets', 'Hanging Leg Raises / Russian Twists 4 sets'] },
        { day: 'Sat', title: 'Race Simulation', duration: '90 mins', tasks: ['400m/800m Track Sprints 4 sets', 'Barbell Hip Thrusts 4x10', 'Agility Cuts (In-Out-Cut) 6 laps'] },
        { day: 'Sun', title: 'Deep Recovery', duration: '60 mins', tasks: ['Static Stretching 15 mins', 'Couch Stretch (Deep Hip Flexors) 2 sets', 'Ice / Contrast Baths 10 mins'] }
      ]
    }
  ]
};

// --- 语言配置 (Translations) ---
const translations = {
  zh: {
    loading: '加载云端数据中...',
    ready: '准备好训练了吗？',
    daysToRace: '距离比赛',
    days: '天',
    keepGoing: '保持状态，冲刺 PB',
    todayFocus: '今日核心',
    trainingReminder: '下午 4:30 训练提醒',
    warmUp: '记得提前 15 分钟热身',
    todayTraining: '今日训练',
    todayTaskCard: '今日任务',
    blazePointsCard: '冰焰积分',
    earnPoints: '单项 +{task}分 ｜ 全天完成额外 +{bonus}分',
    template: '模板',
    addCustom: '自定义训练...',
    statsAndTrends: '成绩与趋势',
    recordMilestones: '记录你的每一个里程碑',
    recentRecords: '近期成绩',
    latest: '最新',
    noData: '暂无数据，快去记录第一次成绩吧！',
    recordNew: '记录新成绩',
    inputTime: '输入耗时 (秒)',
    save: '保存',
    rewardShop: '奖励商店',
    treatYourself: '犒劳一下努力的自己',
    availablePoints: '可用积分',
    points: '分',
    redeem: '兑换',
    notEnough: '积分不足',
    settings: '应用设置',
    customizePlan: '自定义你的专属训练计划',
    raceDate: '比赛目标日期',
    weeklyTemplate: '一周训练模板',
    saveSettings: '保存设置',
    savedSuccessfully: '保存成功！',
    loggedIn: '已登录:',
    nav: { dashboard: '概览', tasks: '任务', academy: '学院', goals: '目标', plans: '计划', data: '数据', shop: '商店' },
    goalsTitle: '比赛目标',
    goalsSubtitle: '用明确目标驱动每一次训练',
    noGoals: '还没有比赛目标。',
    addGoal: '添加目标',
    editGoal: '编辑目标',
    archiveGoal: '归档目标',
    archivedGoals: '已归档目标',
    showArchived: '查看归档',
    hideArchived: '收起归档',
    competitionName: '比赛名称',
    competitionDate: '比赛日期',
    eventName: '项目名称',
    targetDistance: '目标距离',
    currentTimeSeconds: '当前成绩 (秒)',
    targetTimeSeconds: '目标成绩 (秒)',
    priority: '优先级',
    progress: '进度',
    achieved: '已达标',
    gap: '差距',
    notes: '备注',
    status: '状态',
    goalTitleRequired: '请输入目标标题',
    goalEventRequired: '请填写项目名称或目标距离',
    goalInvalidTime: '成绩必须是有效数字',
    goalInvalidPriority: '优先级必须是 A、B 或 C',
    goalTitlePlaceholder: '例如：AGN 2027 500m',
    goalNotesPlaceholder: '训练重点、策略或提醒...',
    plansTitle: '训练计划',
    plansSubtitle: '把目标拆成每天可执行的训练安排',
    noPlans: '还没有训练计划。',
    createPlan: '创建计划',
    editPlan: '编辑计划',
    archivePlan: '归档计划',
    selectPlan: '选择当前计划',
    activePlan: '当前计划',
    planTitleRequired: '请输入计划标题',
    planStartRequired: '请选择开始日期',
    planEndRequired: '请选择结束日期',
    planInvalidDateRange: '结束日期不能早于开始日期',
    planInvalidStatus: '计划状态必须是 draft 或 active',
    planTitlePlaceholder: '例如：AGN 备赛周计划',
    focus: '训练重点',
    linkedGoal: '关联目标',
    noLinkedGoal: '不关联目标',
    startDate: '开始日期',
    endDate: '结束日期',
    draft: '草稿',
    active: '进行中',
    weeklyCompletion: '周完成度',
    addPlanTask: '添加计划任务',
    editPlanTask: '编辑计划任务',
    planTaskTextRequired: '请输入任务内容',
    planTaskDateRequired: '请选择任务日期',
    planTaskInvalidCategory: '任务分类不正确',
    planTaskInvalidDuration: '训练时长必须是正数',
    planTaskInvalidIntensity: '强度必须是 low、medium、high 或留空',
    planTaskTextPlaceholder: '例如：弯道技术训练',
    category: '分类',
    durationMinutes: '时长(分钟)',
    intensity: '强度',
    completedAt: '完成于',
    addToToday: '加入今日任务',
    alreadyInToday: '今日任务里已有相同项目',
    taskImportedToToday: '已加入今日任务',
    daysNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    language: '语言',
    optionalTarget: '目标/配速要求 (选填)',
    targetLabel: '目标',
    cancel: '取消',
    upcomingRaces: '其他即将到来的比赛',
    raceName: '比赛名称',
    allCompletedAlert: '🎉 太棒了！完成今日所有任务，额外获得 {bonus} 积分！',
    pointsSettingTitle: '积分奖励设置',
    pointsPerTask: '单项任务奖励',
    dailyBonusPoints: '全天完成额外奖励',
    historyCalendar: '历史打卡日历',
    checkinRecords: '坚持训练的每一天都值得被记录',
    checkinLegend: '已打卡',
    themeSettingTitle: '主题配色',
    openAcademy: 'BLAZE SKATE ACADEMY',
    academySub: '全周期速滑专业陆地训练',
    closeAcademy: '关闭青训大厅',
    importToToday: '导入今日任务',
    taskAdded: '已导入',
    proLocked: 'PRO 会员专属内容',
    proLockedDesc: '升级 BLAZE PRO 解锁完整动作矩阵与一键排课功能。',
    profileTitle: '个人中心',
    appPreferences: '应用偏好',
    trainingConfig: '训练与核心数据',
    securityAndAccess: '安全与权限',
    profileAvatar: '自定义头像',
    uploadAvatarDesc: '点击头像上传你的专属照片',
    brandSub: '冰焰速滑训练系统',
    parentMode: '家长 / 教练模式',
    unlockPrompt: '请输入 4 位数字密码解锁核心编辑权限',
    setPinPrompt: '设置 4 位数字密码以锁定训练排课与成绩录入',
    pinPlaceholder: '4位数字',
    unlock: '解锁',
    setPin: '设置密码',
    removePin: '移除密码',
    lockNow: '立即锁定',
    wrongPin: '密码错误，请重试',
    pinLengthError: '密码必须是4位数字',
    rewardHistory: '兑换记录',
    shopManagement: '商店商品管理',
    distanceManagement: '成绩项目管理',
    newDistance: '新项目',
    emptyHistory: '还没有兑换过奖励哦~',
    redeemSuccess: '兑换成功！',
    enjoyReward: '快去享受你的【{reward}】吧！',
    close: '关闭',
    unlockedStatus: '核心权限已解锁',
    emojiPlaceholder: '图标 (Emoji)',
    itemNamePlaceholder: '商品名称',
    pointsRequired: '所需积分:',
    dailyProgress: '今日任务进度',
    completedTasks: '已完成 {completed}/{total}',
    weeklyActivity: '本周活跃星图',
    recentHighlight: '最新高光时刻',
    noRecentRecord: '暂无近期记录',
    keepItUp: '继续保持！',
    accountStatus: '账号安全与同步',
    guestMode: '游客模式 (仅本地缓存)',
    guestWarning: '清理微信或浏览器缓存会导致数据丢失，请尽快注册以开启云同步。',
    bindAccountBtn: '注册 / 登录',
    officialAccount: '正式账号 (云端同步中)',
    manageAccountBtn: '账号管理',
    authTitle: '注册 / 登录',
    authSub: '安全保存您的所有训练记录与会员特权',
    email: '邮箱地址',
    password: '密码 (至少6位)',
    bindNow: '立即注册并同步',
    binding: '处理中...',
    accountManageTitle: '账号管理中心',
    usernameLabel: '自定义用户名',
    emailLabel: '绑定邮箱',
    phoneLabel: '绑定手机号',
    bound: '已绑定',
    unbound: '未绑定',
    logout: '退出登录',
    version: '版本 v2.2.0',
    copyright: '© 2026 BlazeSkate.com 保留所有权利。',
    greetings: [
      '夜深了，良好的睡眠也是训练的一部分 🌙',
      '清晨唤醒，准备好今天的训练了吗？ ☀️',
      '上午好，专注训练每一刻！ 🎯',
      '下午好，保持状态，冲刺 PB！ ⚡',
      '晚间恢复，记得充分拉伸 🧘'
    ],
    coachTipTitle: '训练锦囊',
    tips: [
      '注意弯道交替步时的重心转移，尽量压低身姿。',
      '肌肉的酸痛是成长的声音，坚持住！',
      '上冰前检查一下冰刀是否需要打磨了。',
      '核心力量是滑冰稳定性的基石，不要忽视核心训练。',
      '把每一次起跑都当作决赛来对待。',
      '注意呼吸节奏，让氧气充分进入肌肉。',
      '细节决定成败：脚踝的支撑一定要稳固。'
    ],
    proTitle: '升级 BLAZE PRO',
    proSubtitle: '解锁全部高阶训练功能',
    proPrice: '¥98',
    proPeriod: '/ 年',
    proFeatures: [
      '无限制的专属成绩项目定制与分析',
      '解锁奖励商店与专属特权兑换',
      '解锁 BLAZE 独家青训体系完整动作矩阵',
      '解锁全部 8 款专属沉浸式训练主题',
      '高阶家长端密码锁与全局积分控制'
    ],
    upgradeNow: '获取 PRO 权限',
    comingSoon: '正在为您解锁 PRO 权限...',
    proActiveTitle: 'BLAZE PRO 尊贵会员',
    proActiveSub: '已解锁全部高阶训练功能',
    proTag: '已激活',
    proUnlockedMsg: 'PRO 权限已解锁！',
    wechatContact: '客服微信：BlazeSkate_VIP',
    copyUid: '复制我的账号 ID',
    uidCopied: '已复制！',
    paymentInstruction: '1. 点击上方按钮复制您的账号 ID。\n2. 添加客服微信，并发送您的 ID。\n3. 支付 ¥98 后，客服将为您手动永久解锁 PRO 权限。'
  },
  en: {
    loading: 'Loading cloud data...',
    ready: 'Ready to train?',
    daysToRace: 'Days to Race',
    days: 'Days',
    keepGoing: 'Keep it up, crush that PB',
    todayFocus: 'Today\'s Focus',
    trainingReminder: '4:30 PM Training Reminder',
    warmUp: 'Remember to warm up 15 mins early',
    todayTraining: 'Today\'s Training',
    todayTaskCard: 'Today Tasks',
    blazePointsCard: 'Blaze Points',
    earnPoints: 'Task +{task} pts | Daily Finish +{bonus} pts',
    template: 'Template',
    addCustom: 'Custom workout...',
    statsAndTrends: 'Stats & Trends',
    recordMilestones: 'Record every milestone',
    recentRecords: 'Recent Times',
    latest: 'Latest',
    noData: 'No data yet, go set your first record!',
    recordNew: 'Record New Time',
    inputTime: 'Enter time (sec)',
    save: 'Save',
    rewardShop: 'Reward Shop',
    treatYourself: 'Treat yourself for the hard work',
    availablePoints: 'Available Points',
    points: 'pts',
    redeem: 'Redeem',
    notEnough: 'Not enough',
    settings: 'Settings',
    customizePlan: 'Customize your training plan',
    raceDate: 'Race Target Date',
    weeklyTemplate: 'Weekly Template',
    saveSettings: 'Save Settings',
    savedSuccessfully: 'Saved!',
    loggedIn: 'Logged in:',
    nav: { dashboard: 'Home', tasks: 'Tasks', academy: 'Academy', goals: 'Goals', plans: 'Plan', data: 'Data', shop: 'Shop' },
    goalsTitle: 'Competition Goals',
    goalsSubtitle: 'Use clear goals to drive every training session',
    noGoals: 'No competition goals yet.',
    addGoal: 'Add Goal',
    editGoal: 'Edit Goal',
    archiveGoal: 'Archive Goal',
    archivedGoals: 'Archived Goals',
    showArchived: 'Show Archived',
    hideArchived: 'Hide Archived',
    competitionName: 'Competition Name',
    competitionDate: 'Competition Date',
    eventName: 'Event Name',
    targetDistance: 'Target Distance',
    currentTimeSeconds: 'Current Time (seconds)',
    targetTimeSeconds: 'Target Time (seconds)',
    priority: 'Priority',
    progress: 'Progress',
    achieved: 'Achieved',
    gap: 'Gap',
    notes: 'Notes',
    status: 'Status',
    goalTitleRequired: 'Goal title is required',
    goalEventRequired: 'Event name or target distance is required',
    goalInvalidTime: 'Times must be valid numbers',
    goalInvalidPriority: 'Priority must be A, B, or C',
    goalTitlePlaceholder: 'Example: AGN 2027 500m',
    goalNotesPlaceholder: 'Training focus, strategy, or reminders...',
    plansTitle: 'Training Plan',
    plansSubtitle: 'Turn goals into daily training work',
    noPlans: 'No training plan yet.',
    createPlan: 'Create Plan',
    editPlan: 'Edit Plan',
    archivePlan: 'Archive Plan',
    selectPlan: 'Select Current Plan',
    activePlan: 'Current Plan',
    planTitleRequired: 'Plan title is required',
    planStartRequired: 'Start date is required',
    planEndRequired: 'End date is required',
    planInvalidDateRange: 'End date must not be before start date',
    planInvalidStatus: 'Plan status must be draft or active',
    planTitlePlaceholder: 'Example: AGN prep weekly plan',
    focus: 'Focus',
    linkedGoal: 'Linked Goal',
    noLinkedGoal: 'No linked goal',
    startDate: 'Start Date',
    endDate: 'End Date',
    draft: 'Draft',
    active: 'Active',
    weeklyCompletion: 'Weekly Completion',
    addPlanTask: 'Add Plan Task',
    editPlanTask: 'Edit Plan Task',
    planTaskTextRequired: 'Task text is required',
    planTaskDateRequired: 'Task date is required',
    planTaskInvalidCategory: 'Invalid task category',
    planTaskInvalidDuration: 'Duration must be a positive number',
    planTaskInvalidIntensity: 'Intensity must be low, medium, high, or blank',
    planTaskTextPlaceholder: 'Example: Corner technique session',
    category: 'Category',
    durationMinutes: 'Duration (min)',
    intensity: 'Intensity',
    completedAt: 'Completed at',
    addToToday: 'Add to Today',
    alreadyInToday: 'A matching task already exists today',
    taskImportedToToday: 'Added to today',
    daysNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    language: 'Language',
    optionalTarget: 'Target/Pace (Optional)',
    targetLabel: 'Target',
    cancel: 'Cancel',
    upcomingRaces: 'Other Upcoming Races',
    raceName: 'Race name',
    allCompletedAlert: '🎉 Awesome! All tasks completed. +{bonus} Bonus Points!',
    pointsSettingTitle: 'Points Reward Settings',
    pointsPerTask: 'Points per Task',
    dailyBonusPoints: 'Daily Bonus Points',
    historyCalendar: 'Training History',
    checkinRecords: 'Every day of hard work leaves a mark',
    checkinLegend: 'Completed',
    themeSettingTitle: 'Theme Palette',
    openAcademy: 'BLAZE SKATE ACADEMY',
    academySub: 'PROFESSIONAL DRYLAND TRAINING',
    closeAcademy: 'Close Academy',
    importToToday: 'Import to Today',
    taskAdded: 'Imported',
    proLocked: 'PRO Exclusive Content',
    proLockedDesc: 'Upgrade to BLAZE PRO to unlock full exercises & 1-click importing.',
    profileTitle: 'My Profile',
    appPreferences: 'App Preferences',
    trainingConfig: 'Training & Data',
    securityAndAccess: 'Security & Access',
    profileAvatar: 'Custom Avatar',
    uploadAvatarDesc: 'Tap avatar to upload photo',
    brandSub: 'TRAINING PLATFORM',
    parentMode: 'Parent / Coach Mode',
    unlockPrompt: 'Enter 4-digit PIN to unlock editing',
    setPinPrompt: 'Set a 4-digit PIN to lock planning & records',
    pinPlaceholder: '4-digit',
    unlock: 'Unlock',
    setPin: 'Set PIN',
    removePin: 'Remove PIN',
    lockNow: 'Lock Now',
    wrongPin: 'Incorrect PIN, try again',
    pinLengthError: 'PIN must be 4 digits',
    rewardHistory: 'History',
    shopManagement: 'Shop Management',
    distanceManagement: 'Stats Categories',
    newDistance: 'New Category',
    emptyHistory: 'No redemption history yet.',
    redeemSuccess: 'Success!',
    enjoyReward: 'Go enjoy your [{reward}]!',
    close: 'Close',
    unlockedStatus: 'Core Access Unlocked',
    emojiPlaceholder: 'Emoji',
    itemNamePlaceholder: 'Item Name',
    pointsRequired: 'Cost:',
    dailyProgress: 'Daily Progress',
    completedTasks: 'Completed {completed}/{total}',
    weeklyActivity: 'Weekly Activity',
    recentHighlight: 'Recent Highlight',
    noRecentRecord: 'No recent records',
    keepItUp: 'Keep it up!',
    accountStatus: 'Account & Sync',
    guestMode: 'Guest Mode (Local)',
    guestWarning: 'Clearing your browser cache will erase your data. Register to enable cloud sync.',
    bindAccountBtn: 'Register / Login',
    officialAccount: 'Official Account (Synced)',
    manageAccountBtn: 'Manage Account',
    authTitle: 'Register / Login',
    authSub: 'Securely save your training records and PRO status',
    email: 'Email Address',
    password: 'Password (min 6 chars)',
    bindNow: 'Register & Sync',
    binding: 'Processing...',
    accountManageTitle: 'Account Management',
    usernameLabel: 'Custom Username',
    emailLabel: 'Linked Email',
    phoneLabel: 'Linked Phone',
    bound: 'Linked',
    unbound: 'Not Linked',
    logout: 'Log Out',
    version: 'Version v2.2.0',
    copyright: '© 2026 BlazeSkate.com All rights reserved.',
    greetings: [
      'Late night. Rest is part of your training. 🌙',
      'Morning! Ready to crush today\'s training? ☀️',
      'Good morning, stay focused! 🎯',
      'Good afternoon, keep pushing for that PB! ⚡',
      'Evening recovery, don\'t forget to stretch. 🧘'
    ],
    coachTipTitle: 'Training Tip',
    tips: [
      'Focus on weight transfer during corner crossovers. Stay low.',
      'Muscle soreness is the sound of growth. Keep pushing!',
      'Check your blades before hitting the ice. Do they need sharpening?',
      'Core strength is the foundation of your stability.',
      'Treat every start practice like an Olympic final.',
      'Mind your breathing rhythm, oxygenate those muscles.',
      'Details matter: keep your ankles locked and supported.'
    ],
    proTitle: 'Upgrade to BLAZE PRO',
    proSubtitle: 'Unlock all advanced training features',
    proPrice: '$14.99',
    proPeriod: '/ year',
    proFeatures: [
      'Unlimited custom distances & analytics',
      'Unlock Reward Shop & exclusive items',
      'Unlock BLAZE Academy Full Exercise Matrix',
      'Unlock all 8 premium app themes',
      'Parental PIN Lock & Points control'
    ],
    upgradeNow: 'Get PRO Access',
    comingSoon: 'Unlocking PRO access for you...',
    proActiveTitle: 'BLAZE PRO Active',
    proActiveSub: 'All premium features unlocked',
    proTag: 'Active',
    proUnlockedMsg: 'PRO Unlocked Successfully!',
    wechatContact: 'WeChat: BlazeSkate_VIP',
    copyUid: 'Copy My Account ID',
    uidCopied: 'Copied!',
    paymentInstruction: '1. Copy your Account ID above.\n2. Add our WeChat and send your ID.\n3. After $14.99 payment, we will manually unlock your PRO access permanently.'
  }
};

// 初始默认数据（纯净正式版）
const defaultData = {
  lastLoginDate: '',  
  taskHistory: {},    
  points: 0,
  language: typeof window !== 'undefined' ? (localStorage.getItem('blaze_lang') || DEFAULT_LANGUAGE) : DEFAULT_LANGUAGE,
  theme: DEFAULT_THEME,
  avatar: '', 
  parentPin: '',
  isPro: false,
  username: '',
  pointsPerTask: 10,
  dailyBonusPoints: 20,
  completedDays: [], 
  competitionGoalsV1: [],
  trainingPlansV1: [],
  activeTrainingPlanId: null,
  customRewards: [
    { id: 1, name: '心仪零食一份', cost: 200, icon: '🍿' },
    { id: 2, name: '周末自由游戏 2 小时', cost: 500, icon: '🎮' },
    { id: 3, name: '梦想玩具兑换券', cost: 1000, icon: '🎁' },
    { id: 4, name: '新滑冰装备基金', cost: 3000, icon: '⛸️' },
  ],
  customDistances: ['起跑', '单圈', '500m', '777m', '1000m', '1500m'],
  rewardHistory: [],
  races: [], // 清空了默认的比赛记录
  weeklyTemplate: {
    0: '休息日',
    1: '力量训练日',
    2: '爆发与冲刺',
    3: '无氧耐力日',
    4: '冰上技术日',
    5: '专项间歇日',
    6: '长距离耐力',
  },
  tasks: [], // 清空了默认的3个测试任务
  records: [], // 清空了默认的500米测试成绩
  records777: [],
  records1000: [],
  records1500: [],
  recordsStart: [],
  recordsLap: []
};

// ==========================================
// ⏱️ 专业计时转换系统 (RTL 智能推算版)
// ==========================================
const formatTimeInput = (value) => {
  // 1. 提取出所有的纯数字
  let digits = value.replace(/\D/g, '');
  if (!digits) return '';
  
  // 2. 去除前导零，防止卡死
  digits = parseInt(digits, 10).toString();
  if (digits === 'NaN') return '';
  
  // 3. 核心：强制左侧补零到 7 位，并截取最后 7 位（实现从右向左推的效果）
  digits = digits.padStart(7, '0').slice(-7);
  
  // 4. 完美切分成 MM:SS.xxx
  const m = digits.slice(0, 2);
  const s1 = digits.slice(2, 4);
  const s2 = digits.slice(4, 7);
  
  return `${m}:${s1}.${s2}`;
};

const parseTimeToSeconds = (formattedStr) => {
  if (!formattedStr) return 0;
  const parts = formattedStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0] || 0, 10) * 60 + parseFloat(parts[1] || 0);
  }
  return parseFloat(parts[0] || 0);
};

const formatDisplayTime = (totalSeconds) => {
  if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) return '--:--.---';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const mStr = String(m).padStart(2, '0');
  // 修复浮点数精度，强行保留 3 位小数并补齐零
  const sStr = s.toFixed(3).padStart(6, '0');
  return `${mStr}:${sStr}`;
};
// ==========================================

const getPrevDayStr = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getRecordsKey = (dist) => {
  if (dist === '500m') return 'records';
  if (dist === '777m') return 'records777';
  if (dist === '1000m') return 'records1000';
  if (dist === '1500m') return 'records1500';
  if (dist === '起跑' || dist === 'Start') return 'recordsStart';
  if (dist === '单圈' || dist === 'Lap') return 'recordsLap';
  return `records_${dist}`;
};

const createClientId = () => {
  return Date.now() + Math.random();
};

const createEmptyGoalForm = () => ({
  title: '',
  competitionName: '',
  competitionDate: '',
  eventName: '',
  targetDistance: '',
  currentTimeSeconds: '',
  targetTimeSeconds: '',
  priority: 'A',
  notes: '',
});

const createGoalFormFromGoal = (goal) => ({
  title: goal?.title || '',
  competitionName: goal?.competitionName || '',
  competitionDate: goal?.competitionDate || '',
  eventName: goal?.eventName || '',
  targetDistance: goal?.targetDistance || '',
  currentTimeSeconds: typeof goal?.currentTimeSeconds === 'number' ? String(goal.currentTimeSeconds) : '',
  targetTimeSeconds: typeof goal?.targetTimeSeconds === 'number' ? String(goal.targetTimeSeconds) : '',
  priority: goal?.priority || 'A',
  notes: goal?.notes || '',
});

const parseOptionalGoalSeconds = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return { isValid: true, value: null };

  const parsed = Number(trimmed);
  return {
    isValid: Number.isFinite(parsed) && parsed >= 0,
    value: parsed,
  };
};

const formatGoalSeconds = (value) => (
  typeof value === 'number' && Number.isFinite(value)
    ? `${Number(value.toFixed(3))}s`
    : '--'
);

const PLAN_TASK_CATEGORIES = ['ice', 'dryland', 'strength', 'running', 'mobility', 'recovery', 'video', 'mental', 'competition', 'other'];
const PLAN_TASK_INTENSITIES = ['low', 'medium', 'high'];

const createEmptyPlanForm = () => ({
  title: '',
  focus: '',
  startDate: '',
  endDate: '',
  goalId: '',
  status: 'draft',
});

const createPlanFormFromPlan = (plan) => ({
  title: plan?.title || '',
  focus: plan?.focus || '',
  startDate: plan?.startDate || '',
  endDate: plan?.endDate || '',
  goalId: plan?.goalId || '',
  status: ['draft', 'active'].includes(plan?.status) ? plan.status : 'draft',
});

const createEmptyPlanTaskForm = (date = '') => ({
  date,
  text: '',
  target: '',
  desc: '',
  category: 'other',
  durationMinutes: '',
  intensity: '',
});

const createPlanTaskFormFromTask = (task, date = '') => ({
  date,
  text: task?.text || '',
  target: task?.target || '',
  desc: task?.desc || '',
  category: task?.category || 'other',
  durationMinutes: typeof task?.durationMinutes === 'number' ? String(task.durationMinutes) : '',
  intensity: task?.intensity || '',
});

const parseOptionalPositiveNumber = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return { isValid: true, value: null };

  const parsed = Number(trimmed);
  return {
    isValid: Number.isFinite(parsed) && parsed > 0,
    value: parsed,
  };
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD); 
  const [data, setData] = useState(defaultData);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentDistNames = useMemo(
    () => data.customDistances || (data.language === 'en' ? ['Start', 'Lap', '500m', '777m', '1000m', '1500m'] : ['起跑', '单圈', '500m', '777m', '1000m', '1500m']),
    [data.customDistances, data.language]
  );

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTarget, setNewTaskTarget] = useState('');
  const [newRecordTime, setNewRecordTime] = useState('');
  const [newRecordDate, setNewRecordDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [activeDistance, setActiveDistance] = useState(currentDistNames[0]);
  
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskTarget, setEditTaskTarget] = useState('');

  const [formPointsPerTask, setFormPointsPerTask] = useState(defaultData.pointsPerTask);
  const [formDailyBonus, setFormDailyBonus] = useState(defaultData.dailyBonusPoints);
  const [formDistances, setFormDistances] = useState(currentDistNames);
  const [adjustAmount, setAdjustAmount] = useState(''); // ✨ 新增：家长手动调整积分的输入框状态

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [accountUsername, setAccountUsername] = useState('');

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [activeAcademyAgeIdx, setActiveAcademyAgeIdx] = useState(0);
  const [expandedAcademyModule, setExpandedAcademyModule] = useState(0);
  const [importedWeeklyIds, setImportedWeeklyIds] = useState([]);
  const [importedSingleItemIds, setImportedSingleItemIds] = useState([]); // 新增：控制单项添加的动画状态

  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null); // 新增：控制日历快照弹窗
  const [celebration, setCelebration] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false); // ✨ 新增：成绩管理弹窗开关
  const [showRaceModal, setShowRaceModal] = useState(false); // 🌟 新增：比赛管理弹窗开关
  const [newRaceNameInput, setNewRaceNameInput] = useState(''); // 🌟 新增：新比赛名称暂存
  const [newRaceDateInput, setNewRaceDateInput] = useState(''); // 🌟 新增：新比赛日期暂存
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalForm, setGoalForm] = useState(createEmptyGoalForm);
  const [goalFormError, setGoalFormError] = useState('');
  const [showArchivedGoals, setShowArchivedGoals] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [planForm, setPlanForm] = useState(createEmptyPlanForm);
  const [planFormError, setPlanFormError] = useState('');
  const [showPlanTaskModal, setShowPlanTaskModal] = useState(false);
  const [editingPlanTaskId, setEditingPlanTaskId] = useState(null);
  const [planTaskForm, setPlanTaskForm] = useState(createEmptyPlanTaskForm);
  const [planTaskFormError, setPlanTaskFormError] = useState('');

  // 🛍️ 新增：商店商品管理弹窗状态
  const [showShopItemModal, setShowShopItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎁'); // 默认初始图标
    const [expandedSettingSection, setExpandedSettingSection] = useState(null); // 🌟 新增：高级设置页面折叠面板大脑

  const [carouselCounter, setCarouselCounter] = useState(0);
  const [pbCarouselCounter, setPbCarouselCounter] = useState(0);
  const pbTouchStartX = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    // 只有停留在概览页面时，才开启每5秒自动轮播
    if (activeTab !== 'dashboard') return;
    const timer = setInterval(() => setCarouselCounter(prev => prev + 1), 5000);
    return () => clearInterval(timer);
  }, [activeTab]);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false); 
  const [isCopied, setIsCopied] = useState(false); 
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const statsScrollRef = useRef(null);
  const [statsCanScroll, setStatsCanScroll] = useState({ left: false, right: true });
  const t = translations[data.language || 'zh'];
  const tc = THEMES[data.theme] || THEMES.purple;
  const selectedDistance = currentDistNames.includes(activeDistance) ? activeDistance : currentDistNames[0];
  const currentDateStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

  const handleStatsScroll = () => {
    if (statsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = statsScrollRef.current;
      setStatsCanScroll({
        left: scrollLeft > 2,
        right: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'data') {
      handleStatsScroll();
      const timer = setTimeout(handleStatsScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, data.language, selectedDistance, currentDistNames]);

  const updateData = useCallback(async (newData) => {
    if (!user || !db) return;
    const merged = { ...data, ...newData };
    setData(merged);
    const safeData = JSON.parse(JSON.stringify(merged));
    await saveProfilePatch(db, user.uid, safeData);
  }, [data, user]);

  const openAddGoalModal = () => {
    setEditingGoalId(null);
    setGoalForm(createEmptyGoalForm());
    setGoalFormError('');
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalForm(createGoalFormFromGoal(goal));
    setGoalFormError('');
    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setEditingGoalId(null);
    setGoalForm(createEmptyGoalForm());
    setGoalFormError('');
  };

  const handleGoalFormChange = (field, value) => {
    setGoalForm(prev => ({ ...prev, [field]: value }));
    setGoalFormError('');
  };

  const saveCompetitionGoal = () => {
    const title = goalForm.title.trim();
    const eventName = goalForm.eventName.trim();
    const targetDistance = goalForm.targetDistance.trim();
    const currentTime = parseOptionalGoalSeconds(goalForm.currentTimeSeconds);
    const targetTime = parseOptionalGoalSeconds(goalForm.targetTimeSeconds);

    if (!title) {
      setGoalFormError(t.goalTitleRequired);
      return;
    }

    if (!eventName && !targetDistance) {
      setGoalFormError(t.goalEventRequired);
      return;
    }

    if (!currentTime.isValid || !targetTime.isValid) {
      setGoalFormError(t.goalInvalidTime);
      return;
    }

    if (!['A', 'B', 'C'].includes(goalForm.priority)) {
      setGoalFormError(t.goalInvalidPriority);
      return;
    }

    const patch = {
      title,
      competitionName: goalForm.competitionName.trim(),
      competitionDate: goalForm.competitionDate,
      eventName,
      targetDistance,
      currentTimeSeconds: currentTime.value,
      targetTimeSeconds: targetTime.value,
      priority: goalForm.priority,
      notes: goalForm.notes.trim(),
    };

    const goals = data.competitionGoalsV1 || [];
    const updatedGoals = editingGoalId
      ? goals.map(goal => (
        goal.id === editingGoalId ? updateCompetitionGoal(goal, patch) : goal
      ))
      : [...goals, createCompetitionGoal({ ...patch, status: 'active' })];

    updateData({ competitionGoalsV1: updatedGoals });
    closeGoalModal();
  };

  const archiveGoal = (goal) => {
    const updatedGoals = (data.competitionGoalsV1 || []).map(existingGoal => (
      existingGoal.id === goal.id ? archiveCompetitionGoal(existingGoal) : existingGoal
    ));

    updateData({ competitionGoalsV1: updatedGoals });
  };

  const getSelectableTrainingPlans = () => (
    (data.trainingPlansV1 || []).filter(plan => plan?.status !== 'archived')
  );

  const getDisplayTrainingPlan = () => {
    const plans = data.trainingPlansV1 || [];
    const activePlan = getActiveTrainingPlan(plans, data.activeTrainingPlanId);
    if (activePlan) return activePlan;

    const selectedPlan = plans.find(plan => plan?.id === data.activeTrainingPlanId && plan?.status !== 'archived');
    if (selectedPlan) return selectedPlan;

    return plans.find(plan => plan?.status === 'active' || plan?.status === 'draft') || null;
  };

  const openCreatePlanModal = () => {
    setEditingPlanId(null);
    setPlanForm(createEmptyPlanForm());
    setPlanFormError('');
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan) => {
    setEditingPlanId(plan.id);
    setPlanForm(createPlanFormFromPlan(plan));
    setPlanFormError('');
    setShowPlanModal(true);
  };

  const closePlanModal = () => {
    setShowPlanModal(false);
    setEditingPlanId(null);
    setPlanForm(createEmptyPlanForm());
    setPlanFormError('');
  };

  const handlePlanFormChange = (field, value) => {
    setPlanForm(prev => ({ ...prev, [field]: value }));
    setPlanFormError('');
  };

  const saveTrainingPlan = () => {
    const title = planForm.title.trim();
    const startDate = planForm.startDate;
    const endDate = planForm.endDate;

    if (!title) {
      setPlanFormError(t.planTitleRequired);
      return;
    }

    if (!startDate) {
      setPlanFormError(t.planStartRequired);
      return;
    }

    if (!endDate) {
      setPlanFormError(t.planEndRequired);
      return;
    }

    if (endDate < startDate) {
      setPlanFormError(t.planInvalidDateRange);
      return;
    }

    if (!['draft', 'active'].includes(planForm.status)) {
      setPlanFormError(t.planInvalidStatus);
      return;
    }

    const patch = {
      title,
      focus: planForm.focus.trim(),
      startDate,
      endDate,
      goalId: planForm.goalId || null,
      status: planForm.status,
    };

    const plans = data.trainingPlansV1 || [];
    let nextActivePlanId = data.activeTrainingPlanId || null;
    let updatedPlans;

    if (editingPlanId) {
      updatedPlans = plans.map(plan => (
        plan.id === editingPlanId ? updateTrainingPlan(plan, patch) : plan
      ));
    } else {
      const newPlan = createTrainingPlan(patch);
      updatedPlans = [...plans, newPlan];
      if (!nextActivePlanId) nextActivePlanId = newPlan.id;
    }

    updateData({
      trainingPlansV1: updatedPlans,
      activeTrainingPlanId: nextActivePlanId,
    });
    closePlanModal();
  };

  const selectTrainingPlan = (planId) => {
    updateData({ activeTrainingPlanId: planId || null });
  };

  const archivePlan = (plan) => {
    const updatedPlans = (data.trainingPlansV1 || []).map(existingPlan => (
      existingPlan.id === plan.id ? archiveTrainingPlan(existingPlan) : existingPlan
    ));

    let nextActivePlanId = data.activeTrainingPlanId;
    if (data.activeTrainingPlanId === plan.id) {
      nextActivePlanId = updatedPlans.find(nextPlan => nextPlan?.status !== 'archived')?.id || null;
    }

    updateData({
      trainingPlansV1: updatedPlans,
      activeTrainingPlanId: nextActivePlanId,
    });
  };

  const openAddPlanTaskModal = (plan) => {
    setEditingPlanTaskId(null);
    setPlanTaskForm(createEmptyPlanTaskForm(plan?.startDate || currentDateStr));
    setPlanTaskFormError('');
    setShowPlanTaskModal(true);
  };

  const openEditPlanTaskModal = (task, date) => {
    setEditingPlanTaskId(task.id);
    setPlanTaskForm(createPlanTaskFormFromTask(task, date));
    setPlanTaskFormError('');
    setShowPlanTaskModal(true);
  };

  const closePlanTaskModal = () => {
    setShowPlanTaskModal(false);
    setEditingPlanTaskId(null);
    setPlanTaskForm(createEmptyPlanTaskForm());
    setPlanTaskFormError('');
  };

  const handlePlanTaskFormChange = (field, value) => {
    setPlanTaskForm(prev => ({ ...prev, [field]: value }));
    setPlanTaskFormError('');
  };

  const upsertTaskIntoPlanDays = (days = [], date, task, editingTaskId = null) => {
    const withoutEditedTask = editingTaskId
      ? days.map(day => ({
        ...day,
        tasks: (day.tasks || []).filter(existingTask => existingTask.id !== editingTaskId),
      }))
      : days;

    const existingDay = withoutEditedTask.find(day => day?.date === date);
    if (existingDay) {
      return withoutEditedTask.map(day => (
        day?.date === date
          ? { ...day, tasks: [...(day.tasks || []), task] }
          : day
      ));
    }

    return [
      ...withoutEditedTask,
      {
        date,
        focus: '',
        tasks: [task],
      },
    ].sort((a, b) => (a?.date || '').localeCompare(b?.date || ''));
  };

  const updateTaskInPlan = (planId, taskId, taskUpdater) => {
    const updatedPlans = (data.trainingPlansV1 || []).map(plan => {
      if (plan.id !== planId) return plan;

      return updateTrainingPlan(plan, {
        days: (plan.days || []).map(day => ({
          ...day,
          tasks: (day.tasks || []).map(task => (
            task.id === taskId ? taskUpdater(task) : task
          )),
        })),
      });
    });

    updateData({ trainingPlansV1: updatedPlans });
  };

  const savePlanTask = () => {
    const selectedPlan = getDisplayTrainingPlan();
    if (!selectedPlan) return;

    const date = planTaskForm.date;
    const text = planTaskForm.text.trim();
    const duration = parseOptionalPositiveNumber(planTaskForm.durationMinutes);
    const intensity = planTaskForm.intensity || null;

    if (!date) {
      setPlanTaskFormError(t.planTaskDateRequired);
      return;
    }

    if (!text) {
      setPlanTaskFormError(t.planTaskTextRequired);
      return;
    }

    if (!PLAN_TASK_CATEGORIES.includes(planTaskForm.category)) {
      setPlanTaskFormError(t.planTaskInvalidCategory);
      return;
    }

    if (!duration.isValid) {
      setPlanTaskFormError(t.planTaskInvalidDuration);
      return;
    }

    if (intensity !== null && !PLAN_TASK_INTENSITIES.includes(intensity)) {
      setPlanTaskFormError(t.planTaskInvalidIntensity);
      return;
    }

    const patch = {
      text,
      target: planTaskForm.target.trim() || null,
      desc: planTaskForm.desc.trim() || null,
      category: planTaskForm.category,
      durationMinutes: duration.value,
      intensity,
    };

    const updatedPlans = (data.trainingPlansV1 || []).map(plan => {
      if (plan.id !== selectedPlan.id) return plan;

      let nextTask;
      if (editingPlanTaskId) {
        const existingTask = (plan.days || [])
          .flatMap(day => day?.tasks || [])
          .find(task => task.id === editingPlanTaskId);
        nextTask = existingTask ? updatePlanTask(existingTask, patch) : createPlanTask(patch);
      } else {
        nextTask = createPlanTask(patch);
      }

      return updateTrainingPlan(plan, {
        days: upsertTaskIntoPlanDays(plan.days || [], date, nextTask, editingPlanTaskId),
      });
    });

    updateData({ trainingPlansV1: updatedPlans });
    closePlanTaskModal();
  };

  const togglePlanTaskCompletion = (plan, task, completed) => {
    updateTaskInPlan(plan.id, task.id, currentTask => completePlanTask(currentTask, completed));
  };

  const addPlanTaskToToday = (planTask) => {
    const convertedTask = convertPlanTaskToDailyTask(planTask);
    const existingTasks = data.tasks || [];
    const hasDuplicate = existingTasks.some(task => (
      task?.text === convertedTask.text && (task?.target || null) === (convertedTask.target || null)
    ));

    if (hasDuplicate) {
      alert(t.alreadyInToday);
      return;
    }

    updateData({ tasks: [...existingTasks, convertedTask] });
    alert(t.taskImportedToToday);
  };

  const computedStreak = (() => {
    const days = data.completedDays || [];
    if (days.length === 0) return 0;
    
    const todayStr = currentDateStr;
    const yesterdayStr = getPrevDayStr(todayStr);

    if (!days.includes(todayStr) && !days.includes(yesterdayStr)) return 0;

    let streak = 0;
    let currentCheckStr = days.includes(todayStr) ? todayStr : yesterdayStr;

    while (days.includes(currentCheckStr)) {
      streak++;
      currentCheckStr = getPrevDayStr(currentCheckStr);
    }
    return streak;
  })();

  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auth error:", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const unsub = subscribeToProfile(db, user.uid, (cloudData) => {
      if (cloudData) {
        setData({ ...defaultData, ...cloudData });
        if (cloudData.language) localStorage.setItem('blaze_lang', cloudData.language); // ✨ 缓存云端语言
      } else {
        setData(defaultData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- 核心逻辑：跨天自动清空任务，并生成昨日快照 ---
  useEffect(() => {
    // 如果数据还在加载或者用户未登录，先不执行逻辑
    if (loading || !user) return; 
    
    // 1. 获取今天的日期字符串 (格式：YYYY-MM-DD)
    const todayStr = currentDateStr;
    
    // 2. 逻辑判断：如果记录的“最后登录日期”存在，且“今天”大于“最后登录日期”（防时间倒退/跨时区）
    if (data.lastLoginDate && todayStr > data.lastLoginDate) {
      console.log("检测到时间向前跨天，正在执行自动化清理与备份...");
      
      let updatedHistory = { ...(data.taskHistory || {}) };
      
      // 3. 生成快照：如果最后登录的那天有任务，将其存入历史字典
      if (data.tasks && data.tasks.length > 0) {
        updatedHistory[data.lastLoginDate] = data.tasks;
      }
      
      // 4. 执行云端同步更新
      queueMicrotask(() => {
        updateData({
          tasks: [],               // 清空首页任务列表
          lastLoginDate: todayStr, // 更新最后登录日期为今天
          taskHistory: updatedHistory // 保存历史快照
        });
      });
      
    } else if (!data.lastLoginDate) {
      // 5. 初始化逻辑：如果是第一次使用，记录下今天的日期
      queueMicrotask(() => updateData({ lastLoginDate: todayStr }));
    }
  }, [currentDateStr, data.lastLoginDate, data.taskHistory, data.tasks, loading, updateData, user]); // 关键：监听日期变化

  useEffect(() => {
    queueMicrotask(() => {
      setFormPointsPerTask(data.pointsPerTask ?? 20);
      setFormDailyBonus(data.dailyBonusPoints ?? 50);
      setAccountUsername(data.username || '');
      
      const initialDistances = data.customDistances || (data.language === 'en' ? ['Start', 'Lap', '500m', '777m', '1000m', '1500m'] : ['起跑', '单圈', '500m', '777m', '1000m', '1500m']);
      setFormDistances(initialDistances);
    });
  }, [data.pointsPerTask, data.dailyBonusPoints, data.customDistances, data.language, data.username]);

  const isParentMode = (!data.isPro || !data.parentPin) || isUnlocked;

  const handleLinkAccount = async () => {
    if (!authEmail || !authPassword || authPassword.length < 6) {
      setAuthError(data.language === 'en' ? 'Password must be at least 6 characters' : '密码长度至少为 6 位'); 
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const credential = EmailAuthProvider.credential(authEmail, authPassword);
      await linkWithCredential(auth.currentUser, credential);
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      alert(data.language === 'en' ? "Successfully linked! Your data is now saved." : "绑定成功！您的数据已永久保存。");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use' || error.code === 'auth/credential-already-in-use') {
        const confirmMsg = data.language === 'en' 
          ? "This email is already registered. Would you like to log in to this existing account instead?\n(Note: Current local guest data will be replaced by your cloud data.)"
          : "该邮箱已注册过正式账号。是否直接登录该账号？\n(注意：登录后，当前未保存的游客数据将被云端已有数据覆盖)";
          
        if (window.confirm(confirmMsg)) {
          try {
            await signInWithEmailAndPassword(auth, authEmail, authPassword);
            setShowAuthModal(false);
            setAuthEmail('');
            setAuthPassword('');
            alert(data.language === 'en' ? "Logged in successfully!" : "登录成功！");
          } catch (loginErr) {
            console.error(loginErr);
            setAuthError(data.language === 'en' ? "Login failed: Incorrect password" : "登录失败：密码错误");
          }
        }
      } else if (error.code === 'auth/invalid-email') {
        setAuthError(data.language === 'en' ? "Invalid email format" : "邮箱格式不正确");
      } else {
        setAuthError(data.language === 'en' ? "Failed to connect to authentication server" : "请求失败，请检查网络");
      }
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    const confirmMsg = data.language === 'en' 
      ? "Are you sure you want to log out? You will return to a clean Guest Mode."
      : "确定要退出当前正式账号吗？退出后将重新进入全新的游客模式。";
    if (window.confirm(confirmMsg)) {
      await signOut(auth);
      setShowAccountModal(false);
      setShowProfileModal(false);
      window.location.reload(); 
    }
  };

  const currentDayOfWeek = currentTime.getDay();
  const todayTrainingType = data.weeklyTemplate?.[currentDayOfWeek];

  const toggleTask = (id) => {
    let pointDelta = 0;
    const taskPts = data.pointsPerTask ?? 20;
    const bonusPts = data.dailyBonusPoints ?? 50;
    
    const wasAllCompleted = data.tasks.length > 0 && data.tasks.every(t => t.completed);

    const newTasks = data.tasks.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        pointDelta += isCompleting ? taskPts : -taskPts; 
        return { ...task, completed: isCompleting };
      }
      return task;
    });

    const isAllCompleted = newTasks.length > 0 && newTasks.every(t => t.completed);
    
    let newCompletedDays = [...(data.completedDays || [])];
    const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

    if (!wasAllCompleted && isAllCompleted) {
      pointDelta += bonusPts;
      if (!newCompletedDays.includes(todayStr)) newCompletedDays.push(todayStr);
      setTimeout(() => alert((t.allCompletedAlert || '').replace('{bonus}', bonusPts)), 100);
    } else if (wasAllCompleted && !isAllCompleted) {
      pointDelta -= bonusPts;
      newCompletedDays = newCompletedDays.filter(d => d !== todayStr);
    }

    updateData({ 
      tasks: newTasks, 
      points: Math.max(0, data.points + pointDelta),
      completedDays: newCompletedDays
    });
  };

  // 修改后：增加 desc 参数并存入 task 对象
  const addSpecificTask = (text, target, isTemplate = false, desc = null) => {
    const newTasks = [
      ...data.tasks, 
      { 
        id: createClientId(), 
        text: text.trim(), 
        target: target ? target.trim() : null,
        desc: desc, // 新增：保存动作方法说明
        completed: false, 
        isTemplate: isTemplate 
      }
    ];
    updateData({ tasks: newTasks });
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      addSpecificTask(newTaskText, newTaskTarget, false);
      setNewTaskText('');
      setNewTaskTarget('');
    }
  };

  // 修改后：终极智能匹配版，解决名字顺序颠倒或简写导致的匹配失败问题
  const importAcademyRoutine = (routine, idx) => {
    if (!data.isPro) {
      setShowProModal(true);
      return;
    }
    
    const academyData = BLAZE_ACADEMY[data.language || 'zh'];
    const activeStage = academyData[activeAcademyAgeIdx];

    const newTasksToAdd = routine.tasks.map((taskStr, index) => {
      let matchedItem = null;
      
      // 获取可能的纯动作名 (去掉空格后面的训练量，如 "单脚站立游戏 3组" -> "单脚站立游戏")
      const taskNameShort = taskStr.split(' ')[0];
      
      for (const module of activeStage.modules) {
        for (const item of module.items) {
          // 清除所有特殊符号，仅保留中英文和数字
          const cleanItem = item.name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
          const cleanTask = taskStr.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
          const cleanTaskShort = taskNameShort.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
          
          // 1. 包含匹配 (完整包含 或 短名包含)
          if (cleanItem.includes(cleanTask) || cleanTask.includes(cleanItem) || (cleanTaskShort && cleanItem.includes(cleanTaskShort))) {
            matchedItem = item;
            break;
          }
          
          // 2. 符号拆分匹配 (完美解决 "走胶带线/平衡木" 对应 "走平衡木 / 地板胶带线行走" 的颠倒问题)
          const keywords = taskStr.split(/[/+、，()（）\s]/).filter(k => k.trim().length >= 2);
          if (keywords.some(kw => item.name.includes(kw.trim()))) {
            matchedItem = item;
            break;
          }

          // 3. 提取前三个连续汉字进行极限保底匹配
          const firstThreeZh = taskStr.match(/[\u4e00-\u9fa5]{3}/);
          if (firstThreeZh && item.name.includes(firstThreeZh[0])) {
            matchedItem = item;
            break;
          }
        }
        if (matchedItem) break;
      }

      // 如果匹配成功，强制使用官方库里的名字、目标和说明！
      if (matchedItem) {
        return {
          id: createClientId() + index, 
          text: matchedItem.name,
          target: matchedItem.target, 
          desc: matchedItem.desc,     
          completed: false,
          isTemplate: true
        };
      } else {
        // 如果极其特殊情况没匹配上，依然平滑导入原文本
        const parts = taskStr.split(' ');
        const target = parts.length > 1 ? parts.pop() : '';
        const name = parts.join(' ').trim();
        return {
          id: createClientId() + index,
          text: name,
          target: target || null,
          desc: null,
          completed: false,
          isTemplate: true
        };
      }
    });

    updateData({ tasks: [...(data.tasks || []), ...newTasksToAdd] });

    setImportedWeeklyIds(prev => [...prev, idx]);
    if (navigator.vibrate) navigator.vibrate(50);
    
    setTimeout(() => {
      setImportedWeeklyIds(prev => prev.filter(id => id !== idx));
    }, 2000);
  };

  const importSingleTask = (event, item, uniqueItemId) => {
    event.stopPropagation();
    if (!data.isPro) {
      setShowProModal(true);
      return;
    }

    addSpecificTask(item.name, item.target, true, item.desc);
    setImportedSingleItemIds(prev => [...prev, uniqueItemId]);
    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      setImportedSingleItemIds(prev => prev.filter(id => id !== uniqueItemId));
    }, 2000);
  };

  const deleteTask = (e, id) => {
    e.stopPropagation();
    const newTasks = data.tasks.filter(t => t.id !== id);
    updateData({ tasks: newTasks });
  };

  const startEditTask = (e, task) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditTaskText(task.text);
    setEditTaskTarget(task.target || '');
  };

  const saveEditTask = (e, id) => {
    e.stopPropagation();
    if (!editTaskText.trim()) return;
    const newTasks = data.tasks.map(t => {
      if (t.id === id) {
        return { ...t, text: editTaskText.trim(), target: editTaskTarget.trim() || null };
      }
      return t;
    });
    updateData({ tasks: newTasks });
    setEditingTaskId(null);
  };

  const cancelEditTask = (e) => {
    e.stopPropagation();
    setEditingTaskId(null);
  };

  const addRecord = () => {
    // 自动将 "00:49.543" 转换成纯秒数 49.543 存入数据库
    const time = parseTimeToSeconds(newRecordTime);
    if (time > 0) {
      let dateStr = newRecordDate || `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
      const newRecord = { date: dateStr, time: time };
      
      const key = getRecordsKey(selectedDistance);
      const updatedRecords = [...(data[key] || []), newRecord];
      
      // 🚀 修正：录入成绩不再赠送积分
      updateData({ 
        [key]: updatedRecords
      });
      setNewRecordTime('');
    }
  };

  const buyReward = (reward) => {
    if (data.points >= reward.cost) {
      const newHistoryItem = {
        id: createClientId(),
        name: reward.name,
        icon: reward.icon,
        cost: reward.cost,
        date: new Date().toISOString()
      };
      
      const updatedHistory = [newHistoryItem, ...(data.rewardHistory || [])];

      updateData({ 
        points: data.points - reward.cost,
        rewardHistory: updatedHistory
      });

      setCelebration(reward);
      setTimeout(() => setCelebration(null), 3000);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 250; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        updateData({ avatar: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const DashboardView = () => {
    // 1. 抓取所有未来的比赛
    let upcomingRaces = [...(data.races || [])]
      .filter(r => {
        if (!r.date) return false;
        const raceDate = new Date(r.date.replace(/-/g, '/')); 
        const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
        return raceDate >= today;
      })
      .sort((a, b) => new Date(a.date.replace(/-/g, '/')) - new Date(b.date.replace(/-/g, '/')));

    // 2. 兜底逻辑
    if (upcomingRaces.length === 0 && data.raceDate) {
      const legacyDate = new Date(data.raceDate.replace(/-/g, '/'));
      const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
      if (legacyDate >= today) {
        upcomingRaces.push({ id: 'legacy', name: t.raceDate, date: data.raceDate });
      }
    }

    // 3. 计算当前轮播索引
    const raceCount = upcomingRaces.length || 1;
    const currentRaceIdx = ((carouselCounter % raceCount) + raceCount) % raceCount;

    // 4. 滑动手势监听
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null || upcomingRaces.length <= 1) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;

      if (diff > 50) { // 向左划，看下一场
        setCarouselCounter(prev => prev + 1);
      } else if (diff < -50) { // 向右划，看上一场
        setCarouselCounter(prev => prev - 1);
      }
      touchStartX.current = null;
    };

    const totalTasks = data.tasks?.length || 0;
    const completedTasks = (data.tasks || []).filter(t => t.completed).length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const dayOfWeek = currentTime.getDay(); 
    const startOfWeek = new Date(currentTime);
    startOfWeek.setDate(currentTime.getDate() - dayOfWeek);
    
    const currentWeek = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isCompleted = (data.completedDays || []).includes(dateStr);
      const dDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const todayDateOnly = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()).getTime();
      const isFuture = dDateOnly > todayDateOnly;
      const dayNameBase = t.daysNames?.[i] || '';
      
      currentWeek.push({
        name: dayNameBase,
        nameDisplay: data.language === 'en' ? dayNameBase.substring(0,3) : dayNameBase.replace('周',''),
        isCompleted,
        isFuture,
        isToday: i === dayOfWeek
      });
    }

    // 🏆 抓取所有设置项目中的 PB (个人最好成绩)
    const pbCards = currentDistNames.map(dist => {
      const records = data[getRecordsKey(dist)] || [];
      let bestRecord = null;
      if (records.length > 0) {
        // 核心逻辑：遍历该项目所有成绩，提取时间最小（最快）的那一次
        bestRecord = records.reduce((min, curr) => curr.time < min.time ? curr : min, records[0]);
      }
      return { distance: dist, bestRecord };
    });

    const pbCount = pbCards.length || 1;
    const currentPbIdx = ((pbCarouselCounter % pbCount) + pbCount) % pbCount;

    // 滑动手势监听
    const handlePbTouchStart = (e) => {
      pbTouchStartX.current = e.touches[0].clientX;
    };
    const handlePbTouchEnd = (e) => {
      if (pbTouchStartX.current === null || pbCards.length <= 1) return;
      const diff = pbTouchStartX.current - e.changedTouches[0].clientX;
      if (diff > 40) setPbCarouselCounter(prev => prev + 1); // 左滑看下一个项目
      else if (diff < -40) setPbCarouselCounter(prev => prev - 1); // 右滑看上一个项目
      pbTouchStartX.current = null;
    };

    const hour = currentTime.getHours();
    const greetingIndex =
      hour >= 5 && hour < 9 ? 1 :
      hour >= 9 && hour < 12 ? 2 :
      hour >= 12 && hour < 18 ? 3 :
      hour >= 18 && hour < 23 ? 4 :
      0;

    const safeTips = t.tips || [];
    const dayOfYear = Math.floor((currentTime - new Date(currentTime.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = safeTips.length > 0 ? dayOfYear % safeTips.length : 0;

    return (
      <div className="space-y-4">
        {/* 1. 顶部时间与问候语 */}
        <div className={`${tc.cardBg} p-6 rounded-2xl shadow-sm`}>
          <h2 className={`${tc.textPrimary} opacity-80 text-sm font-semibold flex items-center gap-2`}>
            <Calendar size={16} /> 
            {currentTime.toLocaleDateString(data.language === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </h2>
          <h1 className={`text-2xl font-black ${tc.textHeading} mt-2 tracking-tight leading-snug`}>{t.greetings?.[greetingIndex] || ''}</h1>
        </div>

        {/* 2. 训练锦囊 */}
        {safeTips.length > 0 && (
          <div className={`bg-gradient-to-br ${tc.navActive} border ${tc.borderLight} p-5 rounded-2xl shadow-sm relative overflow-hidden`}>
            <Quote size={80} className={`absolute -right-2 -bottom-2 opacity-5 ${tc.textPrimary} -rotate-12`} />
            <div className={`flex items-center gap-2 mb-2 ${tc.textPrimary}`}>
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-sm font-bold">{t.coachTipTitle}</span>
            </div>
            <p className={`text-sm ${tc.textHeading} font-medium leading-relaxed relative z-10 pr-4`}>
              "{safeTips[tipIndex]}"
            </p>
          </div>
        )}

        {/* 3. 🎯 核心大卡片：MUJI 风格单屏滑动轮播图 */}
        <div 
          className="relative w-full overflow-hidden rounded-3xl shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${currentRaceIdx * 100}%)` }}
          >
            {upcomingRaces.length > 0 ? (
              upcomingRaces.map((race, idx) => {
                const raceDate = new Date(race.date.replace(/-/g, '/'));
                const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                const daysLeft = Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={race.id || idx} className={`w-full shrink-0 p-6 bg-gradient-to-br ${tc.gradientCard} text-white relative`}>
                    <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
                      <Trophy size={110} />
                    </div>
                    <div className="relative z-10 flex justify-between items-end pb-5">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-white/80 font-bold text-xs mb-1">{race.date.replace(/-/g, '/')}</div>
                        <div className="font-black text-xl tracking-tight leading-tight mb-1 truncate">{race.name || t.raceName}</div>
                        <div className="text-white/90 text-xs font-medium opacity-80 truncate">{t.keepGoing}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-0.5">{t.daysToRace}</div>
                        <div className="flex items-baseline gap-0.5 justify-end">
                          <span className="font-black text-4xl">{Math.max(0, daysLeft)}</span>
                          <span className="text-white/80 text-xs font-bold">{t.days}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`w-full shrink-0 p-6 bg-gradient-to-br ${tc.gradientCard} text-white relative flex items-center justify-between`}>
                <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none"><Trophy size={110} /></div>
                <div className="relative z-10 pb-5">
                  <div className="font-black text-lg mb-1">暂无下场赛事安排</div>
                  <div className="text-white/80 text-xs">可前往“数据”页面规划下一个里程碑目标</div>
                </div>
                <Trophy size={32} className="text-white/40 relative z-10 shrink-0 mb-5" />
              </div>
            )}
          </div>

          {/* 🌟 底部小圆点指示器 */}
          {upcomingRaces.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {upcomingRaces.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCarouselCounter(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentRaceIdx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. 今日任务进度条 */}
        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
          <div className="flex justify-between items-end mb-3">
            <h3 className={`text-sm font-bold ${tc.textHeading} flex items-center gap-2`}><CheckCircle2 size={18} className={tc.textPrimary} /> {t.dailyProgress}</h3>
            <span className={`text-xs font-bold ${tc.textMuted}`}>{(t.completedTasks || '').replace('{completed}', completedTasks).replace('{total}', totalTasks)}</span>
          </div>
          <div className={`h-3 w-full ${tc.badgeBg} rounded-full overflow-hidden`}>
            <div 
              className={`h-full bg-gradient-to-r ${tc.gradientIcon} transition-all duration-500 ease-out`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 5. 本周活跃星图 */}
        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
          <h3 className={`text-sm font-bold ${tc.textHeading} mb-4 flex items-center gap-2`}><Flame size={18} className="text-orange-500" /> {t.weeklyActivity}</h3>
          <div className="flex justify-between items-center px-1">
            {currentWeek.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  day.isCompleted ? `bg-gradient-to-br ${tc.gradientIcon} text-white shadow-md scale-110` :
                  day.isFuture ? `${tc.badgeBg} opacity-40 text-gray-400` :
                  day.isToday ? `border-2 ${tc.borderLight} ${tc.textPrimary} bg-white` :
                  `${tc.badgeBg} ${tc.textMuted} opacity-60`
                }`}>
                  {day.isCompleted ? <Flame size={16} /> : <span className="text-[11px] font-bold">{day.nameDisplay?.[0] || ''}</span>}
                </div>
                <span className={`text-[10px] font-bold ${day.isToday ? tc.textPrimary : tc.textMuted}`}>{day.nameDisplay}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 🏆 全项目 PB 荣誉墙 (MUJI风单屏滑动) */}
        <div className={`${tc.cardBg} px-5 pt-5 pb-3 rounded-2xl shadow-sm space-y-3`}>
          <div className={`flex items-center gap-2 ${tc.textMuted}`}>
            <Award size={18} className="text-yellow-500" />
            <span className="text-sm font-bold">{data.language === 'en' ? 'Personal Bests' : '个人最好成绩 (PB)'}</span>
          </div>

          <div 
            className="relative w-full overflow-hidden"
            onTouchStart={handlePbTouchStart}
            onTouchEnd={handlePbTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(-${currentPbIdx * 100}%)` }}
            >
              {pbCards.map((card, idx) => (
                <div key={idx} className="w-full shrink-0 relative pb-5"> {/* pb-5 留出底部胶囊指示器的空间 */}
                  <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex justify-between items-center h-20 transition-all">
                    
                    {/* 左侧：距离与最佳成绩 */}
                    <div className="flex flex-col justify-center">
                      <span className="text-[11px] font-black text-gray-400 tracking-wider mb-0.5 uppercase">{card.distance} PB</span>
                      {card.bestRecord ? (
                        <span className={`text-xl font-black tracking-tighter ${tc.textPrimary} leading-none`}>
                          {formatDisplayTime(card.bestRecord.time)}
                        </span>
                      ) : (
                        <span className="text-xl font-black text-gray-300 leading-none">--:--.---</span>
                      )}
                    </div>
                    
                    {/* 右侧：创造日期或空状态引导 */}
                    <div className="flex flex-col items-end justify-center">
                      {card.bestRecord ? (
                        <div className="bg-white text-gray-500 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                           {(card.bestRecord.date || '').replace(/-/g, '/')}
                        </div>
                      ) : (
                        <div className={`text-[10px] font-bold ${tc.textPrimary} bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm`}>
                          {data.language === 'en' ? 'Go set a record!' : '快去创造记录吧'}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* 🌟 极简 MUJI 风指示器 */}
            {pbCards.length > 1 && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-20">
                {pbCards.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setPbCarouselCounter(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentPbIdx ? `w-4 bg-gray-400 shadow-sm` : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const monthName = viewDate.toLocaleDateString(data.language === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long' });

    return (
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.historyCalendar}</h2>
          <p className={`text-sm ${tc.textMuted} mt-1`}>{t.checkinRecords}</p>
        </div>

        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className={`p-2 ${tc.badgeBg} rounded-lg ${tc.textPrimary} hover:opacity-80 transition-colors`}>
              <ChevronLeft size={20} />
            </button>
            <div className={`font-bold text-lg ${tc.textHeading}`}>{monthName}</div>
            <button onClick={nextMonth} className={`p-2 ${tc.badgeBg} rounded-lg ${tc.textPrimary} hover:opacity-80 transition-colors`}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {(t.daysNames || []).map((day, idx) => (
              <div key={idx} className={`text-center text-xs font-bold ${tc.textMuted}`}>
                {data.language === 'en' ? day.substring(0,3) : day.replace('周','')}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isCompleted = (data.completedDays || []).includes(dateStr);
              const isToday = dateStr === `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

              return (
                <div 
                  key={d} 
                  // ✨ 修改 1：添加点击事件，点击时将当前日期字符串传给状态变量
                  onClick={() => setSelectedHistoryDate(dateStr)} 
                  // ✨ 修改 2：在 className 中加入 cursor-pointer（手型光标）和缩放动画（hover:scale-110 active:scale-95）
                  className={`relative h-10 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                    isCompleted 
                      ? `bg-gradient-to-br ${tc.gradientIcon} text-white shadow-md` 
                      : isToday 
                        ? `border-2 ${tc.borderLight} ${tc.textPrimary}` 
                        : tc.calEmpty
                  }`}
                >
                  <span className="z-10">{d}</span>
                  {isCompleted && <Flame size={20} className="text-yellow-300 absolute opacity-30 bottom-1" />}
                </div>
              );
            })}
          </div>

          <div className={`mt-6 flex items-center justify-center gap-2 text-xs font-bold ${tc.textMuted}`}>
            <div className={`w-3 h-3 rounded-sm bg-gradient-to-br ${tc.gradientIcon}`}></div>
            <span>{t.checkinLegend}</span>
          </div>
        </div>
      </div>
    );
  };

  // 新增：历史任务快照弹窗组件 (完美双语支持版)
  const HistoryDetailModal = () => {
    if (!selectedHistoryDate) return null; 
    
    const historyTasks = (data.taskHistory || {})[selectedHistoryDate] || [];
    const isCompletedDay = (data.completedDays || []).includes(selectedHistoryDate);
    
    const completedCount = historyTasks.filter(t => t.completed).length;
    const totalCount = historyTasks.length;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-5 animate-in fade-in duration-200" onClick={() => setSelectedHistoryDate(null)}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden`} onClick={e => e.stopPropagation()}>
          {/* 弹窗头部 */}
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <CalendarDays size={18} className={tc.textPrimary} />
              {selectedHistoryDate.replace(/-/g, '/')} {data.language === 'en' ? 'Snapshot' : '训练快照'}
            </h3>
            <button onClick={() => setSelectedHistoryDate(null)} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>
          
          {/* 弹窗内容区 */}
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {totalCount === 0 ? (
              <div className={`text-center py-8 text-sm ${tc.textMuted} font-medium`}>
                {data.language === 'en' ? 'No tasks or records for this day 📭' : '当天没有排课或未留下记录 📭'}
              </div>
            ) : (
              <>
                {/* 完成度统计卡片 */}
                <div className="flex justify-between items-center bg-gray-50/50 border border-gray-100 p-4 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold mb-1">
                      {data.language === 'en' ? 'Daily Completion' : '单日完成度'}
                    </span>
                    <span className={`text-xl font-black ${isCompletedDay ? 'text-green-500' : tc.textHeading}`}>
                      {completedCount} / {totalCount}
                    </span>
                  </div>
                  {isCompletedDay ? (
                    <Flame size={32} className="text-orange-500 animate-pulse" />
                  ) : (
                    <Circle size={28} className="text-gray-300" />
                  )}
                </div>
                
                {/* 任务明细列表 */}
                <div className="space-y-2 mt-4">
                  <div className={`text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2 ml-1`}>
                    {data.language === 'en' ? 'Task Details' : '任务明细'}
                  </div>
                  {historyTasks.map((task, idx) => (
                    <div key={idx} className={`p-3 rounded-xl flex items-center gap-3 border ${tc.borderLight} ${task.completed ? 'bg-gray-50/50' : 'bg-white'}`}>
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-gray-300 shrink-0" />
                      )}
                      <div className={`flex-1 min-w-0 flex flex-col`}>
                        <span className={`text-sm font-bold truncate ${task.completed ? 'text-gray-400 line-through' : tc.textHeading}`}>{task.text}</span>
                        {task.target && <span className={`text-[10px] font-bold mt-0.5 ${task.completed ? 'text-gray-400' : tc.textPrimary}`}>{task.target}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TasksView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.todayTraining}</h2>
          <p className={`text-sm ${tc.textMuted} mt-1`}>
            {(t.earnPoints || '').replace('{task}', data.pointsPerTask ?? 20).replace('{bonus}', data.dailyBonusPoints ?? 50)}
          </p>
        </div>
        <div className={`${tc.textPrimary} font-black ${tc.badgeBg} px-4 py-2 rounded-xl text-lg shadow-sm max-w-[50%] truncate text-right`}>
          {String(todayTrainingType || '').split(' (')[data.language === 'en' ? 1 : 0]?.replace(')', '') || todayTrainingType}
        </div>
      </div>

      <div className="space-y-3">
        {(data.tasks || []).map(task => {
          if (editingTaskId === task.id) {
            return (
              <div key={task.id} className={`p-4 ${tc.cardBg} border-2 ${tc.borderLight} rounded-xl shadow-sm flex flex-col gap-3`}>
                <input 
                  type="text" 
                  value={editTaskText}
                  onChange={(e) => setEditTaskText(e.target.value)}
                  className={`w-full ${tc.inputBg} border-2 ${tc.borderLight} rounded-lg px-3 py-2 ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} focus:border-transparent transition-colors`}
                />
                <input 
                  type="text" 
                  value={editTaskTarget}
                  onChange={(e) => setEditTaskTarget(e.target.value)}
                  placeholder={t.optionalTarget}
                  className={`w-full ${tc.inputBg} border-2 ${tc.borderLight} rounded-lg px-3 py-2 text-sm ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} focus:border-transparent transition-colors`}
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button onClick={cancelEditTask} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tc.btnCancel}`}>
                    {t.cancel}
                  </button>
                  <button onClick={(e) => saveEditTask(e, task.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tc.btnPrimary}`}>
                    {t.save}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all ${
                task.completed 
                  ? tc.badgeBg + ' ' + tc.borderLight + ' opacity-60' 
                  : tc.cardBg + ' hover:opacity-80 shadow-sm'
              }`}
            >
              {task.completed ? (
                <CheckCircle2 className={`${tc.checkActive} mr-3 shrink-0`} size={24} />
              ) : (
                <Circle className={`${tc.textMuted} mr-3 shrink-0 opacity-50`} size={24} />
              )}
              {/* 左侧文字与说明区域 */}
              <div className={`flex-1 flex flex-col min-w-0 ${task.completed ? tc.textMuted + ' line-through' : tc.appText}`}>
                <span className="text-base font-medium truncate">{task.text}</span>
                {task.target && (
                  <span className={`text-xs mt-0.5 font-bold truncate ${task.completed ? tc.textMuted : tc.textPrimary}`}>
                    🎯 {t.targetLabel}: {task.target}
                  </span>
                )}
                {/* 新增：如果该任务有动作方法 (desc)，则显示在下方 */}
                {task.desc && (
                  <span className={`text-[11px] mt-1 leading-snug ${task.completed ? tc.textMuted : 'text-gray-500'}`}>
                    {task.desc}
                  </span>
                )}
              </div>
              
              {/* 右侧积分与操作按钮区域 */}
              <div className="flex items-center gap-1 ml-2 shrink-0">
                {!task.completed && (
                  <span className={`text-[10px] ${tc.badgeYellow} px-2 py-1 rounded-md shrink-0 mr-1`}>
                    +{data.pointsPerTask ?? 20}
                  </span>
                )}
                
                {/* 注意：这里已经删除了显示 "模板" 字样的代码段 */}
                
                {isParentMode && !task.completed && (
                  <button 
                    onClick={(e) => startEditTask(e, task)} 
                    className={`p-1.5 ${tc.textMuted} hover:${tc.textPrimary} active:opacity-70 rounded-lg transition-colors`}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {/* 修改：加了 !task.completed 判断，已完成的任务隐藏删除按钮 */}
                {isParentMode && !task.completed && (
                  <button 
                    onClick={(e) => deleteTask(e, task.id)} 
                    className={`p-1.5 ${tc.textMuted} hover:text-red-500 active:opacity-70 rounded-lg transition-colors`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isParentMode && (
        <div className={`flex flex-col gap-3 pt-6`}>
          <div className="flex flex-col gap-2 mt-2">
            <input 
              type="text" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={t.addCustom}
              className={`w-full ${tc.inputBg} border-2 ${tc.borderLight} rounded-xl px-4 py-3 ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} focus:border-transparent transition-colors`}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTaskTarget}
                onChange={(e) => setNewTaskTarget(e.target.value)}
                placeholder={t.optionalTarget}
                className={`flex-1 min-w-0 ${tc.inputBg} border-2 ${tc.borderLight} rounded-xl px-4 py-3 text-sm ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} focus:border-transparent transition-colors`}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button 
                onClick={addTask}
                className={`${tc.btnPrimary} px-5 py-3 rounded-xl shadow-md transition-colors flex items-center justify-center shrink-0`}
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const StatsView = () => {
    const getRecords = () => {
      const key = getRecordsKey(selectedDistance);
      return data[key] || [];
    };

    const rawRecords = getRecords();

    // 🚀 核心修复 1：图表数据严格按照时间戳【正序】排列（老 -> 新）
    const chartRecords = [...rawRecords].sort((a, b) => {
      const timeA = new Date((a.date || '').replace(/-/g, '/')).getTime() || 0;
      const timeB = new Date((b.date || '').replace(/-/g, '/')).getTime() || 0;
      return timeA - timeB; 
    });

    const renderChart = () => {
      if (chartRecords.length === 0) return <div className={`py-6 text-center text-sm ${tc.textMuted}`}>{t.noData}</div>;
      
      const minTime = Math.min(...chartRecords.map(r => r.time)) - 1;
      const maxTime = Math.max(...chartRecords.map(r => r.time)) + 1;
      const range = maxTime - minTime || 1;
      const height = 160;
      const width = 300;
      const padding = 20;

      const pointsStr = chartRecords.map((r, index) => {
        const x = padding + (index * ((width - padding * 2) / (chartRecords.length - 1 || 1)));
        const y = height - padding - ((r.time - minTime) / range) * (height - padding * 2);
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="mt-4 overflow-visible">
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke={tc.svgGrid} strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke={tc.svgGrid} strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke={tc.svgGrid} strokeWidth="1" strokeDasharray="4" />
          
          <polyline points={pointsStr} fill="none" stroke={tc.svgLine} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {chartRecords.map((r, index) => {
            const x = padding + (index * ((width - padding * 2) / (chartRecords.length - 1 || 1)));
            const y = height - padding - ((r.time - minTime) / range) * (height - padding * 2);
            const displayDate = (r.date || '').includes('-') ? (r.date || '').substring(5).replace('-', '/') : (r.date || '');
            
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="4" fill={tc.svgLine} stroke={data.theme==='black'?'#0f172a':'#ffffff'} strokeWidth="2" />
                <text x={x} y={y - 12} fill={tc.svgLine} fontSize="9" fontWeight="bold" textAnchor="middle">{formatDisplayTime(r.time)}</text>
                <text x={x} y={height} fill={data.theme==='black'?'#94a3b8':'#9ca3af'} fontSize="9" textAnchor="middle">{displayDate}</text>
              </g>
            );
          })}
        </svg>
      );
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.statsAndTrends}</h2>
          <p className={`text-sm ${tc.textMuted} mt-1`}>{t.recordMilestones}</p>
        </div>

        <div className="relative flex items-center -mx-1 px-1 py-1">
          {statsCanScroll.left && (
            <button onClick={() => statsScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })} className={`absolute left-0 z-10 p-1.5 rounded-full shadow-md border ${tc.borderLight} ${tc.cardBg} ${tc.textPrimary} hover:opacity-80 transition-all`}>
              <ChevronLeft size={16} />
            </button>
          )}

          <div ref={statsScrollRef} onScroll={handleStatsScroll} className="flex gap-2 overflow-x-auto py-1 no-scrollbar w-full scroll-smooth">
            {currentDistNames.map((dist, idx) => (
              <button key={idx} onClick={() => setActiveDistance(dist)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${(selectedDistance === dist) ? tc.btnPrimary + ' shadow-md' : tc.cardBg + ' ' + tc.textPrimary + ' hover:opacity-80'}`}>
                {dist}
              </button>
            ))}
          </div>

          {statsCanScroll.right && (
            <button onClick={() => statsScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })} className={`absolute right-0 z-10 p-1.5 rounded-full shadow-md border ${tc.borderLight} ${tc.cardBg} ${tc.textPrimary} hover:opacity-80 animate-pulse transition-all`}>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* 净化后的图表展示卡片 */}
        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm relative`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className={`${tc.textHeading} font-bold`}>{selectedDistance} {t.recentRecords}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${tc.badgeBg} ${tc.textPrimary} px-2 py-1 rounded-md`}>
                {t.latest}: {chartRecords.length > 0 ? formatDisplayTime(chartRecords[chartRecords.length - 1].time) : '--:--.---'}
              </span>
              {/* ✨ 呼出弹窗的精美小按钮 */}
              {isParentMode && (
                <button 
                  onClick={() => setShowRecordModal(true)}
                  className={`p-1.5 ${tc.btnPrimary} rounded-lg shadow-sm hover:opacity-80 active:scale-95 transition-all flex items-center justify-center`}
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>
          {renderChart()}
        </div>
        
        {/* 注：原本底部臃肿的成绩输入框已经被彻底移除！转移到了专属弹窗中 */}
      </div>
    );
  };

  // ✨ 新增：成绩管理专属弹窗 (Modal)
  const RecordManagementModal = () => {
    if (!showRecordModal) return null;

    const key = getRecordsKey(selectedDistance);
    const rawRecords = data[key] || [];

    // 🚀 核心修复 2：管理列表严格按照时间戳【倒序】排列（新 -> 老），方便查看和删除最新录入
    const listRecords = [...rawRecords].sort((a, b) => {
      const timeA = new Date((a.date || '').replace(/-/g, '/')).getTime() || 0;
      const timeB = new Date((b.date || '').replace(/-/g, '/')).getTime() || 0;
      return timeB - timeA; 
    });

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowRecordModal(false)}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`} onClick={e => e.stopPropagation()}>
          
          {/* 头部 */}
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <LineChart size={18} className={tc.textPrimary} />
              {selectedDistance} {data.language === 'en' ? 'Records' : '成绩管理'}
            </h3>
            <button onClick={() => setShowRecordModal(false)} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-6">
            {/* 录入区：完美网格布局，解决溢出 */}
            <div>
              <h4 className={`text-xs font-bold ${tc.textMuted} mb-2 ml-1`}>{data.language === 'en' ? 'Add New Record' : '录入新成绩'}</h4>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="date" 
                    value={newRecordDate}
                    onChange={(e) => setNewRecordDate(e.target.value)}
                    className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
                  />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={newRecordTime}
                    onChange={(e) => setNewRecordTime(formatTimeInput(e.target.value))}
                    placeholder="00:00.000"
                    className={`w-full ${tc.inputBg} rounded-xl px-3 py-3.5 text-sm font-bold tracking-widest ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all text-center`}
                  />
                </div>
                <button 
                  onClick={addRecord}
                  className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all`}
                >
                  {t.save}
                </button>
              </div>
            </div>

            {/* 列表区：倒序展示，支持删除 */}
            {listRecords.length > 0 && (
              <div className="pt-2">
                <div className={`text-xs font-bold ${tc.textMuted} mb-2 flex justify-between items-center px-1`}>
                  <span>{data.language === 'en' ? 'History' : '历史记录'}</span>
                </div>
                <div className="space-y-2">
                  {listRecords.map((r, idx) => (
                    <div key={idx} className={`flex justify-between items-center ${tc.badgeBg} bg-opacity-30 p-3 rounded-xl border ${tc.borderLight}`}>
                      <div className="flex flex-col">
                        <span className={`font-black text-lg tracking-tight ${tc.textPrimary}`}>{formatDisplayTime(r.time)}</span>
                        <span className={`text-[10px] font-bold ${tc.textMuted}`}>{(r.date || '').replace(/-/g, '/')}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const confirmMsg = data.language === 'en' ? 'Delete this record?' : '确定要删除这条成绩吗？';
                          if (window.confirm(confirmMsg)) {
                            const key = getRecordsKey(selectedDistance);
                            // 用时间戳和分数精准定位删除项，防止误删同分数据
                            const updatedRecords = rawRecords.filter(item => 
                              item.time !== r.time || item.date !== r.date
                            );
                            updateData({ [key]: updatedRecords });
                          }
                        }}
                        className={`p-2.5 bg-white text-gray-400 hover:text-red-500 shadow-sm border ${tc.borderLight} active:scale-90 rounded-xl transition-all`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🌟 新增：比赛目标专属管理弹窗 (Modal) - 直连云端版
  const RaceManagementModal = () => {
    if (!showRaceModal) return null;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowRaceModal(false)}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <Trophy size={18} className={tc.textPrimary} />
              {data.language === 'en' ? 'Add Race Target' : '添加比赛目标'}
            </h3>
            <button onClick={() => setShowRaceModal(false)} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4 text-left">
            <div className="space-y-3">
              <div>
                <label className={`text-xs font-bold ${tc.textMuted} ml-1 mb-1 block`}>{t.raceName}</label>
                <input 
                  type="text" 
                  value={newRaceNameInput}
                  onChange={(e) => setNewRaceNameInput(e.target.value)}
                  placeholder={data.language === 'en' ? 'e.g. 2027 MASA ST Championship' : '例如：2027 MASA 短道锦标赛'}
                  className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold ${tc.textMuted} ml-1 mb-1 block`}>{data.language === 'en' ? 'Race Date' : '比赛日期'}</label>
                <input 
                  type="date" 
                  value={newRaceDateInput}
                  onChange={(e) => setNewRaceDateInput(e.target.value)}
                  className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (newRaceNameInput.trim() && newRaceDateInput) {
                  // ✨ 核心变更：不再存入本地变量，直接追加并推送云端
                  const currentRaces = data.races || (data.raceDate ? [{ id: 'legacy', name: t.raceDate, date: data.raceDate }] : []);
                  updateData({ races: [...currentRaces, { id: createClientId(), name: newRaceNameInput.trim(), date: newRaceDateInput }] });
                  setNewRaceNameInput('');
                  setNewRaceDateInput('');
                  setShowRaceModal(false);
                } else {
                  alert(data.language === 'en' ? 'Please fill in both name and date!' : '请完整填写比赛名称和日期！');
                }
              }}
              className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all`}
            >
              {data.language === 'en' ? 'Add Race' : '添加比赛'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 🛍️ 新增：商店商品录入管理弹窗 (Modal) - 直连云端版
  const ShopItemManagementModal = () => {
    if (!showShopItemModal) return null;
    const emojiList = ['🎁', '🎮', '🍦', '🍿', '🧸', '⛸️', '🎫', '🎬', '🏆', '🍔', '🛒', '⚡'];

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowShopItemModal(false)}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <ShoppingCart size={18} className={tc.textPrimary} />
              {data.language === 'en' ? 'Add New Item' : '添加新商品'}
            </h3>
            <button onClick={() => setShowShopItemModal(false)} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-5 text-left">
            <div>
              <label className={`text-xs font-bold ${tc.textMuted} ml-1 mb-2 block`}>{data.language === 'en' ? 'Select Icon' : '挑选图标'}</label>
              <div className="grid grid-cols-6 gap-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                {emojiList.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-xl transition-all ${selectedEmoji === emoji ? 'bg-white shadow-md scale-110 ring-2 ' + tc.focusRing : 'hover:bg-white/50 opacity-60'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={data.language === 'en' ? 'Item Name (e.g. Extra Game Time)' : '商品名称 (如：周末冰淇淋)'}
                className={`w-full ${tc.inputBg} rounded-xl px-4 py-3.5 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
              <div className="relative">
                <input 
                  type="number" 
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(e.target.value)}
                  placeholder={data.language === 'en' ? 'Points Required' : '所需积分'}
                  className={`w-full ${tc.inputBg} rounded-xl px-4 py-3.5 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all pl-10`}
                />
                <Zap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-yellow-500" />
              </div>
            </div>
            
            <button 
              onClick={() => {
                if (newItemName.trim() && newItemCost) {
                  // ✨ 核心变更：不再存入本地变量，直接追加并推送云端
                  updateData({ customRewards: [...(data.customRewards || []), { id: createClientId(), name: newItemName.trim(), cost: parseInt(newItemCost), icon: selectedEmoji }] });
                  setNewItemName('');
                  setNewItemCost('');
                  setShowShopItemModal(false);
                }
              }}
              className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all`}
            >
              {data.language === 'en' ? 'Add Item' : '添加商品'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const GoalsView = () => {
    const goals = data.competitionGoalsV1 || [];
    const activeGoals = sortGoalsByPriorityAndDate(getActiveCompetitionGoals(goals));
    const archivedGoals = sortGoalsByPriorityAndDate(goals.filter(goal => goal?.status === 'archived'));

    const GoalCard = ({ goal, isArchived = false }) => {
      const progress = getGoalProgress(goal);
      const gap = getGoalGap(goal);
      const achieved = progress === 100;

      return (
        <div className={`${tc.cardBg} rounded-2xl shadow-sm border ${tc.borderLight} p-5 space-y-4 ${isArchived ? 'opacity-70' : ''}`}>
          <div className="flex justify-between gap-3 items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${goal.priority === 'A' ? 'bg-red-50 text-red-600 border border-red-100' : goal.priority === 'B' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {t.priority} {goal.priority}
                </span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${achieved ? 'bg-green-50 text-green-600 border border-green-100' : tc.badgeBg + ' ' + tc.textPrimary}`}>
                  {achieved ? t.achieved : goal.status}
                </span>
              </div>
              <h2 className={`text-lg font-black ${tc.textHeading} leading-tight truncate`}>{goal.title}</h2>
              <p className={`text-xs ${tc.textMuted} font-bold mt-1 truncate`}>
                {goal.competitionName || '--'} · {(goal.competitionDate || '').replace(/-/g, '/') || '--'}
              </p>
            </div>
            {!isArchived && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEditGoalModal(goal)}
                  className={`p-2 ${tc.badgeBg} ${tc.textPrimary} rounded-xl active:scale-95 transition-all`}
                  aria-label={t.editGoal}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => archiveGoal(goal)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all"
                  aria-label={t.archiveGoal}
                >
                  <Archive size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`${tc.badgeBg} bg-opacity-40 rounded-xl p-3`}>
              <div className={`text-[10px] font-black uppercase ${tc.textMuted}`}>{t.eventName}</div>
              <div className={`text-sm font-black ${tc.textHeading} mt-1 truncate`}>{goal.eventName || '--'}</div>
            </div>
            <div className={`${tc.badgeBg} bg-opacity-40 rounded-xl p-3`}>
              <div className={`text-[10px] font-black uppercase ${tc.textMuted}`}>{t.targetDistance}</div>
              <div className={`text-sm font-black ${tc.textHeading} mt-1 truncate`}>{goal.targetDistance || '--'}</div>
            </div>
            <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100">
              <div className="text-[10px] font-black uppercase text-gray-400">{t.currentTimeSeconds}</div>
              <div className={`text-sm font-black ${tc.textHeading} mt-1`}>{formatGoalSeconds(goal.currentTimeSeconds)}</div>
            </div>
            <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-100">
              <div className="text-[10px] font-black uppercase text-gray-400">{t.targetTimeSeconds}</div>
              <div className={`text-sm font-black ${tc.textHeading} mt-1`}>{formatGoalSeconds(goal.targetTimeSeconds)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`${achieved ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'} rounded-xl p-3 border`}>
              <div className="text-[10px] font-black uppercase opacity-70">{t.gap}</div>
              <div className="text-lg font-black mt-0.5">
                {typeof gap === 'number' ? `${gap > 0 ? '+' : ''}${Number(gap.toFixed(3))}s` : '--'}
              </div>
            </div>
            <div className={`${tc.badgeBg} rounded-xl p-3`}>
              <div className={`text-[10px] font-black uppercase ${tc.textMuted}`}>{t.progress}</div>
              <div className={`text-lg font-black ${tc.textPrimary} mt-0.5`}>{progress === null ? '--' : `${progress}%`}</div>
            </div>
          </div>

          {goal.notes && (
            <div className="bg-white/60 border border-gray-100 rounded-xl p-3">
              <div className={`text-[10px] font-black uppercase ${tc.textMuted} mb-1`}>{t.notes}</div>
              <p className={`text-xs leading-relaxed ${tc.appText}`}>{goal.notes}</p>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.goalsTitle}</h2>
            <p className={`text-sm ${tc.textMuted} mt-1`}>{t.goalsSubtitle}</p>
          </div>
          <button
            onClick={openAddGoalModal}
            className={`${tc.btnPrimary} px-4 py-3 rounded-xl shadow-md font-bold text-sm flex items-center gap-2 shrink-0 active:scale-95 transition-all`}
          >
            <Plus size={18} /> {t.addGoal}
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className={`${tc.cardBg} p-8 rounded-2xl shadow-sm border ${tc.borderLight} text-center space-y-4`}>
            <div className={`w-16 h-16 mx-auto rounded-2xl ${tc.badgeBg} flex items-center justify-center ${tc.textPrimary}`}>
              <Target size={30} />
            </div>
            <div>
              <h3 className={`font-black ${tc.textHeading}`}>{t.noGoals}</h3>
              <p className={`text-sm ${tc.textMuted} mt-1`}>{t.goalsSubtitle}</p>
            </div>
            <button
              onClick={openAddGoalModal}
              className={`${tc.btnPrimary} px-5 py-3 rounded-xl shadow-md font-bold text-sm inline-flex items-center gap-2 active:scale-95 transition-all`}
            >
              <Plus size={18} /> {t.addGoal}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}

        {archivedGoals.length > 0 && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setShowArchivedGoals(prev => !prev)}
              className={`w-full flex items-center justify-between ${tc.cardBg} border ${tc.borderLight} rounded-2xl p-4 shadow-sm`}
            >
              <span className={`font-black ${tc.textHeading}`}>{t.archivedGoals} ({archivedGoals.length})</span>
              <span className={`text-xs font-bold ${tc.textPrimary}`}>
                {showArchivedGoals ? t.hideArchived : t.showArchived}
              </span>
            </button>
            {showArchivedGoals && (
              <div className="space-y-3">
                {archivedGoals.map(goal => <GoalCard key={goal.id} goal={goal} isArchived />)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const GoalManagementModal = () => {
    if (!showGoalModal) return null;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={closeGoalModal}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]`} onClick={e => e.stopPropagation()}>
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <Target size={18} className={tc.textPrimary} />
              {editingGoalId ? t.editGoal : t.addGoal}
            </h3>
            <button onClick={closeGoalModal} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4">
            <input
              type="text"
              value={goalForm.title}
              onChange={(e) => handleGoalFormChange('title', e.target.value)}
              placeholder={t.goalTitlePlaceholder}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
            />

            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={goalForm.competitionName}
                onChange={(e) => handleGoalFormChange('competitionName', e.target.value)}
                placeholder={t.competitionName}
                className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
              <input
                type="date"
                value={goalForm.competitionDate}
                onChange={(e) => handleGoalFormChange('competitionDate', e.target.value)}
                className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={goalForm.eventName}
                onChange={(e) => handleGoalFormChange('eventName', e.target.value)}
                placeholder={t.eventName}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
              <div>
                <input
                  type="text"
                  list="goal-distance-options"
                  value={goalForm.targetDistance}
                  onChange={(e) => handleGoalFormChange('targetDistance', e.target.value)}
                  placeholder={t.targetDistance}
                  className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
                />
                <datalist id="goal-distance-options">
                  {currentDistNames.map(dist => <option key={dist} value={dist} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.001"
                value={goalForm.currentTimeSeconds}
                onChange={(e) => handleGoalFormChange('currentTimeSeconds', e.target.value)}
                placeholder={t.currentTimeSeconds}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
              <input
                type="number"
                min="0"
                step="0.001"
                value={goalForm.targetTimeSeconds}
                onChange={(e) => handleGoalFormChange('targetTimeSeconds', e.target.value)}
                placeholder={t.targetTimeSeconds}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
            </div>

            <div>
              <label className={`text-xs font-black ${tc.textMuted} ml-1 mb-2 block`}>{t.priority}</label>
              <div className="grid grid-cols-3 gap-2">
                {['A', 'B', 'C'].map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleGoalFormChange('priority', priority)}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all ${goalForm.priority === priority ? tc.btnPrimary + ' shadow-md' : tc.badgeBg + ' ' + tc.textPrimary}`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={goalForm.notes}
              onChange={(e) => handleGoalFormChange('notes', e.target.value)}
              placeholder={t.goalNotesPlaceholder}
              rows={3}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-medium ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all resize-none`}
            />

            {goalFormError && (
              <div className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                {goalFormError}
              </div>
            )}
          </div>

          <div className={`p-5 border-t ${tc.borderLight} ${tc.appBg}`}>
            <button
              onClick={saveCompetitionGoal}
              className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all`}
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TrainingPlanView = () => {
    const plans = data.trainingPlansV1 || [];
    const selectablePlans = getSelectableTrainingPlans();
    const activePlans = getActiveTrainingPlans(plans);
    const selectedPlan = getDisplayTrainingPlan();
    const linkedGoal = selectedPlan?.goalId
      ? (data.competitionGoalsV1 || []).find(goal => goal.id === selectedPlan.goalId)
      : null;
    const completion = selectedPlan
      ? getWeeklyPlanCompletion(selectedPlan)
      : { completedTasks: 0, totalTasks: 0, completionPercent: 0 };
    const sortedDays = [...(selectedPlan?.days || [])].sort((a, b) => (a?.date || '').localeCompare(b?.date || ''));

    const PlanTaskCard = ({ plan, day, task }) => (
      <div className={`${task.completed ? tc.badgeBg + ' opacity-70' : 'bg-white/80'} border ${tc.borderLight} rounded-xl p-3 space-y-3`}>
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => togglePlanTaskCompletion(plan, task, !task.completed)}
            className="pt-0.5 shrink-0"
            aria-label={task.completed ? 'Uncomplete plan task' : 'Complete plan task'}
          >
            {task.completed ? (
              <CheckCircle2 size={22} className={tc.checkActive} />
            ) : (
              <Circle size={22} className={`${tc.textMuted} opacity-60`} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className={`font-black text-sm leading-tight ${task.completed ? tc.textMuted + ' line-through' : tc.textHeading}`}>
              {task.text}
            </div>
            {task.target && (
              <div className={`text-[11px] font-bold mt-1 ${tc.textPrimary}`}>
                {t.targetLabel}: {task.target}
              </div>
            )}
            {task.desc && (
              <p className={`text-[11px] leading-relaxed mt-1 ${tc.textMuted}`}>{task.desc}</p>
            )}
          </div>

          <button
            onClick={() => openEditPlanTaskModal(task, day.date)}
            className={`p-1.5 ${tc.badgeBg} ${tc.textPrimary} rounded-lg shrink-0 active:scale-95 transition-all`}
            aria-label={t.editPlanTask}
          >
            <Edit2 size={15} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-black">
          <span className={`${tc.badgeBg} ${tc.textPrimary} px-2 py-1 rounded-lg`}>{task.category || 'other'}</span>
          {task.durationMinutes && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{task.durationMinutes} min</span>}
          {task.intensity && <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">{task.intensity}</span>}
          {task.completedAt && (
            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg">
              {t.completedAt}: {new Date(task.completedAt).toLocaleDateString(data.language === 'en' ? 'en-US' : 'zh-CN')}
            </span>
          )}
        </div>

        {!task.completed && (
          <button
            onClick={() => addPlanTaskToToday(task)}
            className={`w-full ${tc.btnCancel} py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all`}
          >
            <Plus size={14} /> {t.addToToday}
          </button>
        )}
      </div>
    );

    return (
      <div className="space-y-6 pb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.plansTitle}</h2>
            <p className={`text-sm ${tc.textMuted} mt-1`}>{t.plansSubtitle}</p>
          </div>
          <button
            onClick={openCreatePlanModal}
            className={`${tc.btnPrimary} px-4 py-3 rounded-xl shadow-md font-bold text-sm flex items-center gap-2 shrink-0 active:scale-95 transition-all`}
          >
            <Plus size={18} /> {t.createPlan}
          </button>
        </div>

        {selectablePlans.length === 0 ? (
          <div className={`${tc.cardBg} p-8 rounded-2xl shadow-sm border ${tc.borderLight} text-center space-y-4`}>
            <div className={`w-16 h-16 mx-auto rounded-2xl ${tc.badgeBg} flex items-center justify-center ${tc.textPrimary}`}>
              <CalendarDays size={30} />
            </div>
            <div>
              <h3 className={`font-black ${tc.textHeading}`}>{t.noPlans}</h3>
              <p className={`text-sm ${tc.textMuted} mt-1`}>{t.plansSubtitle}</p>
            </div>
            <button
              onClick={openCreatePlanModal}
              className={`${tc.btnPrimary} px-5 py-3 rounded-xl shadow-md font-bold text-sm inline-flex items-center gap-2 active:scale-95 transition-all`}
            >
              <Plus size={18} /> {t.createPlan}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {selectablePlans.length > 1 && (
              <div className={`${tc.cardBg} border ${tc.borderLight} rounded-2xl p-4 shadow-sm space-y-2`}>
                <label className={`text-xs font-black ${tc.textMuted} uppercase`}>{t.selectPlan}</label>
                <select
                  value={selectedPlan?.id || ''}
                  onChange={(e) => selectTrainingPlan(e.target.value)}
                  className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
                >
                  {selectablePlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.title}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedPlan && (
              <>
                <div className={`relative overflow-hidden bg-gradient-to-br ${tc.gradientCard} rounded-[2rem] p-6 text-white shadow-lg space-y-5`}>
                  <CalendarDays size={120} className="absolute -right-5 -bottom-8 opacity-10 pointer-events-none" />
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase opacity-75 mb-1">
                        {t.activePlan} · {selectedPlan.status}
                      </div>
                      <h3 className="text-2xl font-black leading-tight truncate">{selectedPlan.title}</h3>
                      <p className="text-sm font-medium opacity-85 mt-1">{selectedPlan.focus || t.focus}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditPlanModal(selectedPlan)}
                        className="p-2 bg-white/20 rounded-xl active:scale-95 transition-all"
                        aria-label={t.editPlan}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => archivePlan(selectedPlan)}
                        className="p-2 bg-white/20 rounded-xl active:scale-95 transition-all"
                        aria-label={t.archivePlan}
                      >
                        <Archive size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-2 gap-3">
                    <div className="bg-white/15 rounded-2xl p-3">
                      <div className="text-[10px] font-black uppercase opacity-70">{t.startDate}</div>
                      <div className="text-sm font-black mt-1">{(selectedPlan.startDate || '').replace(/-/g, '/') || '--'}</div>
                    </div>
                    <div className="bg-white/15 rounded-2xl p-3">
                      <div className="text-[10px] font-black uppercase opacity-70">{t.endDate}</div>
                      <div className="text-sm font-black mt-1">{(selectedPlan.endDate || '').replace(/-/g, '/') || '--'}</div>
                    </div>
                    <div className="bg-white/15 rounded-2xl p-3">
                      <div className="text-[10px] font-black uppercase opacity-70">{t.weeklyCompletion}</div>
                      <div className="text-sm font-black mt-1">
                        {completion.completedTasks}/{completion.totalTasks} · {completion.completionPercent}%
                      </div>
                    </div>
                    <div className="bg-white/15 rounded-2xl p-3">
                      <div className="text-[10px] font-black uppercase opacity-70">{t.linkedGoal}</div>
                      <div className="text-sm font-black mt-1 truncate">{linkedGoal?.title || '--'}</div>
                    </div>
                  </div>

                  {activePlans.length > 0 && (
                    <div className="relative z-10 text-[10px] font-bold opacity-75">
                      {activePlans.length} {data.language === 'en' ? 'active plan(s)' : '个进行中计划'}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <h3 className={`font-black ${tc.textHeading}`}>{data.language === 'en' ? 'Plan Tasks' : '计划任务'}</h3>
                  <button
                    onClick={() => openAddPlanTaskModal(selectedPlan)}
                    className={`${tc.btnPrimary} px-4 py-2.5 rounded-xl shadow-sm font-bold text-xs flex items-center gap-2 active:scale-95 transition-all`}
                  >
                    <Plus size={16} /> {t.addPlanTask}
                  </button>
                </div>

                {sortedDays.length === 0 ? (
                  <div className={`${tc.cardBg} border ${tc.borderLight} rounded-2xl p-6 text-center`}>
                    <p className={`text-sm font-bold ${tc.textMuted}`}>{data.language === 'en' ? 'No tasks in this plan yet.' : '这个计划里还没有任务。'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedDays.map(day => (
                      <div key={day.date} className={`${tc.cardBg} border ${tc.borderLight} rounded-2xl p-4 shadow-sm space-y-3`}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className={`font-black ${tc.textHeading}`}>{(day.date || '').replace(/-/g, '/')}</h4>
                            {day.focus && <p className={`text-xs ${tc.textMuted} font-bold mt-0.5`}>{day.focus}</p>}
                          </div>
                          <span className={`text-[10px] font-black ${tc.badgeBg} ${tc.textPrimary} px-2 py-1 rounded-lg`}>
                            {(day.tasks || []).filter(task => task.completed).length}/{(day.tasks || []).length}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {(day.tasks || []).map(task => (
                            <PlanTaskCard key={task.id} plan={selectedPlan} day={day} task={task} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const PlanManagementModal = () => {
    if (!showPlanModal) return null;

    const activeGoals = sortGoalsByPriorityAndDate(getActiveCompetitionGoals(data.competitionGoalsV1 || []));

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={closePlanModal}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]`} onClick={e => e.stopPropagation()}>
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <CalendarDays size={18} className={tc.textPrimary} />
              {editingPlanId ? t.editPlan : t.createPlan}
            </h3>
            <button onClick={closePlanModal} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4">
            <input
              type="text"
              value={planForm.title}
              onChange={(e) => handlePlanFormChange('title', e.target.value)}
              placeholder={t.planTitlePlaceholder}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
            />
            <input
              type="text"
              value={planForm.focus}
              onChange={(e) => handlePlanFormChange('focus', e.target.value)}
              placeholder={t.focus}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={planForm.startDate}
                onChange={(e) => handlePlanFormChange('startDate', e.target.value)}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
              <input
                type="date"
                value={planForm.endDate}
                onChange={(e) => handlePlanFormChange('endDate', e.target.value)}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
            </div>

            <select
              value={planForm.goalId}
              onChange={(e) => handlePlanFormChange('goalId', e.target.value)}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
            >
              <option value="">{t.noLinkedGoal}</option>
              {activeGoals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>

            <div>
              <label className={`text-xs font-black ${tc.textMuted} ml-1 mb-2 block`}>{t.status}</label>
              <div className="grid grid-cols-2 gap-2">
                {['draft', 'active'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handlePlanFormChange('status', status)}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all ${planForm.status === status ? tc.btnPrimary + ' shadow-md' : tc.badgeBg + ' ' + tc.textPrimary}`}
                  >
                    {status === 'active' ? t.active : t.draft}
                  </button>
                ))}
              </div>
            </div>

            {planFormError && (
              <div className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                {planFormError}
              </div>
            )}
          </div>

          <div className={`p-5 border-t ${tc.borderLight} ${tc.appBg}`}>
            <button
              onClick={saveTrainingPlan}
              className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all`}
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PlanTaskManagementModal = () => {
    if (!showPlanTaskModal) return null;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={closePlanTaskModal}>
        <div className={`${tc.cardBg} w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]`} onClick={e => e.stopPropagation()}>
          <div className={`p-4 border-b ${tc.borderLight} flex justify-between items-center ${tc.badgeBg}`}>
            <h3 className={`font-black ${tc.textHeading} flex items-center gap-2`}>
              <ListTodo size={18} className={tc.textPrimary} />
              {editingPlanTaskId ? t.editPlanTask : t.addPlanTask}
            </h3>
            <button onClick={closePlanTaskModal} className={`p-1 ${tc.textMuted} hover:text-red-500 rounded-lg transition-colors`}>
              <X size={20} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-4">
            <input
              type="date"
              value={planTaskForm.date}
              onChange={(e) => handlePlanTaskFormChange('date', e.target.value)}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
            />
            <input
              type="text"
              value={planTaskForm.text}
              onChange={(e) => handlePlanTaskFormChange('text', e.target.value)}
              placeholder={t.planTaskTextPlaceholder}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
            />
            <input
              type="text"
              value={planTaskForm.target}
              onChange={(e) => handlePlanTaskFormChange('target', e.target.value)}
              placeholder={t.optionalTarget}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
            />
            <textarea
              value={planTaskForm.desc}
              onChange={(e) => handlePlanTaskFormChange('desc', e.target.value)}
              placeholder={t.notes}
              rows={3}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-medium ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all resize-none`}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={planTaskForm.category}
                onChange={(e) => handlePlanTaskFormChange('category', e.target.value)}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
              >
                {PLAN_TASK_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={planTaskForm.durationMinutes}
                onChange={(e) => handlePlanTaskFormChange('durationMinutes', e.target.value)}
                placeholder={t.durationMinutes}
                className={`w-full ${tc.inputBg} rounded-xl px-3 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing} transition-all`}
              />
            </div>

            <select
              value={planTaskForm.intensity}
              onChange={(e) => handlePlanTaskFormChange('intensity', e.target.value)}
              className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
            >
              <option value="">{t.intensity}</option>
              {PLAN_TASK_INTENSITIES.map(intensity => (
                <option key={intensity} value={intensity}>{intensity}</option>
              ))}
            </select>

            {planTaskFormError && (
              <div className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                {planTaskFormError}
              </div>
            )}
          </div>

          <div className={`p-5 border-t ${tc.borderLight} ${tc.appBg}`}>
            <button
              onClick={savePlanTask}
              className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-all`}
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DataView = () => {
    return (
      <div className="space-y-10">
        {CalendarView()}
        <div className={`w-full h-px ${tc.borderLight} border-t-2 border-dashed`}></div>
        {StatsView()}
      </div>
    );
  };

  const ShopView = () => {
    // 同步展示排序后的商品，让用户一眼看到从易到难的奖励
    const sortedRewards = [...(data.customRewards || [])].sort((a, b) => a.cost - b.cost);

    return (
      <div className="space-y-8 pb-4">
        {/* 顶部：资产看板 */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${tc.gradientCard} rounded-[2rem] p-6 text-white shadow-lg`}>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight">{t.rewardShop}</h2>
              <p className="text-xs font-bold opacity-80 mt-1 uppercase tracking-widest">{t.treatYourself}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase opacity-70 mb-1">{t.availablePoints}</span>
              <div className="flex items-center gap-1.5">
                <Trophy size={20} className="text-yellow-300" />
                <span className="text-3xl font-black">{data.points}</span>
              </div>
            </div>
          </div>
          {/* 背景装饰图案 */}
          <ShoppingCart size={140} className="absolute -right-6 -bottom-6 opacity-10 -rotate-12 pointer-events-none" />
          
          <button 
            onClick={() => setShowHistory(true)} 
            className="mt-6 w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Clock size={14} /> {t.rewardHistory}
          </button>
        </div>

        {/* 商品网格橱窗 */}
        <div className="grid grid-cols-2 gap-4">
          {sortedRewards.map(reward => {
            const canAfford = data.points >= reward.cost;
            const isLocked = !data.isPro;

            return (
              <div key={reward.id} className={`${tc.cardBg} rounded-[2rem] p-1 shadow-sm border ${tc.borderLight} transition-all active:scale-[0.98]`}>
                <div className="flex flex-col items-center text-center p-4">
                  {/* 图标容器 */}
                  <div className={`w-20 h-20 rounded-3xl ${tc.badgeBg} flex items-center justify-center text-4xl mb-4 relative shadow-inner`}>
                    {reward.icon}
                    {isLocked && <Crown size={12} className="absolute top-2 right-2 text-yellow-500 animate-pulse" />}
                  </div>

                  {/* 名称 */}
                  <div className={`font-black ${tc.textHeading} text-sm leading-tight h-10 flex items-center px-1 mb-2`}>
                    {reward.name}
                  </div>

                  {/* 价格标签 */}
                  <div className={`flex items-center gap-1 mb-4 px-3 py-1 rounded-full ${canAfford ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                    <Zap size={12} className={canAfford ? 'fill-yellow-500' : ''} />
                    <span className="text-xs font-black">{reward.cost}</span>
                  </div>

                  {/* 兑换按钮 */}
                  <button 
                    onClick={() => isLocked ? setShowProModal(true) : buyReward(reward)}
                    disabled={!isLocked && !canAfford}
                    className={`w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      isLocked 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : canAfford 
                          ? tc.btnPrimary + ' shadow-md' 
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isLocked ? 'Unlock PRO' : canAfford ? t.redeem : t.notEnough}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    // 🗑️ 注意：曾经臃肿的 handleSaveSettings 函数已经被彻底消灭！

    const handleSetPin = () => {
      if (/^\d{4}$/.test(pinInput)) {
        updateData({ parentPin: pinInput });
        setIsUnlocked(true);
        setPinInput('');
        setPinError('');
      } else {
        setPinError(t.pinLengthError);
      }
    };

    const handleUnlock = () => {
      if (pinInput === data.parentPin) {
        setIsUnlocked(true);
        setPinInput('');
        setPinError('');
      } else {
        setPinError(t.wrongPin);
      }
    };

    const handleRemovePin = () => {
      updateData({ parentPin: '' });
      setIsUnlocked(true);
    };

    const toggleLanguage = async () => {
      const targetLang = data.language === 'en' ? 'zh' : 'en';
      localStorage.setItem('blaze_lang', targetLang); // ✨ 切换时立写本地
      await updateData({ language: targetLang });
    };

    const toggleSection = (section, isLocked) => {
      if (isLocked) {
        setExpandedSettingSection('security'); 
        return;
      }
      setExpandedSettingSection(prev => prev === section ? null : section);
    };

    const AccordionHeader = ({ id, icon: Icon, title, summary, hasError, isLocked }) => (
      <button 
        onClick={() => toggleSection(id, isLocked)}
        className={`w-full flex items-center justify-between p-4 ${tc.cardBg} rounded-2xl shadow-sm border transition-all ${expandedSettingSection === id ? tc.borderLight + ' ring-2 ' + tc.focusRing : (hasError ? 'border-orange-300 bg-orange-50/30' : tc.borderLight + ' hover:opacity-80')}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${tc.badgeBg} ${hasError ? 'text-orange-500' : tc.textPrimary}`}>
            <Icon size={20} />
          </div>
          <span className={`font-bold ${tc.textHeading}`}>{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold ${hasError || isLocked ? 'text-orange-500' : tc.textMuted}`}>{summary}</span>
          {expandedSettingSection === id ? <ChevronUp size={18} className={tc.textMuted} /> : <ChevronDown size={18} className={tc.textMuted} />}
        </div>
      </button>
    );

    const renderThemeSelector = () => (
      <div className="grid grid-cols-4 gap-3">
        {Object.keys(THEMES).map(key => {
          const theme = THEMES[key];
          const isActive = (data.theme || 'purple') === key;
          const isFreeTheme = FREE_THEMES.includes(key);
          const isLocked = !data.isPro && !isFreeTheme;

          return (
            <button
              key={key}
              onClick={() => {
                if (isLocked) setShowProModal(true);
                else updateData({ theme: key });
              }}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all relative ${
                isActive ? tc.badgeBg + ' ring-2 ' + tc.focusRing : 'hover:opacity-70 ' + tc.calEmpty.split(' ')[0]
              }`}
            >
              {isLocked && (
                <div className="absolute -top-1 -right-1 bg-slate-800 rounded-full p-0.5 shadow-md z-10">
                  <Crown size={12} className="text-yellow-400" />
                </div>
              )}
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.gradientIcon} shadow-sm border border-white/20 ${isLocked ? 'opacity-50 grayscale' : ''}`}></div>
              <span className={`text-[10px] font-bold ${isActive ? tc.textPrimary : tc.textMuted}`}>
                {data.language === 'en' ? theme.enName : theme.name}
              </span>
            </button>
          )
        })}
      </div>
    );

    // 实时抓取云端数据用于列表展示
    const currentRaces = data.races || (data.raceDate ? [{ id: 'legacy', name: t.raceDate, date: data.raceDate }] : []);
    const currentRewards = data.customRewards || [];

    return (
      <div className="space-y-3 pb-4">
        {/* =========================================
            1. 账号安全与同步
        =========================================== */}
        <div className="space-y-2">
          <AccordionHeader 
            id="account" 
            icon={Cloud} 
            title={t.accountStatus} 
            summary={user?.isAnonymous ? (data.language === 'en' ? 'Guest ⚠️' : '游客模式 ⚠️') : (data.username || user?.email?.split('@')[0] || (data.language === 'en' ? 'Logged In 🟢' : '已登录 🟢'))} 
            hasError={user?.isAnonymous}
          />
          {expandedSettingSection === 'account' && (
            <div className={`p-5 rounded-2xl border ${tc.borderLight} ${tc.cardBg} animate-in fade-in slide-in-from-top-2 duration-200 space-y-4`}>
              {user?.isAnonymous ? (
                <div className="space-y-4">
                  <p className={`text-xs ${tc.textMuted} leading-relaxed bg-orange-50/50 p-3 rounded-xl border border-orange-100/50`}>
                    {t.guestWarning}
                  </p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95`}
                  >
                    {t.bindAccountBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 ${tc.badgeBg} bg-opacity-30 p-3.5 rounded-xl border ${tc.borderLight}`}>
                    <div className={`w-10 h-10 rounded-full ${tc.badgeBg} flex items-center justify-center ${tc.textPrimary} shrink-0`}>
                      <UserCircle size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold ${tc.textHeading} truncate`}>{data.username || user?.email || (data.language === 'en' ? 'Official Account' : '已绑定正式账号')}</div>
                      <div className={`text-xs ${tc.textPrimary} truncate`}>{user?.email || (data.language === 'en' ? 'Phone linked' : '手机号绑定用户')}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAccountModal(true)}
                    className={`w-full ${tc.btnPrimary} py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95`}
                  >
                    {t.manageAccountBtn}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================
            2. 家长/教练模式
        =========================================== */}
        <div className="space-y-2">
          <AccordionHeader 
            id="security" 
            icon={ShieldCheck} 
            title={t.parentMode} 
            summary={data.parentPin ? (isUnlocked ? (data.language==='en'?'Unlocked 🟢':'已解锁 🟢') : (data.language==='en'?'Locked 🔒':'已锁定 🔒')) : (data.language==='en'?'Not Set':'未设置')}
            hasError={data.parentPin && !isUnlocked}
          />
          {expandedSettingSection === 'security' && (
            <div className={`p-5 rounded-2xl border ${tc.borderLight} ${tc.cardBg} animate-in fade-in slide-in-from-top-2 duration-200`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`text-sm font-bold ${tc.textHeading}`}>{data.language === 'en' ? 'Access Control' : '权限控制'}</span>
                {!data.isPro && <Crown size={14} className="text-yellow-500" />}
              </div>
              
              {!data.parentPin && (
                <div className="space-y-3">
                  <p className={`text-xs ${tc.textMuted}`}>
                    {data.language === 'en' ? 'Set a 4-digit PIN to lock data entry' : '设置4位数字密码以锁定数据录入'}
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      maxLength={4}
                      value={pinInput}
                      disabled={!data.isPro}
                      onClick={() => !data.isPro && setShowProModal(true)}
                      onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                      placeholder={t.pinPlaceholder}
                      className={`flex-1 min-w-0 ${tc.inputBg} rounded-xl px-4 py-2 text-center tracking-[0.5em] font-bold disabled:opacity-50`}
                    />
                    <button onClick={data.isPro ? handleSetPin : () => setShowProModal(true)} className={`${tc.btnPrimary} px-4 py-2 rounded-xl font-bold text-sm shadow-sm shrink-0 whitespace-nowrap ${!data.isPro ? 'opacity-90' : ''}`}>
                      {data.isPro ? String(t.setPin) : <span className="flex items-center"><Crown size={14} className="inline mr-1 -mt-0.5"/>PRO</span>}
                    </button>
                  </div>
                </div>
              )}

              {data.parentPin && !isUnlocked && (
                <div className="space-y-3">
                  <p className={`text-xs text-orange-600 font-medium`}>{t.unlockPrompt}</p>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                      placeholder="****"
                      className={`flex-1 min-w-0 bg-white border border-orange-200 focus:ring-orange-400 rounded-xl px-4 py-2 text-center tracking-[0.5em] font-bold text-gray-800`}
                    />
                    <button onClick={handleUnlock} className={`bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-1 shrink-0 whitespace-nowrap`}>
                      <Unlock size={16} /> {t.unlock}
                    </button>
                  </div>
                </div>
              )}

              {data.parentPin && isUnlocked && (
                <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-100">
                  <span className="text-sm font-bold text-green-700">{t.unlockedStatus}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setIsUnlocked(false)} className={`text-xs font-bold ${tc.btnCancel} px-3 py-1.5 rounded-lg shrink-0`}>
                      {t.lockNow}
                    </button>
                    <button onClick={handleRemovePin} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg shrink-0">
                      {t.removePin}
                    </button>
                  </div>
                </div>
              )}
              {pinError && <div className={`text-xs ${pinError.includes('✅') ? 'text-green-600' : 'text-red-500'} font-bold mt-2 ${pinError.includes('✅') ? '' : 'animate-pulse'}`}>{pinError}</div>}
            </div>
          )}
        </div>

        {/* =========================================
            3. 应用偏好
        =========================================== */}
        <div className="space-y-2">
          <AccordionHeader 
            id="preferences" 
            icon={SlidersHorizontal} 
            title={t.appPreferences} 
            summary={`${data.language === 'en' ? 'EN' : '中文'} · ${data.language === 'en' ? THEMES[data.theme]?.enName : THEMES[data.theme]?.name}`}
          />
          {expandedSettingSection === 'preferences' && (
            <div className={`p-5 rounded-2xl border ${tc.borderLight} ${tc.cardBg} animate-in fade-in slide-in-from-top-2 duration-200 space-y-6`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-bold ${tc.textHeading} flex items-center gap-2`}><Globe size={16} className={tc.textMuted}/> {t.language}</span>
                <button 
                  onClick={toggleLanguage}
                  className={`${tc.badgeBg} ${tc.textPrimary} px-4 py-2 rounded-lg font-bold text-sm hover:opacity-80 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap`}
                >
                  {data.language === 'en' ? '🇨🇳 中文' : '🇬🇧 English'}
                </button>
              </div>
              <div className="pt-4 border-t border-gray-100/60">
                <span className={`text-sm font-bold ${tc.textHeading} flex items-center gap-2 mb-4`}><Palette size={16} className={tc.textMuted}/> {t.themeSettingTitle}</span>
                {renderThemeSelector()}
              </div>
            </div>
          )}
        </div>

        {/* =========================================
            4. 训练与核心数据
        =========================================== */}
        <div className="space-y-2">
          <AccordionHeader 
            id="training" 
            icon={LineChart} 
            title={t.trainingConfig} 
            summary={isParentMode ? `${formDistances.length} ${data.language==='en'?'Dists':'项目'} · ${currentRaces.length} ${data.language==='en'?'Races':'比赛'}` : (data.language==='en'?'🔒 Unlock required':'🔒 请先解锁')}
            isLocked={!isParentMode}
          />
          {expandedSettingSection === 'training' && isParentMode && (
            <div className={`p-5 rounded-2xl border ${tc.borderLight} ${tc.cardBg} animate-in fade-in slide-in-from-top-2 duration-200 space-y-6`}>
              {/* 成绩项目距离管理 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                    <Dumbbell size={18} className={tc.textMuted} /> {t.distanceManagement}
                    {!data.isPro && <Crown size={14} className="text-yellow-500" />}
                  </h3>
                  <button 
                    onClick={() => {
                      if (data.isPro) {
                        const newDists = [...formDistances, String(t.newDistance)];
                        setFormDistances(newDists);
                        updateData({ customDistances: newDists }); // ✨ 智能自动保存
                      } else {
                        setShowProModal(true);
                      }
                    }}
                    className={`${tc.textPrimary} ${tc.badgeBg} p-1.5 rounded-lg hover:opacity-80 transition-colors shrink-0`}
                  >
                    {data.isPro ? <Plus size={16} /> : <Crown size={16} className="text-yellow-500" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formDistances.map((dist, index) => (
                    <div key={index} className={`flex items-center gap-1 ${tc.inputBg} pl-3 pr-1 py-1.5 rounded-xl border border-transparent focus-within:${tc.borderLight} ${!data.isPro && 'opacity-60 grayscale'}`}>
                      <input 
                        type="text" 
                        value={dist}
                        disabled={!data.isPro}
                        onClick={() => !data.isPro && setShowProModal(true)}
                        onChange={(e) => {
                          const newDists = [...formDistances];
                          newDists[index] = e.target.value;
                          setFormDistances(newDists);
                        }}
                        onBlur={() => updateData({ customDistances: formDistances })} // ✨ 失去焦点无感保存
                        className={`w-16 bg-transparent text-sm font-bold ${tc.appText} focus:outline-none`}
                      />
                      <button 
                        onClick={() => {
                          if (data.isPro) {
                            const newDists = formDistances.filter((_, i) => i !== index);
                            setFormDistances(newDists);
                            updateData({ customDistances: newDists }); // ✨ 智能自动保存
                          } else {
                            setShowProModal(true);
                          }
                        }}
                        className={`p-1 ${tc.textMuted} hover:text-red-500 transition-colors rounded-lg`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-gray-100/60"></div>

              {/* 比赛日期管理 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                    <Trophy size={18} className={tc.textMuted} /> {t.raceDate}
                  </h3>
                  <button 
                    onClick={() => setShowRaceModal(true)}
                    className={`${tc.textPrimary} ${tc.badgeBg} p-1.5 rounded-lg hover:opacity-80 transition-colors shrink-0`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {[...currentRaces]
                    .sort((a, b) => {
                      const timeA = new Date((a.date || '').replace(/-/g, '/')).getTime() || 0;
                      const timeB = new Date((b.date || '').replace(/-/g, '/')).getTime() || 0;
                      return timeA - timeB;
                    })
                    .map((race) => (
                      <div key={race.id} className={`flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100/60 hover:bg-gray-50 transition-colors`}>
                        <div className="flex flex-col min-w-0 flex-1 pr-2 text-left">
                          <span className={`font-bold text-sm ${tc.textHeading} truncate`}>{race.name || t.raceName}</span>
                          <span className={`text-[10px] font-bold ${tc.textMuted} mt-0.5`}>{(race.date || '').replace(/-/g, '/')}</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (window.confirm(data.language === 'en' ? 'Delete this race goal?' : '确定要删除这个比赛目标吗？')) {
                              updateData({ races: currentRaces.filter(r => r.id !== race.id) }); // ✨ 立即删除云端记录
                            }
                          }}
                          className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  }
                  {currentRaces.length === 0 && (
                    <div className={`text-xs ${tc.textMuted} py-2 text-center font-medium`}>
                      {data.language === 'en' ? 'No scheduled races' : '暂无规划中的比赛目标 🏁'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================
            5. 积分与商店管理
        =========================================== */}
        <div className="space-y-2">
          <AccordionHeader 
            id="rewards" 
            icon={Award} 
            title={data.language==='en'?'Points & Shop':'积分与商店管理'} 
            summary={isParentMode ? `+${formPointsPerTask} ${t.points} · ${currentRewards.length} ${data.language==='en'?'Items':'商品'}` : (data.language==='en'?'🔒 Unlock required':'🔒 请先解锁')}
            isLocked={!isParentMode}
          />
          {expandedSettingSection === 'rewards' && isParentMode && (
            <div className={`p-5 rounded-2xl border ${tc.borderLight} ${tc.cardBg} animate-in fade-in slide-in-from-top-2 duration-200 space-y-6`}>
              {/* 积分奖励规则设定 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                    <Flame size={18} className={tc.textMuted} /> {t.pointsSettingTitle}
                    {!data.isPro && <Crown size={14} className="text-yellow-500" />}
                  </h3>
                  <button 
                    onClick={() => {
                      if (window.confirm(data.language === 'en' ? 'Reset all points to 0?' : '确定要将所有可用积分清零吗？')) {
                        updateData({ points: 0 });
                      }
                    }}
                    className="text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors active:scale-95 shadow-sm"
                  >
                    {data.language === 'en' ? 'Reset Points' : '清空积分'}
                  </button>
                </div>
                <div className={`space-y-3 ${!data.isPro && 'opacity-60 grayscale'}`}>
                  <div className={`flex items-center justify-between gap-3 ${tc.inputBg} p-3 rounded-xl`}>
                    <span className={`text-sm font-bold ${tc.appText} shrink-0`}>{t.pointsPerTask}</span>
                    <input 
                      type="number" 
                      value={formPointsPerTask}
                      disabled={!data.isPro}
                      onClick={() => !data.isPro && setShowProModal(true)}
                      onChange={(e) => setFormPointsPerTask(e.target.value)}
                      onBlur={() => updateData({ pointsPerTask: parseInt(formPointsPerTask, 10) || 0 })} // ✨ 失去焦点无感保存
                      className={`w-24 shrink-0 ${tc.cardBg} rounded-lg px-3 py-1.5 text-sm ${tc.appText} text-center focus:outline-none focus:ring-1 ${tc.focusRing}`}
                    />
                  </div>
                  <div className={`flex items-center justify-between gap-3 ${tc.inputBg} p-3 rounded-xl`}>
                    <span className={`text-sm font-bold ${tc.appText} shrink-0`}>{t.dailyBonusPoints}</span>
                    <input 
                      type="number" 
                      value={formDailyBonus}
                      disabled={!data.isPro}
                      onClick={() => !data.isPro && setShowProModal(true)}
                      onChange={(e) => setFormDailyBonus(e.target.value)}
                      onBlur={() => updateData({ dailyBonusPoints: parseInt(formDailyBonus, 10) || 0 })} // ✨ 失去焦点无感保存
                      className={`w-24 shrink-0 ${tc.cardBg} rounded-lg px-3 py-1.5 text-sm ${tc.appText} text-center focus:outline-none focus:ring-1 ${tc.focusRing}`}
                    />
                  </div>

                  {/* 家长手动干预特权 */}
                  <div className="mt-4 pt-4 border-t border-gray-100/60 space-y-2 text-left">
                    <label className={`text-xs font-bold ${tc.textMuted} flex items-center gap-1.5`}>
                      <Sparkles size={12} className="text-yellow-500" />
                      {data.language === 'en' ? 'Manual Performance Rewards' : '表现分手动调整 (家长特权)'}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder={data.language === 'en' ? 'Score' : '输入分值 (如: 50)'}
                        className={`flex-1 min-w-0 ${tc.inputBg} rounded-xl px-3 py-2 text-sm font-bold ${tc.appText} focus:outline-none focus:ring-1 ${tc.focusRing}`}
                      />
                      <button
                        onClick={() => {
                          const amt = parseInt(adjustAmount, 10);
                          if (!isNaN(amt) && amt > 0) {
                            updateData({ points: data.points + amt });
                            setAdjustAmount('');
                            alert(data.language === 'en' ? `Successfully added ${amt} points!` : `已成功奖励 ${amt} 积分！`);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all whitespace-nowrap"
                      >
                        {data.language === 'en' ? 'Add (+)' : '奖励 (+)'}
                      </button>
                      <button
                        onClick={() => {
                          const amt = parseInt(adjustAmount, 10);
                          if (!isNaN(amt) && amt > 0) {
                            updateData({ points: Math.max(0, data.points - amt) });
                            setAdjustAmount('');
                            alert(data.language === 'en' ? `Successfully deducted ${amt} points!` : `已成功扣除 ${amt} 积分！`);
                          }
                        }}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all whitespace-nowrap"
                      >
                        {data.language === 'en' ? 'Deduct (-)' : '扣除 (-)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100/60"></div>

              {/* 商店商品列表 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                    <ShoppingCart size={18} className={tc.textMuted} /> {t.shopManagement}
                    {!data.isPro && <Crown size={14} className="text-yellow-500" />}
                  </h3>
                  <button 
                    onClick={() => data.isPro ? setShowShopItemModal(true) : setShowProModal(true)}
                    className={`${tc.textPrimary} ${tc.badgeBg} p-1.5 rounded-lg hover:opacity-80 transition-colors shrink-0`}
                  >
                    {data.isPro ? <Plus size={16} /> : <Crown size={16} className="text-yellow-500" />}
                  </button>
                </div>
                
                <div className={`space-y-2 ${!data.isPro && 'opacity-60 grayscale'}`}>
                  {[...currentRewards]
                    .sort((a, b) => a.cost - b.cost)
                    .map((reward) => (
                      <div key={reward.id} className={`flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100/60 hover:bg-gray-50 transition-colors`}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-2xl bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm shrink-0">{reward.icon}</span>
                          <div className="flex flex-col min-w-0">
                            <span className={`font-bold text-sm ${tc.textHeading} truncate`}>{reward.name}</span>
                            <span className="text-[10px] font-black text-yellow-500 flex items-center gap-0.5">
                              <Zap size={10} className="fill-yellow-500" /> {reward.cost}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            if (data.isPro) {
                              updateData({ customRewards: currentRewards.filter(r => r.id !== reward.id) }); // ✨ 立即删除云端记录
                            } else {
                              setShowProModal(true);
                            }
                          }}
                          className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 active:scale-90 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 🌟 底部那个占地方的“保存设置”大按钮，已被彻底铲除！页面到这里就干净利落地结束了。 */}
      </div>
    );
  }; // 💡 这是刚才 SettingsView 的闭合括号

  const ProfileModal = () => {
    if (!showProfileModal) return null;
    return (
      <div className={`fixed inset-0 z-[60] flex flex-col ${tc.appBg} overflow-y-auto animate-in fade-in slide-in-from-right-8 duration-300`}>
        <div className={`flex items-center justify-between px-5 py-4 ${tc.headerBg} border-b ${tc.borderLight} sticky top-0 z-10`}>
          <button onClick={() => setShowProfileModal(false)} className={`p-2 -ml-2 ${tc.textMuted} hover:${tc.textPrimary} shrink-0`}>
            <ArrowLeft size={24} />
          </button>
          <h2 className={`text-lg font-black ${tc.textHeading}`}>{t.profileTitle}</h2>
          <div className="w-8 shrink-0"></div>
        </div>

        <div className="flex-1 p-6 space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4 group cursor-pointer">
              {data.avatar ? (
                <img src={data.avatar} alt="Avatar" className={`w-24 h-24 rounded-full object-cover border-4 ${tc.borderLight} shadow-lg`} />
              ) : (
                <div className={`w-24 h-24 rounded-full ${tc.badgeBg} flex items-center justify-center border-4 ${tc.borderLight} shadow-lg`}>
                  <User size={40} className={tc.textPrimary} />
                </div>
              )}
              <label className={`absolute bottom-0 right-0 ${tc.btnPrimary} p-2 rounded-full cursor-pointer shadow-xl border-2 ${tc.borderLight} transition-transform hover:scale-110 active:scale-95`}>
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <h2 className={`text-xl font-black ${tc.textHeading}`}>{data.username || (user?.isAnonymous ? 'Guest Skater' : user?.email?.split('@')[0] || 'Blaze Skater')}</h2>
            <p className={`text-xs font-bold ${tc.textMuted} mt-1 uppercase tracking-wider`}>ID: {user?.uid?.slice(0,8) || '...'}</p>
          </div>

          {data.isPro ? (
            <div className={`relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-3xl shadow-lg flex justify-between items-center text-white`}>
              <Sparkles className="absolute right-10 top-2 opacity-20" size={80} />
              <div>
                <h3 className="font-black text-xl flex items-center gap-2 tracking-tight mb-1">
                  <Crown size={24} className="text-yellow-200 fill-yellow-200/20" /> 
                  {t.proActiveTitle}
                </h3>
                <p className="text-sm font-medium opacity-90">{t.proActiveSub}</p>
              </div>
              <div className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-bold shrink-0">
                {t.proTag}
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setShowProModal(true)}
              className={`relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-3xl shadow-lg flex justify-between items-center text-white cursor-pointer hover:opacity-95 transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Sparkles className="absolute right-10 top-2 opacity-20" size={80} />
              <div>
                <h3 className="font-black text-xl flex items-center gap-2 tracking-tight mb-1">
                  <Crown size={24} className="text-yellow-200 fill-yellow-200/20" /> 
                  {t.proTitle}
                </h3>
                <p className="text-sm font-medium opacity-90">{t.proSubtitle}</p>
              </div>
              <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm shrink-0 shadow-sm">
                <ChevronRight size={20} className="text-white" />
              </div>
            </div>
          )}

          

          <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50 my-8"></div>
          
          {SettingsView()}

          <div className={`pt-10 pb-6 flex flex-col items-center justify-center opacity-70`}>
            <div className={`w-10 h-10 rounded-[0.8rem] bg-gradient-to-br ${tc.gradientIcon} flex items-center justify-center shadow-md mb-3 grayscale opacity-80`}>
              <Flame size={20} className="text-white" />
            </div>
            <p className={`text-xs font-bold ${tc.textMuted}`}>{t.version}</p>
            <p className={`text-[10px] font-medium ${tc.textMuted} mt-1`}>{t.copyright}</p>
          </div>
        </div>
      </div>
    );
  };

  const AcademyView = () => {
    const academyData = BLAZE_ACADEMY[data.language || 'zh'];
    const activeStage = academyData[activeAcademyAgeIdx];

    return (
      <div className="space-y-6 pb-6">
        <div>
          <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.openAcademy}</h2>
          <p className={`text-sm ${tc.textMuted} mt-1 tracking-wider uppercase`}>{t.academySub}</p>
        </div>

        <div className={`flex justify-center gap-2 ${tc.cardBg} p-2 rounded-2xl border ${tc.borderLight} shadow-sm`}>
          {academyData.map((stage, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveAcademyAgeIdx(idx); setExpandedAcademyModule(0); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeAcademyAgeIdx === idx 
                  ? stage.color + ' shadow-md border ring-2 ring-white ring-offset-1' 
                  : `bg-transparent ${tc.textMuted} hover:bg-black/5`
              }`}
            >
              {stage.age}
            </button>
          ))}
        </div>

{/* 头部分支渲染逻辑 (双语完美适配新版UI) */}
        {activeStage.id === 'age4_6' ? (
          <div className="space-y-4">
            {/* 1. 顶部启蒙阶段卡片 */}
            <div className="bg-[#f8f8f5] p-5 rounded-xl border border-gray-200/50 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#fdf5e6] rounded-full flex items-center justify-center shrink-0">
                <span className="text-2xl leading-none">🌱</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-1">{activeStage.title} · {activeStage.age}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeStage.target}
                </p>
              </div>
            </div>

            {/* 2. 中间四个参数指标卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '训练目标' : 'Target'}</span>
                <span className="text-[13px] font-bold text-gray-900">{data.language === 'zh' ? '基础动作模式 & 平衡感' : 'Basic Movements & Balance'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '单次时长' : 'Duration'}</span>
                <span className="text-[13px] font-bold text-gray-900">{activeStage.duration}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '频率' : 'Frequency'}</span>
                <span className="text-[13px] font-bold text-gray-900">{activeStage.frequency}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '训练风格' : 'Style'}</span>
                <span className="text-[13px] font-bold text-gray-900">{data.language === 'zh' ? '游戏化、互动性' : 'Gamified & Interactive'}</span>
              </div>
            </div>

            {/* 3. 底部教练须知卡片 */}
            <div className="bg-[#f8f8f5] p-4 rounded-r-xl border-l-4 border-[#3b82f6] text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-900">{data.language === 'zh' ? '教练须知：' : 'Coach Note: '}</span>
              {data.language === 'zh' 
                ? '该阶段儿童骨骼肌肉系统尚未发育成熟，严禁任何负重训练、高强度跳跃及对抗训练。以身体意识唤醒、感官协调和运动趣味为核心目标。'
                : 'Musculoskeletal systems are immature at this stage. Weight-bearing, heavy plyometrics, and contact training are strictly prohibited. Focus on body awareness, coordination, and fun.'}
            </div>
          </div>
        ) : activeStage.id === 'age7_10' ? (
          <div className="space-y-4">
            {/* 1. 顶部进阶阶段卡片 */}
            <div className="bg-[#f8f8f5] p-5 rounded-xl border border-gray-200/50 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#bfdbfe] rounded-full flex items-center justify-center shrink-0">
                <span className="text-2xl leading-none">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-1">{activeStage.title} · {activeStage.age}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeStage.target}
                </p>
              </div>
            </div>

            {/* 2. 中间四个参数指标卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '核心目标' : 'Core Target'}</span>
                <span className="text-[13px] font-bold text-gray-900">{data.language === 'zh' ? '专项技术规范化' : 'Specific Tech Standardization'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '单次时长' : 'Duration'}</span>
                <span className="text-[13px] font-bold text-gray-900">{activeStage.duration}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '频率' : 'Frequency'}</span>
                <span className="text-[13px] font-bold text-gray-900">{activeStage.frequency}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '负荷特点' : 'Load Profile'}</span>
                <span className="text-[13px] font-bold text-gray-900">{data.language === 'zh' ? '中低强度 + 动作质量优先' : 'Low-Med Intensity + Quality First'}</span>
              </div>
            </div>

            {/* 3. 底部教练须知卡片 */}
            <div className="bg-[#f8f8f5] p-4 rounded-r-xl border-l-4 border-[#3b82f6] text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-900">{data.language === 'zh' ? '训练原则：' : 'Training Principle: '}</span>
              {data.language === 'zh'
                ? '该阶段是“技术窗口期”，动作模式一旦错误将难以纠正。每个练习优先保证动作质量，宁可减量减速，不可降低动作标准。开始引入少量自重力量训练。'
                : 'This is the "technical window". Wrong movement patterns are hard to fix later. Prioritize form over speed/volume. Introduce light bodyweight training.'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. 顶部青少年阶段卡片 */}
            <div className="bg-[#f8f8f5] p-5 rounded-xl border border-gray-200/50 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#fecdd3] rounded-full flex items-center justify-center shrink-0">
                <span className="text-2xl leading-none">🔥</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 mb-1">{activeStage.title} · {activeStage.age}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeStage.target}
                </p>
              </div>
            </div>

            {/* 2. 中间四个参数指标卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '核心目标' : 'Core Target'}</span>
                <span className="text-[13px] font-bold text-gray-900">{data.language === 'zh' ? '最大力量 & 专项爆发力' : 'Max Strength & Explosive Power'}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '单次时长' : 'Duration'}</span>
                <span className="text-[13px] font-bold text-gray-900">{activeStage.duration}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '频率' : 'Frequency'}</span>
                <span className="text-[13px] font-bold text-gray-900">{activeStage.frequency}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-center gap-1.5">
                <span className="text-[11px] text-gray-500 font-medium">{data.language === 'zh' ? '训练特点' : 'Training Feature'}</span>
                <span className="text-[13px] font-bold text-gray-900">{data.language === 'zh' ? '周期化·系统化·大负荷' : 'Periodized · Systematic · Heavy Load'}</span>
              </div>
            </div>

            {/* 3. 底部教练须知卡片 */}
            <div className="bg-[#f8f8f5] p-4 rounded-r-xl border-l-4 border-[#3b82f6] text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-900">{data.language === 'zh' ? '周期化原则：' : 'Periodization: '}</span>
              {data.language === 'zh'
                ? '赛前期（8-12周）以技术完善和速度耐力为主；准备期（12-16周）以最大力量和爆发力为主；赛季期维持力量，以冰上训练为主；过渡期（4周）以主动恢复为主。陆地训练强度随赛季调整。'
                : 'Pre-season (8-12Weeks) focuses on tech & speed endurance; Prep (12-16Weeks) on max strength & power; In-season maintains strength; Transition (4Weeks) for active recovery.'}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {activeStage.modules.map((module, mIdx) => {
            const isExpanded = expandedAcademyModule === mIdx;
            return (
              <div key={mIdx} className={`${tc.cardBg} rounded-2xl shadow-sm border ${tc.borderLight} overflow-hidden transition-all`}>
                <button 
                  onClick={() => setExpandedAcademyModule(isExpanded ? -1 : mIdx)}
                  className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white transition-colors"
                >
                  <span className={`font-black text-sm ${tc.textHeading} text-left`}>{module.name}</span>
                  {isExpanded ? <ChevronUp size={20} className={tc.textMuted} /> : <ChevronDown size={20} className={tc.textMuted} />}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {module.items.map((item, iIdx) => {
                      const isLocked = !data.isPro && iIdx > 0;
                      const uniqueItemId = `${mIdx}-${iIdx}`; // 新增：为每个动作生成唯一ID
                      
                      return (
                        <div 
                          key={iIdx} 
                          onClick={() => { if (isLocked) setShowProModal(true); }}
                          className={`p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden transition-all ${
                            isLocked ? 'bg-slate-50 border-slate-100 cursor-pointer group' : `${tc.inputBg} ${tc.borderLight} hover:shadow-sm`
                          }`}
                        >
                          <div className={`flex justify-between items-start ${isLocked ? 'blur-[3px] opacity-40 select-none' : ''}`}>
                            <div className="flex-1 pr-3">
                              <div className={`font-bold text-sm ${tc.appText} mb-0.5`}>{item.name}</div>
                              <div className={`text-[11px] ${tc.textMuted} leading-tight`}>{item.desc}</div>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded bg-white shadow-sm border ${tc.borderLight} ${activeStage.iconColor} shrink-0`}>
                              {item.tag}
                            </span>
                          </div>
                          
                          {/* 修改：底部区域改为 flex-between，左边是训练量，右边是添加按钮 */}
                          <div className={`flex justify-between items-end mt-1 ${isLocked ? 'blur-[3px] opacity-40 select-none' : ''}`}>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 size={14} className={tc.textPrimary} />
                              <span className={`text-xs font-bold ${tc.textPrimary}`}>{item.target}</span>
                            </div>
                            
                            {/* 新增的单项导入按钮 */}
                            <button 
                              onClick={(e) => {
                                if (isLocked) { e.stopPropagation(); setShowProModal(true); }
                                else importSingleTask(e, item, uniqueItemId);
                              }}
                              disabled={importedSingleItemIds.includes(uniqueItemId) && !isLocked}
                              className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                                isLocked 
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100' 
                                  : importedSingleItemIds.includes(uniqueItemId)
                                    ? 'bg-green-100 text-green-600 border border-green-200'
                                    : `bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:${tc.textPrimary} shadow-sm active:scale-95`
                              }`}
                            >
                              {isLocked ? (
                                <><Crown size={12} className="text-yellow-500" /> PRO</>
                              ) : importedSingleItemIds.includes(uniqueItemId) ? (
                                <><Check size={12} /> {data.language === 'en' ? 'Added' : '已添加'}</>
                              ) : (
                                <><Plus size={12} /> {data.language === 'en' ? 'Add' : '添加'}</>
                              )}
                            </button>
                          </div>

                          {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
                              <div className="bg-slate-800 text-white rounded-full p-2 mb-1 shadow-md group-hover:scale-110 transition-transform">
                                <LockKeyhole size={16} />
                              </div>
                              <span className="text-[10px] font-black text-slate-800 tracking-widest">{t.proLocked}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-6 mt-4 border-t-2 border-dashed border-slate-200">
          <h3 className={`text-base font-black ${tc.textHeading} mb-4 flex items-center gap-2`}>
            <CalendarDays size={20} className={activeStage.iconColor} /> 
            {data.language === 'en' ? 'Reference Weekly Plan' : '参考周训练安排'}
          </h3>
          
          <div className="space-y-3">
            {activeStage.weeklyPlan.map((dayPlan, wIdx) => {
              const isImported = importedWeeklyIds.includes(wIdx);
              return (
                <div key={wIdx} className={`${tc.cardBg} p-4 rounded-2xl shadow-sm border ${tc.borderLight} flex flex-col`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${activeStage.color} px-2 py-1 rounded shadow-sm`}>{dayPlan.day}</span>
                      <span className={`text-sm font-bold ${tc.appText}`}>{dayPlan.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${tc.textMuted}`}>{dayPlan.duration}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {dayPlan.tasks.map((task, tIdx) => (
                      <span key={tIdx} className={`text-[10px] ${tc.inputBg} ${tc.textMuted} px-2 py-1 rounded-md border ${tc.borderLight}`}>
                        {task}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => importAcademyRoutine(dayPlan, wIdx)}
                    disabled={isImported}
                    className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      isImported 
                        ? 'bg-green-500 text-white scale-[0.98]' 
                        : !data.isPro 
                          ? 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
                          : `${tc.btnPrimary} shadow-md active:scale-95`
                    }`}
                  >
                    {isImported ? (
                      <><Check size={16} /> {t.taskAdded}</>
                    ) : !data.isPro ? (
                      <><Crown size={14} className="text-yellow-400"/> PRO {t.importToToday}</>
                    ) : (
                      <><Download size={16} /> {t.importToToday}</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const RewardHistoryModal = () => {
    if (!showHistory) return null;
    const history = data.rewardHistory || [];

    return (
      <div className={`fixed inset-0 z-50 flex flex-col ${tc.appBg} transition-colors duration-300`}>
        <div className={`flex items-center justify-between px-5 py-4 ${tc.headerBg} border-b ${tc.borderLight}`}>
          <button onClick={() => setShowHistory(false)} className={`p-2 -ml-2 ${tc.textMuted} hover:${tc.textPrimary} shrink-0`}>
            <ArrowLeft size={24} />
          </button>
          <h2 className={`text-lg font-black ${tc.textHeading}`}>{t.rewardHistory}</h2>
          <div className="w-8 shrink-0"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {history.length === 0 ? (
            <div className={`text-center py-20 ${tc.textMuted} font-medium`}>{t.emptyHistory}</div>
          ) : (
            history.map(item => {
              const d = new Date(item.date);
              const dateStr = d.toLocaleDateString(data.language === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
              return (
                <div key={item.id} className={`p-4 ${tc.cardBg} rounded-xl shadow-sm flex items-center justify-between`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`text-2xl ${tc.badgeBg} w-12 h-12 flex items-center justify-center rounded-full shrink-0`}>{item.icon}</div>
                    <div className="min-w-0">
                      <div className={`font-bold ${tc.appText} mb-0.5 truncate`}>{item.name}</div>
                      <div className={`text-xs ${tc.textMuted}`}>{dateStr}</div>
                    </div>
                  </div>
                  <div className="text-yellow-500 font-black text-sm shrink-0 pl-2">-{item.cost} {t.points}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const AuthModal = () => {
    if (!showAuthModal) return null;
    return (
      <div className={`fixed inset-0 z-[70] flex flex-col ${tc.appBg} overflow-y-auto animate-in fade-in zoom-in-95 duration-200`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${tc.borderLight} sticky top-0 ${tc.headerBg} backdrop-blur-md z-10`}>
          <button onClick={() => setShowAuthModal(false)} className={`p-2 -ml-2 ${tc.textMuted} hover:${tc.textPrimary} shrink-0 transition-colors`}>
            <X size={24} />
          </button>
          <h2 className={`text-lg font-black ${tc.textHeading} tracking-widest uppercase opacity-80`}>Account</h2>
          <div className="w-8 shrink-0"></div>
        </div>

        <div className="flex-1 px-6 pt-10 pb-32">
          <div className="flex flex-col items-center text-center mb-10">
            <div className={`w-20 h-20 ${tc.badgeBg} rounded-3xl flex items-center justify-center mb-6`}>
              <Cloud size={40} className={tc.textPrimary} />
            </div>
            <h1 className={`text-2xl font-black ${tc.textHeading} mb-2`}>{t.authTitle}</h1>
            <p className={`font-medium text-sm ${tc.textMuted}`}>{t.authSub}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`text-xs font-bold ${tc.textMuted} ml-1 mb-1 block`}>{t.email}</label>
              <input 
                type="email" 
                value={authEmail}
                onChange={(e) => { setAuthEmail(e.target.value); setAuthError(''); }}
                placeholder="example@email.com"
                className={`w-full ${tc.inputBg} border-2 ${tc.borderLight} rounded-xl px-4 py-3.5 ${tc.appText} focus:outline-none focus:border-transparent focus:ring-2 ${tc.focusRing} transition-all`}
              />
            </div>
            <div>
              <label className={`text-xs font-bold ${tc.textMuted} ml-1 mb-1 block`}>{t.password}</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
                placeholder="••••••"
                className={`w-full ${tc.inputBg} border-2 ${tc.borderLight} rounded-xl px-4 py-3.5 ${tc.appText} focus:outline-none focus:border-transparent focus:ring-2 ${tc.focusRing} transition-all`}
              />
            </div>
            {authError && <div className="text-xs font-bold text-red-500 animate-pulse ml-1 whitespace-pre-line leading-relaxed">{authError}</div>}
          </div>
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-5 ${tc.appBg} border-t ${tc.borderLight} pb-safe`}>
          <button 
            onClick={handleLinkAccount}
            disabled={isAuthLoading}
            className={`w-full flex items-center justify-center gap-2 ${tc.btnPrimary} font-black text-lg py-4 rounded-2xl shadow-lg transition-transform ${isAuthLoading ? 'opacity-80 scale-95' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {isAuthLoading ? <><Loader2 size={24} className="animate-spin" /> {t.binding}</> : t.bindNow}
          </button>
        </div>
      </div>
    );
  };

  const AccountManagementModal = () => {
    if (!showAccountModal) return null;
    return (
      <div className={`fixed inset-0 z-[70] flex flex-col ${tc.appBg} overflow-y-auto animate-in fade-in slide-in-from-bottom-10 duration-200`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${tc.borderLight} sticky top-0 ${tc.headerBg} backdrop-blur-md z-10`}>
          <button onClick={() => setShowAccountModal(false)} className={`p-2 -ml-2 ${tc.textMuted} hover:${tc.textPrimary} shrink-0 transition-colors`}>
            <ArrowLeft size={24} />
          </button>
          <h2 className={`text-lg font-black ${tc.textHeading}`}>{t.accountManageTitle}</h2>
          <div className="w-8 shrink-0"></div>
        </div>

        <div className="flex-1 p-5 space-y-6">
          <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-3`}>
            <label className={`text-sm font-bold flex items-center gap-2 ${tc.textHeading}`}>
              <UserCircle size={18} className={tc.textPrimary} />
              {t.usernameLabel}
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={accountUsername}
                onChange={(e) => setAccountUsername(e.target.value)}
                onBlur={() => {
                  if ((data.username || '') !== accountUsername) {
                    updateData({ username: accountUsername });
                  }
                }}
                placeholder={data.language === 'en' ? "Your skater codename" : "给宝宝起个炫酷的滑冰代号"}
                className={`flex-1 min-w-0 ${tc.inputBg} rounded-xl px-4 py-3 text-sm ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
              />
            </div>
          </div>

          <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
            <div className={`flex items-center justify-between pb-4 border-b ${tc.borderLight}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${tc.badgeBg} flex items-center justify-center ${tc.textPrimary} shrink-0`}>
                  <Mail size={20} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${tc.textHeading}`}>{t.emailLabel}</div>
                  <div className={`text-xs ${user?.email ? tc.textMuted : 'text-orange-500 font-bold'}`}>
                    {user?.email || t.unbound}
                  </div>
                </div>
              </div>
              {user?.email && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded shrink-0">{t.bound}</span>}
            </div>

            <div className={`flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${tc.badgeBg} flex items-center justify-center ${tc.textPrimary} shrink-0`}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${tc.textHeading}`}>{t.phoneLabel}</div>
                  <div className={`text-xs text-orange-500 font-bold`}>{t.unbound}</div>
                </div>
              </div>
              <button 
                onClick={() => alert("手机号绑定需配合企业短信服务，当前为演示版本，暂未开通真实短信网关。")}
                className={`text-xs font-bold ${tc.btnPrimary} px-3 py-1.5 rounded-lg shadow-sm shrink-0`}
              >
                {t.bindAccountBtn}
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className={`w-full mt-4 flex items-center justify-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 py-4 rounded-2xl font-bold transition-colors`}
          >
            <LogOut size={18} /> {t.logout}
          </button>
        </div>
      </div>
    );
  };

  const ProShowcaseModal = () => {
    if (!showProModal) return null;
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-slate-900 text-slate-100 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <button onClick={() => setShowProModal(false)} className="p-2 -ml-2 text-slate-400 hover:text-white shrink-0 transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-lg font-black text-white tracking-widest uppercase opacity-80">Blaze Pro</h2>
          <div className="w-8 shrink-0"></div>
        </div>

        <div className="flex-1 px-6 pt-8 pb-32">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-[0_10px_40px_rgba(245,158,11,0.3)] mb-6 relative">
              <Sparkles size={40} className="absolute -top-4 -right-4 text-yellow-300 animate-pulse" />
              <Crown size={48} className="text-white fill-white/20" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">{t.proTitle}</h1>
            <p className="text-slate-400 font-medium">{t.proSubtitle}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <div className="text-slate-400 text-sm font-bold line-through mb-1 opacity-60">
              {data.language === 'en' ? '$29.99' : '¥198'}
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                {t.proPrice}
              </span>
              <span className="text-slate-400 font-bold">{t.proPeriod}</span>
            </div>
          </div>

          <div className="space-y-5">
            {(t.proFeatures || []).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="mt-0.5 bg-orange-500/20 p-1.5 rounded-full shrink-0">
                  <Check size={16} className="text-orange-400" />
                </div>
                <span className="text-slate-200 font-medium leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          {showPaymentInfo && (
            <div className="mt-8 p-5 bg-slate-800 border border-orange-500/30 rounded-2xl animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-orange-400 font-bold text-sm">付款指引</h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">UID: {user?.uid.slice(0,8)}...</span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-4">
                {t.paymentInstruction}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user?.uid || '');
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isCopied ? <Check size={16} className="text-green-400" /> : <Info size={16} />}
                  {isCopied ? t.uidCopied : t.copyUid}
                </button>
                <div className="flex-1 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <User size={16} /> {t.wechatContact}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pb-safe">
          <button 
            onClick={() => {
              if (data.isPro) {
                setShowProModal(false);
              } else {
                setShowPaymentInfo(true);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-lg py-4 rounded-2xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform`}
          >
            {data.isPro ? t.close : t.upgradeNow}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50/80 to-transparent z-0"></div>
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-200/40 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-200/40 rounded-full blur-3xl z-0"></div>

        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
          <div className="h-24 w-24 rounded-[2rem] shadow-[0_10px_40px_rgba(59,130,246,0.15)] border-2 border-white bg-gradient-to-br from-cyan-50 via-blue-50 to-blue-200 flex items-center justify-center relative overflow-hidden mb-6 group">
             <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent"></div>
             <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-blue-400/20 to-transparent"></div>
             <Flame size={44} strokeWidth={2} className="absolute text-orange-600/40 fill-orange-500/20 scale-y-[-0.6] translate-y-[26px] blur-[3px] z-0" />
             <Flame size={48} strokeWidth={2} className="relative z-10 text-rose-500 fill-orange-400 drop-shadow-[0_4px_12px_rgba(249,115,22,0.6)] animate-pulse" />
             <div className="absolute bottom-3 right-2 w-4 h-[2px] bg-white/60 -rotate-45 rounded-full"></div>
             <div className="absolute bottom-5 right-5 w-2 h-[2px] bg-white/70 -rotate-45 rounded-full"></div>
          </div>

          <div className="flex items-baseline mb-1">
            <span className="text-3xl font-black italic tracking-tight text-slate-800">BLAZE</span>
            <span className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">SKATE</span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-slate-400 mb-12">
            {t.brandSub || 'Training Platform'}
          </span>

          <div className="flex flex-col items-center">
            <div className="flex gap-2.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-[13px] font-bold text-slate-400 animate-pulse tracking-wider uppercase">
              {t.loading || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${tc.appBg} ${tc.appText} font-sans max-w-md mx-auto shadow-2xl relative pb-24 transition-colors duration-300`}>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <header className={`flex justify-between items-center px-5 py-3 sticky top-0 ${tc.headerBg} backdrop-blur-md z-40 border-b ${tc.borderLight} shadow-sm transition-colors duration-300`}>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 min-w-[40px] rounded-xl shadow-md border border-cyan-100/60 bg-gradient-to-br from-cyan-50 via-blue-100 to-blue-300 flex items-center justify-center relative overflow-hidden group shrink-0">
             <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent"></div>
             <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-blue-500/30 to-transparent"></div>
             <Flame size={22} strokeWidth={2} className="absolute text-orange-600/40 fill-orange-500/20 scale-y-[-0.6] translate-y-[16px] blur-[2px] z-0" />
             <Flame size={24} strokeWidth={2} className="relative z-10 text-rose-500 fill-orange-400 drop-shadow-[0_2px_6px_rgba(249,115,22,0.7)] group-hover:scale-110 transition-transform -translate-y-0.5" />
             <div className="absolute bottom-2 right-1.5 w-3 h-[1.5px] bg-white/50 -rotate-45 rounded-full"></div>
             <div className="absolute bottom-3 right-3 w-1.5 h-[1.5px] bg-white/60 -rotate-45 rounded-full"></div>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-baseline">
              <span className={`text-xl font-black italic tracking-tight ${tc.textHeading}`}>BLAZE</span>
              <span className={`text-xl font-black italic tracking-tighter ${tc.textPrimary}`}>SKATE</span>
            </div>
            <span className={`text-[8px] font-bold ${data.language === 'en' ? 'tracking-[0.3em]' : 'tracking-[0.05em]'} uppercase ${tc.textMuted} -mt-0.5 whitespace-nowrap`}>
              {t.brandSub}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 items-center shrink-0">
          {/* 🔥 点击火焰 -> 跳转到 数据 (data) */}
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1 ${tc.badgeOrange} px-3 py-1.5 rounded-full hover:opacity-80 active:scale-95 transition-all`}
          >
            <Flame size={16} />
            <span className="font-bold text-sm">{computedStreak}</span>
          </button>
          
          {/* 🏆 点击奖杯 -> 跳转到 商店 (shop) */}
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1 ${tc.badgeYellow} px-3 py-1.5 rounded-full hover:opacity-80 active:scale-95 transition-all`}
          >
            <Trophy size={16} />
            <span className="font-bold text-sm">{data.points}</span>
          </button>
          
          <button onClick={() => setShowProfileModal(true)} className="relative shrink-0 active:scale-95 transition-transform">
            {data.avatar ? (
              <img src={data.avatar} alt="User Avatar" className={`w-10 h-10 rounded-full object-cover border-2 ${tc.borderLight} shadow-sm ml-1`} />
            ) : (
              <div className={`w-10 h-10 rounded-full ${tc.badgeBg} flex items-center justify-center border-2 ${tc.borderLight} shadow-sm ml-1`}>
                <User size={18} className={tc.textPrimary} />
              </div>
            )}
          </button>
        </div>
      </header>

      <main className="p-5">
        {activeTab === 'dashboard' && DashboardView()}
        {activeTab === 'tasks' && TasksView()}
        {activeTab === 'academy' && AcademyView()}
        {activeTab === TABS.GOALS && GoalsView()}
        {activeTab === TABS.PLANS && TrainingPlanView()}
        {activeTab === 'data' && DataView()}
        {activeTab === 'shop' && ShopView()}
      </main>

      <nav className={`fixed bottom-0 w-full max-w-md ${tc.navBg} border-t ${tc.borderLight} pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)] transition-colors duration-300 z-40`}>
        <div className="flex justify-between items-center p-2 px-2">
          {[
            { id: 'dashboard', icon: Home, label: t.nav?.dashboard },
            { id: 'tasks', icon: ListTodo, label: t.nav?.tasks },
            { id: 'academy', icon: Dumbbell, label: t.nav?.academy },
            { id: TABS.GOALS, icon: Target, label: t.nav?.goals },
            { id: TABS.PLANS, icon: CalendarDays, label: t.nav?.plans },
            { id: 'data', icon: LineChart, label: t.nav?.data },
            { id: 'shop', icon: ShoppingCart, label: t.nav?.shop },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${
                  isActive ? tc.navActive : tc.navHover
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold whitespace-nowrap">{item.label || ''}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 弹窗组件挂载区 */}
      {HistoryDetailModal()} {/* ✨ 新增：挂载日历快照弹窗 */}
      {RecordManagementModal()} {/* ✨ 新增：挂载成绩管理弹窗 */}
      {RaceManagementModal()} {/* 🌟 新增：挂载比赛目标管理弹窗 */}
      {GoalManagementModal()} {/* V1 Step 2：挂载比赛目标表单 */}
      {PlanManagementModal()} {/* V1 Step 3：挂载训练计划表单 */}
      {PlanTaskManagementModal()} {/* V1 Step 3：挂载训练计划任务表单 */}
      {ShopItemManagementModal()} {/* 🛍️ 新增：挂载商店商品管理弹窗 */}
      {RewardHistoryModal()}
      {ProfileModal()}
      {AuthModal()}
      {AccountManagementModal()}
      {ProShowcaseModal()}

      {celebration && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] flex flex-col items-center shadow-2xl animate-[bounce_1s_ease-in-out]">
            <div className="text-7xl mb-6">{celebration.icon || '🎉'}</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">{t.redeemSuccess}</h2>
            <p className="text-gray-500 text-center font-medium max-w-[200px]">
              {(t.enjoyReward || '').replace('{reward}', celebration.name || '')}
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
}
