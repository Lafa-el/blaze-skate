import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  ListTodo, 
  ShoppingCart, 
  LineChart, 
  Flame, 
  Trophy, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle,
  Bell,
  Settings,
  User,
  Save,
  Zap,
  Snowflake,
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
  Lock,
  Unlock,
  ShieldCheck,
  Clock,
  Quote,
  Sparkles,
  Info
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- Firebase 初始化 ---
const firebaseConfig = {
  apiKey: "AIzaSyDQqXcEB-nNP9l3WIuBmUFjzLuzBEwggc8",
  authDomain: "blaze-skate-training-platform.firebaseapp.com",
  projectId: "blaze-skate-training-platform",
  storageBucket: "blaze-skate-training-platform.firebasestorage.app",
  messagingSenderId: "1003517327944",
  appId: "1:1003517327944:web:2992e05c141e822777767d"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'blaze-skate-v1.0'; // 随便起一个固定的项目ID即可

// --- 主题配置 (Theme Engine) ---
const THEMES = {
  purple: {
    id: 'purple', name: '薰衣草紫', enName: 'Lavender',
    appBg: 'bg-[#f8f7ff]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-purple-100', inputBg: 'bg-purple-50 border-purple-100 text-gray-800 focus:ring-purple-400',
    textPrimary: 'text-purple-600', textHeading: 'text-purple-900', textMuted: 'text-gray-500',
    btnPrimary: 'bg-purple-600 hover:bg-purple-500 text-white', btnCancel: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    gradientCard: 'from-purple-500 to-indigo-600 text-white', gradientIcon: 'from-purple-400 to-purple-600',
    navActive: 'text-purple-600 bg-purple-50', navHover: 'text-gray-400 hover:text-purple-500 hover:bg-purple-50/50',
    checkActive: 'text-purple-500', svgLine: '#a855f7', svgGrid: '#e9d5ff', spinner: 'border-purple-200 border-t-purple-600',
    badgeBg: 'bg-purple-100', borderLight: 'border-purple-100', focusRing: 'focus:ring-purple-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-purple-100'
  },
  blue: {
    id: 'blue', name: '破风蓝', enName: 'Aero Blue',
    appBg: 'bg-[#f0f9ff]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-blue-100', inputBg: 'bg-blue-50 border-blue-100 text-gray-800 focus:ring-blue-400',
    textPrimary: 'text-blue-600', textHeading: 'text-blue-900', textMuted: 'text-gray-500',
    btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white', btnCancel: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    gradientCard: 'from-blue-500 to-cyan-500 text-white', gradientIcon: 'from-blue-400 to-blue-600',
    navActive: 'text-blue-600 bg-blue-50', navHover: 'text-gray-400 hover:text-blue-500 hover:bg-blue-50/50',
    checkActive: 'text-blue-500', svgLine: '#3b82f6', svgGrid: '#dbeafe', spinner: 'border-blue-200 border-t-blue-600',
    badgeBg: 'bg-blue-100', borderLight: 'border-blue-100', focusRing: 'focus:ring-blue-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-blue-100'
  },
  green: {
    id: 'green', name: '极光绿', enName: 'Aurora Green',
    appBg: 'bg-[#f0fdf4]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-green-100', inputBg: 'bg-green-50 border-green-100 text-gray-800 focus:ring-green-400',
    textPrimary: 'text-green-600', textHeading: 'text-green-900', textMuted: 'text-gray-500',
    btnPrimary: 'bg-green-600 hover:bg-green-500 text-white', btnCancel: 'bg-green-100 text-green-700 hover:bg-green-200',
    gradientCard: 'from-green-500 to-emerald-600 text-white', gradientIcon: 'from-green-400 to-green-600',
    navActive: 'text-green-600 bg-green-50', navHover: 'text-gray-400 hover:text-green-500 hover:bg-green-50/50',
    checkActive: 'text-green-500', svgLine: '#22c55e', svgGrid: '#dcfce7', spinner: 'border-green-200 border-t-green-600',
    badgeBg: 'bg-green-100', borderLight: 'border-green-100', focusRing: 'focus:ring-green-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-green-100'
  },
  pink: {
    id: 'pink', name: '樱花粉', enName: 'Sakura Pink',
    appBg: 'bg-[#fdf2f8]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-pink-100', inputBg: 'bg-pink-50 border-pink-100 text-gray-800 focus:ring-pink-400',
    textPrimary: 'text-pink-600', textHeading: 'text-pink-900', textMuted: 'text-gray-500',
    btnPrimary: 'bg-pink-600 hover:bg-pink-500 text-white', btnCancel: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    gradientCard: 'from-pink-500 to-rose-500 text-white', gradientIcon: 'from-pink-400 to-pink-600',
    navActive: 'text-pink-600 bg-pink-50', navHover: 'text-gray-400 hover:text-pink-500 hover:bg-pink-50/50',
    checkActive: 'text-pink-500', svgLine: '#ec4899', svgGrid: '#fce7f3', spinner: 'border-pink-200 border-t-pink-600',
    badgeBg: 'bg-pink-100', borderLight: 'border-pink-100', focusRing: 'focus:ring-pink-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-pink-100'
  },
  orange: {
    id: 'orange', name: '竞速橙', enName: 'Racing Orange',
    appBg: 'bg-[#fff7ed]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-orange-100', inputBg: 'bg-orange-50 border-orange-100 text-gray-800 focus:ring-orange-400',
    textPrimary: 'text-orange-600', textHeading: 'text-orange-900', textMuted: 'text-gray-500',
    btnPrimary: 'bg-orange-600 hover:bg-orange-500 text-white', btnCancel: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    gradientCard: 'from-orange-500 to-red-500 text-white', gradientIcon: 'from-orange-400 to-orange-600',
    navActive: 'text-orange-600 bg-orange-50', navHover: 'text-gray-400 hover:text-orange-500 hover:bg-orange-50/50',
    checkActive: 'text-orange-500', svgLine: '#f97316', svgGrid: '#ffedd5', spinner: 'border-orange-200 border-t-orange-600',
    badgeBg: 'bg-orange-100', borderLight: 'border-orange-100', focusRing: 'focus:ring-orange-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-orange-100'
  },
  gray: {
    id: 'gray', name: '钛金灰', enName: 'Titanium Gray',
    appBg: 'bg-[#f8fafc]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-slate-200', inputBg: 'bg-slate-50 border-slate-200 text-gray-800 focus:ring-slate-400',
    textPrimary: 'text-slate-600', textHeading: 'text-slate-900', textMuted: 'text-gray-500',
    btnPrimary: 'bg-slate-700 hover:bg-slate-600 text-white', btnCancel: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    gradientCard: 'from-slate-500 to-zinc-600 text-white', gradientIcon: 'from-slate-400 to-slate-600',
    navActive: 'text-slate-700 bg-slate-100', navHover: 'text-gray-400 hover:text-slate-600 hover:bg-slate-50/50',
    checkActive: 'text-slate-600', svgLine: '#475569', svgGrid: '#e2e8f0', spinner: 'border-slate-200 border-t-slate-600',
    badgeBg: 'bg-slate-200', borderLight: 'border-slate-200', focusRing: 'focus:ring-slate-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-slate-100'
  },
  white: {
    id: 'white', name: '纯粹白', enName: 'Pure White',
    appBg: 'bg-[#f3f4f6]', appText: 'text-gray-800', headerBg: 'bg-white/90', navBg: 'bg-white',
    cardBg: 'bg-white border-gray-200 shadow-sm', inputBg: 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-400',
    textPrimary: 'text-gray-800', textHeading: 'text-black', textMuted: 'text-gray-500',
    btnPrimary: 'bg-black hover:bg-gray-800 text-white', btnCancel: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    gradientCard: 'from-gray-700 to-gray-900 text-white', gradientIcon: 'from-gray-400 to-gray-600',
    navActive: 'text-black bg-gray-100', navHover: 'text-gray-400 hover:text-black hover:bg-gray-50',
    checkActive: 'text-black', svgLine: '#1f2937', svgGrid: '#e5e7eb', spinner: 'border-gray-200 border-t-black',
    badgeBg: 'bg-gray-200', borderLight: 'border-gray-200', focusRing: 'focus:ring-gray-400',
    badgeOrange: 'bg-orange-50 border-orange-100 text-orange-700', badgeYellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    calEmpty: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
  },
  black: {
    id: 'black', name: '暗夜黑', enName: 'Stealth Black',
    appBg: 'bg-[#020617]', appText: 'text-slate-300', headerBg: 'bg-slate-900/90 border-b-slate-800', navBg: 'bg-slate-900 border-t-slate-800',
    cardBg: 'bg-slate-800 border-slate-700 shadow-sm', inputBg: 'bg-slate-900 border-slate-700 text-white focus:ring-slate-500',
    textPrimary: 'text-slate-100', textHeading: 'text-white', textMuted: 'text-slate-500',
    btnPrimary: 'bg-white hover:bg-slate-200 text-slate-900', btnCancel: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
    gradientCard: 'from-slate-700 to-slate-900 text-white border border-slate-700', gradientIcon: 'from-slate-500 to-slate-700',
    navActive: 'text-white bg-slate-800', navHover: 'text-slate-500 hover:text-white hover:bg-slate-800/50',
    checkActive: 'text-slate-300', svgLine: '#cbd5e1', svgGrid: '#334155', spinner: 'border-slate-700 border-t-slate-200',
    badgeBg: 'bg-slate-700', borderLight: 'border-slate-700', focusRing: 'focus:ring-slate-500',
    badgeOrange: 'bg-orange-900/30 border-orange-900/50 text-orange-400', badgeYellow: 'bg-yellow-900/30 border-yellow-900/50 text-yellow-400',
    calEmpty: 'bg-slate-800 text-slate-400 hover:bg-slate-700'
  }
};

// --- 内容库配置 (Task Library) ---
const TASK_LIBRARY = {
  zh: [
    {
      category: '热身准备',
      tasks: [
        { text: '慢跑热身', target: '10-15分钟' },
        { text: '动态拉伸', target: '10分钟' },
        { text: '关节激活', target: '各方向20次' },
        { text: '跳绳', target: '10分钟' }
      ]
    },
    {
      category: '爆发力',
      tasks: [
        { text: '侧向滑步跳', target: '4组 x 16次' },
        { text: '跳箱', target: '4组 x 8次' },
        { text: '立定蛙跳', target: '4组 x 10次' },
        { text: '单腿纵跳', target: '3组 x 每侧8次' }
      ]
    },
    {
      category: '核心与力量',
      tasks: [
        { text: '杠铃深蹲', target: '4组 x 8-10次' },
        { text: '保加利亚分腿蹲', target: '3组 x 每侧10次' },
        { text: '罗马尼亚硬拉', target: '4组 x 10次' },
        { text: '平板支撑及变式', target: '3组 x 1分钟' },
        { text: '俄罗斯转体', target: '3组 x 20次' }
      ]
    },
    {
      category: '专项体能',
      tasks: [
        { text: '靠墙静蹲', target: '3组 x 1.5-2分钟' },
        { text: '滑行板', target: '5组 x 1-2分钟' },
        { text: '动感单车间歇', target: '20s冲刺/40s慢骑 x 10' },
        { text: '折返跑冲刺', target: '5趟 x 4组' }
      ]
    },
    {
      category: '技术模仿',
      tasks: [
        { text: '陆地交叉步模仿', target: '3组 x 20次' },
        { text: '弹力带抗阻侧蹬', target: '4组 x 每侧15次' },
        { text: '镜前低姿势定型', target: '3组 x 1分钟' },
        { text: '弯道倾角模拟', target: '3组 x 30秒' }
      ]
    },
    {
      category: '恢复放松',
      tasks: [
        { text: '泡沫轴筋膜放松', target: '15分钟' },
        { text: '下肢静态拉伸', target: '10-15分钟' },
        { text: '冰浴或冷水浴', target: '10分钟' },
        { text: '瑜伽垫上冥想', target: '10分钟' }
      ]
    }
  ],
  en: [
    {
      category: 'Warm-up',
      tasks: [
        { text: 'Light Jogging', target: '10-15 mins' },
        { text: 'Dynamic Stretching', target: '10 mins' },
        { text: 'Joint Mobility', target: '20 reps each' },
        { text: 'Jump Rope', target: '10 mins' }
      ]
    },
    {
      category: 'Power & Plyos',
      tasks: [
        { text: 'Skater Jumps', target: '4 sets x 16 reps' },
        { text: 'Box Jumps', target: '4 sets x 8 reps' },
        { text: 'Broad Jumps', target: '4 sets x 10 reps' },
        { text: 'Single Leg Bounds', target: '3 sets x 8 reps/leg' }
      ]
    },
    {
      category: 'Strength & Core',
      tasks: [
        { text: 'Barbell Squats', target: '4 sets x 8-10 reps' },
        { text: 'Bulgarian Split Squats', target: '3 sets x 10 reps/leg' },
        { text: 'Romanian Deadlifts', target: '4 sets x 10 reps' },
        { text: 'Plank Variations', target: '3 sets x 1 min' },
        { text: 'Weighted Russian Twists', target: '3 sets x 20 reps' }
      ]
    },
    {
      category: 'Conditioning',
      tasks: [
        { text: 'Wall Sit', target: '3 sets x 1.5-2 mins' },
        { text: 'Slide Board', target: '5 sets x 1-2 mins' },
        { text: 'Bike Intervals', target: '20s sprint/40s rest x 10' },
        { text: 'Shuttle Sprints', target: '5 shuttles x 4 sets' }
      ]
    },
    {
      category: 'Tech & Form',
      tasks: [
        { text: 'Dryland Crossovers', target: '3 sets x 20 reps' },
        { text: 'Banded Push-offs', target: '4 sets x 15 reps/leg' },
        { text: 'Low Position Hold', target: '3 sets x 1 min' },
        { text: 'Corner Lean Drill', target: '3 sets x 30 sec' }
      ]
    },
    {
      category: 'Recovery',
      tasks: [
        { text: 'Foam Rolling', target: '15 mins' },
        { text: 'Static Stretching', target: '10-15 mins' },
        { text: 'Ice Bath / Cold Plunge', target: '10 mins' },
        { text: 'Meditation', target: '10 mins' }
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
    nav: { dashboard: '概览', tasks: '任务', calendar: '日历', stats: '统计', shop: '商店', settings: '设置' },
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
    openLibrary: '速度滑冰陆地训练核心动作库',
    closeLibrary: '关闭内容库',
    taskAdded: '已添加',
    profileAvatar: '自定义头像',
    uploadAvatarDesc: '上传你的专属照片',
    brandSub: '冰焰速滑训练系统',
    parentMode: '家长模式',
    unlockPrompt: '请输入 4 位数字密码解锁编辑权限',
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
    unlockedStatus: '权限已解锁',
    emojiPlaceholder: '图标 (Emoji)',
    itemNamePlaceholder: '商品名称',
    pointsRequired: '所需积分:',
    dailyProgress: '今日任务进度',
    completedTasks: '已完成 {completed}/{total}',
    weeklyActivity: '本周活跃星图',
    recentHighlight: '最新高光时刻',
    noRecentRecord: '暂无近期记录',
    keepItUp: '继续保持！',
    version: '版本 v1.0.0',
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
    ]
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
    settings: 'App Settings',
    customizePlan: 'Customize your training plan',
    raceDate: 'Race Target Date',
    weeklyTemplate: 'Weekly Template',
    saveSettings: 'Save Settings',
    savedSuccessfully: 'Saved!',
    loggedIn: 'Logged in:',
    nav: { dashboard: 'Home', tasks: 'Tasks', calendar: 'Calendar', stats: 'Stats', shop: 'Shop', settings: 'Settings' },
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
    openLibrary: 'Speed Skating Dryland Task Library',
    closeLibrary: 'Close Library',
    taskAdded: 'Added',
    profileAvatar: 'Custom Avatar',
    uploadAvatarDesc: 'Upload your profile photo',
    brandSub: 'TRAINING PLATFORM',
    parentMode: 'Parent Mode',
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
    unlockedStatus: 'Unlocked',
    emojiPlaceholder: 'Emoji',
    itemNamePlaceholder: 'Item Name',
    pointsRequired: 'Cost:',
    dailyProgress: 'Daily Progress',
    completedTasks: 'Completed {completed}/{total}',
    weeklyActivity: 'Weekly Activity',
    recentHighlight: 'Recent Highlight',
    noRecentRecord: 'No recent records',
    keepItUp: 'Keep it up!',
    version: 'Version v1.0.0',
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
    ]
  }
};

// 初始默认数据
const defaultData = {
  points: 0,
  language: 'en',
  theme: 'purple',
  avatar: '', 
  parentPin: '',
  pointsPerTask: 20,
  dailyBonusPoints: 50,
  completedDays: [], 
  customRewards: [
    { id: 1, name: 'Cheat Meal', cost: 500, icon: '🍔' },
    { id: 2, name: 'New Bearings', cost: 1200, icon: '⚙️' },
    { id: 3, name: 'Skip Core Set', cost: 300, icon: '🛋️' },
    { id: 4, name: 'New Gear Fund', cost: 3000, icon: '👕' },
  ],
  customDistances: ['Start', 'Lap', '500m', '777m', '1000m', '1500m'],
  rewardHistory: [],
  races: [
    { id: 1, name: 'National Champ', date: '2026-11-20' }
  ],
  weeklyTemplate: {
    0: 'Rest Day',
    1: 'Strength Day',
    2: 'Power/Sprint',
    3: 'Conditioning',
    4: 'Technique',
    5: 'Intervals',
    6: 'Endurance',
  },
  tasks: [
    { id: 1, text: 'Jogging', target: '15 mins', completed: false, isTemplate: true },
    { id: 2, text: 'Slide Board', target: '5 sets x 1 min', completed: false, isTemplate: true },
    { id: 3, text: 'Wall Sit', target: '3 sets x 1.5 mins', completed: false, isTemplate: true },
  ],
  records: [
    { date: '2026-05-01', time: 48.5 },
    { date: '2026-05-02', time: 47.8 },
    { date: '2026-05-04', time: 47.2 },
    { date: '2026-05-06', time: 46.5 },
  ],
  records777: [],
  records1000: [],
  records1500: [],
  recordsStart: [],
  recordsLap: []
};

const getPrevDayStr = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 辅助函数：根据不同的项目名称获取它在数据库里的存储Key
const getRecordsKey = (dist) => {
  if (dist === '500m') return 'records';
  if (dist === '777m') return 'records777';
  if (dist === '1000m') return 'records1000';
  if (dist === '1500m') return 'records1500';
  if (dist === '起跑' || dist === 'Start') return 'recordsStart';
  if (dist === '单圈' || dist === 'Lap') return 'recordsLap';
  return `records_${dist}`; // 对于全新的自定义名称（如 "111m"），生成新的专属key
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(defaultData);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentDistNames = data.customDistances || (data.language === 'en' ? ['Start', 'Lap', '500m', '777m', '1000m', '1500m'] : ['起跑', '单圈', '500m', '777m', '1000m', '1500m']);

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

  const [formRaces, setFormRaces] = useState(defaultData.races);
  const [formTemplate, setFormTemplate] = useState(defaultData.weeklyTemplate);
  const [formPointsPerTask, setFormPointsPerTask] = useState(defaultData.pointsPerTask);
  const [formDailyBonus, setFormDailyBonus] = useState(defaultData.dailyBonusPoints);
  const [formRewards, setFormRewards] = useState(defaultData.customRewards);
  const [formDistances, setFormDistances] = useState(currentDistNames);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [showLibrary, setShowLibrary] = useState(false);
  const [activeLibraryCat, setActiveLibraryCat] = useState(0);
  const [addedLibraryTaskIds, setAddedLibraryTaskIds] = useState([]);

  const [showHistory, setShowHistory] = useState(false);
  const [celebration, setCelebration] = useState(null);

  const statsScrollRef = useRef(null);
  const [statsCanScroll, setStatsCanScroll] = useState({ left: false, right: true });

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
    if (activeTab === 'stats') {
      handleStatsScroll();
      const timer = setTimeout(handleStatsScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, data.language, activeDistance, currentDistNames]);

  // 当选项被删除或改变时，确保当前激活的距离始终有效
  useEffect(() => {
    if (currentDistNames.length > 0 && !currentDistNames.includes(activeDistance)) {
      setActiveDistance(currentDistNames[0]);
    }
  }, [currentDistNames, activeDistance]);

  const t = translations[data.language || 'zh'];
  const tc = THEMES[data.theme] || THEMES.purple;

  const computedStreak = (() => {
    const days = data.completedDays || [];
    if (days.length === 0) return 0;
    
    const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
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
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const safeAppId = appId.replace(/\//g, '_');
    const userRef = doc(db, 'artifacts', safeAppId, 'users', user.uid, 'profile', 'main');
    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setData({ ...defaultData, ...docSnap.data() });
      } else {
        const safeDefault = JSON.parse(JSON.stringify(defaultData));
        setDoc(userRef, safeDefault);
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

  useEffect(() => {
    const currentRaces = data.races || (data.raceDate ? [{ id: 1, name: 'Main Target', date: data.raceDate }] : []);
    setFormRaces(currentRaces);
    setFormTemplate(data.weeklyTemplate);
    setFormPointsPerTask(data.pointsPerTask ?? 20);
    setFormDailyBonus(data.dailyBonusPoints ?? 50);
    setFormRewards(data.customRewards || defaultData.customRewards);
    
    // 初始化设置表单中的距离列表
    const initialDistances = data.customDistances || (data.language === 'en' ? ['Start', 'Lap', '500m', '777m', '1000m', '1500m'] : ['起跑', '单圈', '500m', '777m', '1000m', '1500m']);
    setFormDistances(initialDistances);
  }, [data.races, data.raceDate, data.weeklyTemplate, data.pointsPerTask, data.dailyBonusPoints, data.customRewards, data.customDistances, data.language]);

  const isParentMode = !data.parentPin || isUnlocked;

  const updateData = async (newData) => {
    if (!user) return;
    const merged = { ...data, ...newData };
    setData(merged); 
    const safeAppId = appId.replace(/\//g, '_');
    const userRef = doc(db, 'artifacts', safeAppId, 'users', user.uid, 'profile', 'main');
    const safeData = JSON.parse(JSON.stringify(merged));
    await setDoc(userRef, safeData, { merge: true });
  };

  const currentDayOfWeek = currentTime.getDay();
  const todayTrainingType = data.weeklyTemplate[currentDayOfWeek];

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
      setTimeout(() => alert(t.allCompletedAlert.replace('{bonus}', bonusPts)), 100);
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

  const addSpecificTask = (text, target) => {
    const newTasks = [
      ...data.tasks, 
      { 
        id: Date.now(), 
        text: text.trim(), 
        target: target ? target.trim() : null,
        completed: false, 
        isTemplate: false 
      }
    ];
    updateData({ tasks: newTasks });
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      addSpecificTask(newTaskText, newTaskTarget);
      setNewTaskText('');
      setNewTaskTarget('');
    }
  };

  const addFromLibrary = (libTask, idx) => {
    addSpecificTask(libTask.text, libTask.target);
    setAddedLibraryTaskIds(prev => [...prev, idx]);
    setTimeout(() => {
      setAddedLibraryTaskIds(prev => prev.filter(id => id !== idx));
    }, 1500);
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
    const time = parseFloat(newRecordTime);
    if (!isNaN(time) && time > 0) {
      let dateStr = '';
      if (newRecordDate) {
        dateStr = newRecordDate;
      } else {
        dateStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;
      }
      const newRecord = { date: dateStr, time: time };
      
      let updateObj = {};
      const key = getRecordsKey(activeDistance);
      
      const updatedRecords = [...(data[key] || []), newRecord];
      updatedRecords.sort((a, b) => {
        const dateA = a.date.includes('-') ? a.date : `${currentTime.getFullYear()}-${a.date.replace('/', '-')}`;
        const dateB = b.date.includes('-') ? b.date : `${currentTime.getFullYear()}-${b.date.replace('/', '-')}`;
        return dateA.localeCompare(dateB);
      });
      
      updateObj[key] = updatedRecords;
      updateObj.points = data.points + 50;
      
      updateData(updateObj);
      setNewRecordTime('');
    }
  };

  const buyReward = (reward) => {
    if (data.points >= reward.cost) {
      const newHistoryItem = {
        id: Date.now(),
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

  const translateDynamicData = async (targetLang, currentData) => {
    // 👇 注意：在本地 Vercel 部署时，请把 API Key 填入下面双引号中！
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const promptText = `Translate the string values in the following JSON to ${targetLang === 'en' ? 'English' : 'Simplified Chinese'}. Keep the exact JSON structure. Do NOT change keys or IDs.\n\n${JSON.stringify({
      weeklyTemplate: currentData.weeklyTemplate,
      tasks: currentData.tasks.map(t => ({ id: t.id, text: t.text, target: t.target || null })),
      customRewards: currentData.customRewards.map(r => ({ id: r.id, name: r.name })),
      customDistances: currentData.customDistances || ['Start', 'Lap', '500m', '777m', '1000m', '1500m']
    })}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
        const result = await res.json();
        
        if (!res.ok) {
           console.error("API Error:", result);
           throw new Error("API request failed");
        }

        if (result.candidates && result.candidates[0]) {
           const text = result.candidates[0].content.parts[0].text;
           const parsed = JSON.parse(text);
           const newTasks = currentData.tasks.map(t => {
              const translatedTask = parsed.tasks.find(pt => pt.id === t.id);
              return { 
                ...t, 
                text: translatedTask ? translatedTask.text : t.text,
                target: (translatedTask && translatedTask.target !== undefined) ? translatedTask.target : (t.target || null)
              };
           });
           const newRewards = currentData.customRewards.map(r => {
              const translatedReward = parsed.customRewards?.find(pr => pr.id === r.id);
              return {
                ...r,
                name: translatedReward ? translatedReward.name : r.name
              };
           });
           return { 
             weeklyTemplate: parsed.weeklyTemplate, 
             tasks: newTasks, 
             customRewards: newRewards,
             customDistances: parsed.customDistances || currentData.customDistances
           };
        }
      } catch (error) {
        if (i === 4) return null;
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }
    return null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150; 
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
    const activeRaces = (data.races || (data.raceDate ? [{ id: 1, name: t.raceDate, date: data.raceDate }] : []))
      .map(r => ({
        ...r,
        days: Math.ceil((new Date(r.date) - currentTime) / (1000 * 60 * 60 * 24))
      }))
      .filter(r => r.days >= -1)
      .sort((a, b) => a.days - b.days);

    const nearestRace = activeRaces.length > 0 ? activeRaces[0] : null;
    const otherRaces = activeRaces.slice(1);

    // 计算今日进度数据
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.completed).length;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // 计算本周打卡星图数据
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
      
      currentWeek.push({
        name: t.daysNames[i],
        nameDisplay: data.language === 'en' ? t.daysNames[i].substring(0,3) : t.daysNames[i].replace('周',''),
        isCompleted,
        isFuture,
        isToday: i === dayOfWeek
      });
    }

    // 计算最新高光时刻数据，遍历所有自定义项目
    const allRecords = currentDistNames.flatMap(dist => {
      const key = getRecordsKey(dist);
      return (data[key] || []).map(r => ({ ...r, distance: dist }));
    });
    
    allRecords.sort((a, b) => {
      const dateA = a.date.includes('-') ? a.date : `${currentTime.getFullYear()}-${a.date.replace('/', '-')}`;
      const dateB = b.date.includes('-') ? b.date : `${currentTime.getFullYear()}-${b.date.replace('/', '-')}`;
      return dateB.localeCompare(dateA);
    });
    const latestRecord = allRecords.length > 0 ? allRecords[0] : null;

    // 计算不同时间段的问候语
    const hour = currentTime.getHours();
    let greetingIndex = 0;
    if (hour >= 5 && hour < 9) greetingIndex = 1; // 清晨
    else if (hour >= 9 && hour < 12) greetingIndex = 2; // 上午
    else if (hour >= 12 && hour < 18) greetingIndex = 3; // 下午
    else if (hour >= 18 && hour < 23) greetingIndex = 4; // 晚间
    else greetingIndex = 0; // 深夜

    // 计算每日随机贴士
    const dayOfYear = Math.floor((currentTime - new Date(currentTime.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = dayOfYear % t.tips.length;

    return (
      <div className="space-y-4">
        {/* 顶部标题与日期 */}
        <div className={`${tc.cardBg} p-6 rounded-2xl shadow-sm`}>
          <h2 className={`${tc.textPrimary} opacity-80 text-sm font-semibold flex items-center gap-2`}>
            <Calendar size={16} /> 
            {currentTime.toLocaleDateString(data.language === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </h2>
          <h1 className={`text-2xl font-black ${tc.textHeading} mt-2 tracking-tight leading-snug`}>{t.greetings[greetingIndex]}</h1>
        </div>

        {/* 模块：每日速滑教练贴士 */}
        <div className={`bg-gradient-to-br ${tc.navActive} border ${tc.borderLight} p-5 rounded-2xl shadow-sm relative overflow-hidden`}>
          <Quote size={80} className={`absolute -right-2 -bottom-2 opacity-5 ${tc.textPrimary} -rotate-12`} />
          <div className={`flex items-center gap-2 mb-2 ${tc.textPrimary}`}>
            <Sparkles size={18} className="animate-pulse" />
            <span className="text-sm font-bold">{t.coachTipTitle}</span>
          </div>
          <p className={`text-sm ${tc.textHeading} font-medium leading-relaxed relative z-10 pr-4`}>
            "{t.tips[tipIndex]}"
          </p>
        </div>

        {/* 模块1：今日任务进度条 */}
        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
          <div className="flex justify-between items-end mb-3">
            <h3 className={`text-sm font-bold ${tc.textHeading} flex items-center gap-2`}><CheckCircle2 size={18} className={tc.textPrimary} /> {t.dailyProgress}</h3>
            <span className={`text-xs font-bold ${tc.textMuted}`}>{t.completedTasks.replace('{completed}', completedTasks).replace('{total}', totalTasks)}</span>
          </div>
          <div className={`h-3 w-full ${tc.badgeBg} rounded-full overflow-hidden`}>
            <div 
              className={`h-full bg-gradient-to-r ${tc.gradientIcon} transition-all duration-500 ease-out`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 模块2：本周活跃星图 */}
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
                  {day.isCompleted ? <Flame size={16} /> : <span className="text-[11px] font-bold">{day.nameDisplay[0]}</span>}
                </div>
                <span className={`text-[10px] font-bold ${day.isToday ? tc.textPrimary : tc.textMuted}`}>{day.nameDisplay}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 原有卡片：比赛倒计时与今日核心 */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-gradient-to-br ${tc.gradientCard} p-5 rounded-2xl shadow-md flex flex-col justify-between`}>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Trophy size={18} className="shrink-0" />
              <span className="text-sm font-medium line-clamp-1 break-all">
                {nearestRace ? nearestRace.name : t.daysToRace}
              </span>
            </div>
            <div className="text-3xl font-black mt-1">
              {nearestRace ? Math.max(0, nearestRace.days) : '--'} <span className="text-lg font-normal opacity-80">{t.days}</span>
            </div>
            <div className="text-xs mt-1 opacity-80">{t.keepGoing}</div>
          </div>
          
          <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
            <div className={`flex items-center gap-2 mb-2 ${tc.textMuted}`}>
              <Zap size={18} className="text-orange-400" />
              <span className="text-sm font-medium">{t.todayFocus}</span>
            </div>
            <div className={`text-xl font-bold ${tc.textPrimary} leading-tight`}>{todayTrainingType || 'Rest'}</div>
          </div>
        </div>

        {/* 模块3：最新高光时刻 */}
        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
          <div className={`flex items-center gap-2 mb-3 ${tc.textMuted}`}>
            <Award size={18} className="text-yellow-500" />
            <span className="text-sm font-bold">{t.recentHighlight}</span>
          </div>
          {latestRecord ? (
            <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl">
              <div>
                <div className={`text-2xl font-black ${tc.textPrimary}`}>{latestRecord.time}s</div>
                <div className={`text-xs ${tc.textMuted} mt-1 font-medium`}>{latestRecord.date.replace(/-/g, '/')} • {latestRecord.distance}</div>
              </div>
              <div className={`px-3 py-1.5 ${tc.badgeYellow} rounded-lg text-xs font-bold shadow-sm`}>
                {t.keepItUp}
              </div>
            </div>
          ) : (
            <div className={`text-sm ${tc.textMuted} py-2`}>{t.noRecentRecord}</div>
          )}
        </div>

        {/* 其他比赛 */}
        {otherRaces.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className={`text-sm font-bold ${tc.textHeading} px-1 mb-2`}>{t.upcomingRaces}</h3>
            {otherRaces.map(r => (
              <div key={r.id} className={`${tc.cardBg} p-3 rounded-xl shadow-sm flex justify-between items-center`}>
                <span className={`font-medium ${tc.appText} text-sm truncate pr-2`}>{r.name}</span>
                <div className={`${tc.textPrimary} font-black text-sm whitespace-nowrap ${tc.badgeBg} px-2 py-1 rounded`}>
                  {Math.max(0, r.days)} {t.days}
                </div>
              </div>
            ))}
          </div>
        )}
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
            {t.daysNames.map(day => (
              <div key={day} className={`text-center text-xs font-bold ${tc.textMuted}`}>
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
                  className={`relative h-10 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all ${
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
            {t.earnPoints.replace('{task}', data.pointsPerTask ?? 20).replace('{bonus}', data.dailyBonusPoints ?? 50)}
          </p>
        </div>
        <div className={`${tc.textPrimary} font-black ${tc.badgeBg} px-4 py-2 rounded-xl text-lg shadow-sm max-w-[50%] truncate text-right`}>
          {(todayTrainingType || '').split(' (')[data.language === 'en' ? 1 : 0]?.replace(')', '') || todayTrainingType}
        </div>
      </div>

      <div className="space-y-3">
        {data.tasks.map(task => {
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
              <div className={`flex-1 flex flex-col min-w-0 ${task.completed ? tc.textMuted + ' line-through' : tc.appText}`}>
                <span className="text-base font-medium truncate">{task.text}</span>
                {task.target && (
                  <span className={`text-xs mt-0.5 font-bold truncate ${task.completed ? tc.textMuted : tc.textPrimary}`}>
                    🎯 {t.targetLabel}: {task.target}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 ml-2 shrink-0">
                {!task.completed && (
                  <span className={`text-[10px] ${tc.badgeYellow} px-2 py-1 rounded-md shrink-0 mr-1`}>
                    +{data.pointsPerTask ?? 20}
                  </span>
                )}
                {task.isTemplate && !task.completed && (
                  <span className={`text-[10px] ${tc.badgeBg} ${tc.textPrimary} font-bold px-2 py-1 rounded-md shrink-0 mr-1`}>{t.template}</span>
                )}
                
                {isParentMode && !task.completed && (
                  <button 
                    onClick={(e) => startEditTask(e, task)} 
                    className={`p-1.5 ${tc.textMuted} hover:${tc.textPrimary} active:opacity-70 rounded-lg transition-colors`}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                {isParentMode && (
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
        <div className={`flex flex-col gap-3 pt-4 border-t ${tc.borderLight}`}>
          <button 
            onClick={() => setShowLibrary(true)}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed ${tc.borderLight} ${tc.badgeBg} ${tc.textPrimary} hover:opacity-80 transition-all font-bold text-base shadow-sm`}
          >
            <Dumbbell size={24} />
            {t.openLibrary}
          </button>

          <div className="flex flex-col gap-2">
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
      const key = getRecordsKey(activeDistance);
      return data[key] || [];
    };

    const currentRecords = getRecords();

    const renderChart = () => {
      if (currentRecords.length === 0) return <div className={`py-6 text-center text-sm ${tc.textMuted}`}>{t.noData}</div>;
      
      const minTime = Math.min(...currentRecords.map(r => r.time)) - 1;
      const maxTime = Math.max(...currentRecords.map(r => r.time)) + 1;
      const range = maxTime - minTime || 1;
      const height = 160;
      const width = 300;
      const padding = 20;

      const pointsStr = currentRecords.map((r, index) => {
        const x = padding + (index * ((width - padding * 2) / (currentRecords.length - 1 || 1)));
        const y = height - padding - ((r.time - minTime) / range) * (height - padding * 2);
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="mt-4 overflow-visible">
          <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke={tc.svgGrid} strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke={tc.svgGrid} strokeWidth="1" strokeDasharray="4" />
          <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke={tc.svgGrid} strokeWidth="1" strokeDasharray="4" />
          
          <polyline points={pointsStr} fill="none" stroke={tc.svgLine} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {currentRecords.map((r, index) => {
            const x = padding + (index * ((width - padding * 2) / (currentRecords.length - 1 || 1)));
            const y = height - padding - ((r.time - minTime) / range) * (height - padding * 2);
            
            const displayDate = r.date.includes('-') ? r.date.substring(5).replace('-', '/') : r.date;
            
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="5" fill={tc.svgLine} stroke={data.theme==='black'?'#0f172a':'#ffffff'} strokeWidth="2" />
                <text x={x} y={y - 12} fill={tc.svgLine} fontSize="10" fontWeight="bold" textAnchor="middle">{r.time}s</text>
                <text x={x} y={height} fill={data.theme==='black'?'#94a3b8':'#9ca3af'} fontSize="10" textAnchor="middle">{displayDate}</text>
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

        {/* 修复的横向滑动导航区域 */}
        <div className="relative flex items-center -mx-1 px-1 py-1">
          {statsCanScroll.left && (
            <button
              onClick={() => statsScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
              className={`absolute left-0 z-10 p-1.5 rounded-full shadow-md border ${tc.borderLight} ${tc.cardBg} ${tc.textPrimary} hover:opacity-80 transition-all`}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div 
            ref={statsScrollRef}
            onScroll={handleStatsScroll}
            className="flex gap-2 overflow-x-auto py-1 no-scrollbar w-full scroll-smooth"
          >
            {currentDistNames.map(dist => {
              return (
                <button
                  key={dist}
                  onClick={() => setActiveDistance(dist)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    (activeDistance === dist)
                      ? tc.btnPrimary + ' shadow-md' 
                      : tc.cardBg + ' ' + tc.textPrimary + ' hover:opacity-80'
                  }`}
                >
                  {dist}
                </button>
              )
            })}
          </div>

          {statsCanScroll.right && (
            <button
              onClick={() => statsScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
              className={`absolute right-0 z-10 p-1.5 rounded-full shadow-md border ${tc.borderLight} ${tc.cardBg} ${tc.textPrimary} hover:opacity-80 animate-pulse transition-all`}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className={`${tc.textHeading} font-bold`}>{activeDistance} {t.recentRecords}</h3>
            <span className={`text-xs font-bold ${tc.badgeBg} ${tc.textPrimary} px-2 py-1 rounded-md`}>
              {t.latest}: {currentRecords.length > 0 ? currentRecords[currentRecords.length - 1].time : '--'}s
            </span>
          </div>
          {renderChart()}
        </div>

        {isParentMode && (
          <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm`}>
            <h3 className={`${tc.textHeading} font-bold mb-3`}>{t.recordNew}</h3>
            <div className="flex flex-col gap-3">
              <input 
                type="date" 
                value={newRecordDate}
                onChange={(e) => setNewRecordDate(e.target.value)}
                className={`w-full ${tc.inputBg} rounded-xl px-4 py-3 ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.1"
                  value={newRecordTime}
                  onChange={(e) => setNewRecordTime(e.target.value)}
                  placeholder={t.inputTime}
                  className={`flex-1 min-w-0 ${tc.inputBg} rounded-xl px-4 py-3 ${tc.appText} focus:outline-none focus:ring-2 ${tc.focusRing}`}
                />
                <button 
                  onClick={addRecord}
                  className={`${tc.btnPrimary} px-6 py-3 rounded-xl font-bold shadow-md transition-colors shrink-0 whitespace-nowrap`}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ShopView = () => {
    const currentRewards = data.customRewards || defaultData.customRewards;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.rewardShop}</h2>
            <p className={`text-sm ${tc.textMuted} mt-1`}>{t.treatYourself}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <button onClick={() => setShowHistory(true)} className={`flex items-center gap-1 text-[10px] ${tc.textPrimary} ${tc.badgeBg} px-2 py-1.5 rounded-full font-bold shadow-sm hover:opacity-80 transition-opacity`}>
              <Clock size={12} /> {t.rewardHistory}
            </button>
            <div className={`text-xs ${tc.textMuted} font-medium mt-1`}>{t.availablePoints}</div>
            <div className="text-2xl font-black text-yellow-500 leading-none">{data.points}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentRewards.map(reward => (
            <div key={reward.id} className={`${tc.cardBg} p-5 rounded-2xl shadow-sm flex flex-col items-center text-center`}>
              <div className="text-4xl mb-3 drop-shadow-sm">{reward.icon}</div>
              <div className={`font-bold ${tc.appText} mb-1 text-sm leading-tight h-10 flex items-center`}>{reward.name}</div>
              <div className="text-yellow-500 font-black text-sm mb-4">{reward.cost} {t.points}</div>
              <button 
                onClick={() => buyReward(reward)}
                disabled={data.points < reward.cost}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                  data.points >= reward.cost 
                    ? tc.btnPrimary + ' shadow-md active:scale-95' 
                    : (data.theme === 'black' ? 'bg-slate-700 text-slate-500' : 'bg-gray-100 text-gray-400') + ' cursor-not-allowed'
                }`}
              >
                {data.points >= reward.cost ? t.redeem : t.notEnough}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const handleSaveSettings = () => {
      updateData({ 
        races: formRaces, 
        weeklyTemplate: formTemplate,
        pointsPerTask: parseInt(formPointsPerTask, 10) || 0,
        dailyBonusPoints: parseInt(formDailyBonus, 10) || 0,
        customRewards: formRewards.map(r => ({ ...r, cost: parseInt(r.cost, 10) || 0 })),
        customDistances: formDistances
      });
      
      setSaveSuccess(true);
      if (navigator.vibrate) navigator.vibrate(50); 
      setTimeout(() => setSaveSuccess(false), 2000);
    };

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
      await updateData({ language: targetLang });
    };

    const renderThemeSelector = () => (
      <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
        <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
          <Palette size={18} /> {t.themeSettingTitle}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.keys(THEMES).map(key => {
            const theme = THEMES[key];
            const isActive = (data.theme || 'purple') === key;
            return (
              <button
                key={key}
                onClick={() => updateData({ theme: key })}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                  isActive ? tc.badgeBg + ' ring-2 ' + tc.focusRing : 'hover:opacity-70 ' + tc.calEmpty.split(' ')[0]
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.gradientIcon} shadow-sm border border-white/20`}></div>
                <span className={`text-[10px] font-bold ${isActive ? tc.textPrimary : tc.textMuted}`}>
                  {data.language === 'en' ? theme.enName : theme.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className={`text-2xl font-black ${tc.textHeading}`}>{t.settings}</h2>
          <p className={`text-sm ${tc.textMuted} mt-1`}>{t.customizePlan}</p>
        </div>

        {/* 语言选项置顶，纯静态切换 */}
        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm flex justify-between items-center`}>
          <h3 className={`${tc.textHeading} font-bold flex items-center gap-2 shrink-0`}>
            <Globe size={18} /> {t.language}
          </h3>
          <button 
            onClick={toggleLanguage}
            className={`${tc.badgeBg} ${tc.textPrimary} px-4 py-2 rounded-lg font-bold text-sm hover:opacity-80 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap`}
          >
            {data.language === 'en' ? '🇨🇳 中文' : '🇬🇧 English'}
          </button>
        </div>

        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm border-2 ${data.parentPin && !isUnlocked ? 'border-orange-300 bg-orange-50/30' : tc.borderLight}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
              {data.parentPin && !isUnlocked ? <Lock size={18} className="text-orange-500" /> : <ShieldCheck size={18} className="text-green-500" />}
              {t.parentMode}
            </h3>
            {data.parentPin && isUnlocked && (
              <button onClick={() => setIsUnlocked(false)} className={`text-xs font-bold ${tc.btnCancel} px-3 py-1.5 rounded-lg shrink-0 whitespace-nowrap`}>
                {t.lockNow}
              </button>
            )}
          </div>
          
          {!data.parentPin && (
            <div className="space-y-3">
              <p className={`text-xs ${tc.textMuted}`}>{t.setPinPrompt}</p>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                  placeholder={t.pinPlaceholder}
                  className={`flex-1 min-w-0 ${tc.inputBg} rounded-xl px-4 py-2 text-center tracking-[0.5em] font-bold`}
                />
                <button onClick={handleSetPin} className={`${tc.btnPrimary} px-4 py-2 rounded-xl font-bold text-sm shadow-sm shrink-0 whitespace-nowrap`}>
                  {t.setPin}
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
              <button onClick={handleRemovePin} className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded shrink-0 whitespace-nowrap">
                {t.removePin}
              </button>
            </div>
          )}

          {pinError && <div className={`text-xs text-red-500 font-bold mt-2 animate-pulse`}>{pinError}</div>}
        </div>

        <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              {data.avatar ? (
                <img src={data.avatar} alt="Avatar" className={`w-16 h-16 rounded-full object-cover border-2 ${tc.borderLight}`} />
              ) : (
                <div className={`w-16 h-16 rounded-full ${tc.badgeBg} flex items-center justify-center border-2 ${tc.borderLight}`}>
                  <User size={24} className={tc.textPrimary} />
                </div>
              )}
              <label className={`absolute bottom-0 right-0 ${tc.btnPrimary} p-1.5 rounded-full cursor-pointer shadow-md border-2 ${tc.borderLight} transition-all`}>
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h3 className={`${tc.textHeading} font-bold`}>{t.profileAvatar}</h3>
              <p className={`text-xs ${tc.textMuted}`}>{t.uploadAvatarDesc}</p>
            </div>
          </div>
        </div>

        {renderThemeSelector()}

        {isParentMode && (
          <>
            {/* 新增：成绩项目距离管理 */}
            <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
              <div className="flex justify-between items-center">
                <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                  <LineChart size={18} /> {t.distanceManagement}
                </h3>
                <button 
                  onClick={() => setFormDistances([...formDistances, t.newDistance])}
                  className={`${tc.textPrimary} ${tc.badgeBg} p-1.5 rounded-lg hover:opacity-80 transition-colors shrink-0`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formDistances.map((dist, index) => (
                  <div key={index} className={`flex items-center gap-1 ${tc.inputBg} pl-3 pr-1 py-1.5 rounded-xl border border-transparent focus-within:${tc.borderLight}`}>
                    <input 
                      type="text" 
                      value={dist}
                      onChange={(e) => {
                        const newDists = [...formDistances];
                        newDists[index] = e.target.value;
                        setFormDistances(newDists);
                      }}
                      className={`w-16 bg-transparent text-sm font-bold ${tc.appText} focus:outline-none`}
                    />
                    <button 
                      onClick={() => setFormDistances(formDistances.filter((_, i) => i !== index))}
                      className={`p-1 ${tc.textMuted} hover:text-red-500 transition-colors rounded-lg`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
              <div className="flex justify-between items-center">
                <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                  <ShoppingCart size={18} /> {t.shopManagement}
                </h3>
                <button 
                  onClick={() => setFormRewards([...formRewards, { id: Date.now(), name: '', cost: 100, icon: '🎁' }])}
                  className={`${tc.textPrimary} ${tc.badgeBg} p-1.5 rounded-lg hover:opacity-80 transition-colors shrink-0`}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {formRewards.map((reward, index) => (
                  <div key={reward.id} className={`flex flex-col gap-2 p-3 ${tc.inputBg} rounded-xl relative pr-10`}>
                    <button 
                      onClick={() => setFormRewards(formRewards.filter(r => r.id !== reward.id))}
                      className={`absolute top-1/2 -translate-y-1/2 right-3 ${tc.textMuted} hover:text-red-500 transition-colors`}
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={reward.icon}
                        onChange={(e) => {
                          const newRewards = [...formRewards];
                          newRewards[index].icon = e.target.value;
                          setFormRewards(newRewards);
                        }}
                        placeholder={t.emojiPlaceholder}
                        className={`w-14 shrink-0 text-center ${tc.cardBg} rounded-lg px-2 py-2 text-xl focus:outline-none focus:ring-1 ${tc.focusRing}`}
                      />
                      <input 
                        type="text" 
                        value={reward.name}
                        onChange={(e) => {
                          const newRewards = [...formRewards];
                          newRewards[index].name = e.target.value;
                          setFormRewards(newRewards);
                        }}
                        placeholder={t.itemNamePlaceholder}
                        className={`flex-1 min-w-0 ${tc.cardBg} rounded-lg px-3 py-2 text-sm ${tc.appText} focus:outline-none focus:ring-1 ${tc.focusRing}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${tc.textMuted} shrink-0`}>{t.pointsRequired}</span>
                      <input 
                        type="number" 
                        value={reward.cost}
                        onChange={(e) => {
                          const newRewards = [...formRewards];
                          newRewards[index].cost = e.target.value;
                          setFormRewards(newRewards);
                        }}
                        className={`flex-1 min-w-0 ${tc.cardBg} rounded-lg px-3 py-2 text-sm ${tc.appText} focus:outline-none focus:ring-1 ${tc.focusRing}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
              <div className="flex justify-between items-center">
                <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                  <Trophy size={18} /> {t.raceDate}
                </h3>
                <button 
                  onClick={() => setFormRaces([...formRaces, { id: Date.now(), name: '', date: '' }])}
                  className={`${tc.textPrimary} ${tc.badgeBg} p-1.5 rounded-lg hover:opacity-80 transition-colors shrink-0`}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {formRaces.map((race, index) => (
                  <div key={race.id} className={`flex flex-col gap-2 p-3 ${tc.inputBg} rounded-xl relative`}>
                    <button 
                      onClick={() => setFormRaces(formRaces.filter(r => r.id !== race.id))}
                      className={`absolute top-3 right-3 ${tc.textMuted} hover:text-red-500 transition-colors`}
                    >
                      <X size={16} />
                    </button>
                    <div className="pr-6">
                      <input 
                        type="text" 
                        value={race.name}
                        onChange={(e) => {
                          const newRaces = [...formRaces];
                          newRaces[index].name = e.target.value;
                          setFormRaces(newRaces);
                        }}
                        placeholder={t.raceName}
                        className={`w-full ${tc.cardBg} rounded-lg px-3 py-2 text-sm ${tc.appText} focus:outline-none focus:ring-1 ${tc.focusRing} mb-2`}
                      />
                      <input 
                        type="date" 
                        value={race.date}
                        onChange={(e) => {
                          const newRaces = [...formRaces];
                          newRaces[index].date = e.target.value;
                          setFormRaces(newRaces);
                        }}
                        className={`w-full ${tc.cardBg} rounded-lg px-3 py-2 text-sm ${tc.appText} focus:outline-none focus:ring-1 ${tc.focusRing}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
              <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                <Calendar size={18} /> {t.weeklyTemplate}
              </h3>
              <div className="space-y-3">
                {t.daysNames.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className={`w-10 text-sm font-bold ${tc.textMuted} shrink-0`}>{day}</span>
                    <input 
                      type="text" 
                      value={formTemplate[index] || ''}
                      onChange={(e) => setFormTemplate({...formTemplate, [index]: e.target.value})}
                      className={`flex-1 min-w-0 ${tc.inputBg} rounded-lg px-3 py-2 text-sm ${tc.appText} focus:outline-none focus:ring-1 ${tc.focusRing}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={`${tc.cardBg} p-5 rounded-2xl shadow-sm space-y-4`}>
              <h3 className={`${tc.textHeading} font-bold flex items-center gap-2`}>
                <Award size={18} /> {t.pointsSettingTitle}
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center justify-between gap-3 ${tc.inputBg} p-3 rounded-xl`}>
                  <span className={`text-sm font-bold ${tc.appText} shrink-0`}>{t.pointsPerTask}</span>
                  <input 
                    type="number" 
                    value={formPointsPerTask}
                    onChange={(e) => setFormPointsPerTask(e.target.value)}
                    className={`w-24 shrink-0 ${tc.cardBg} rounded-lg px-3 py-1.5 text-sm ${tc.appText} text-center focus:outline-none focus:ring-1 ${tc.focusRing}`}
                  />
                </div>
                <div className={`flex items-center justify-between gap-3 ${tc.inputBg} p-3 rounded-xl`}>
                  <span className={`text-sm font-bold ${tc.appText} shrink-0`}>{t.dailyBonusPoints}</span>
                  <input 
                    type="number" 
                    value={formDailyBonus}
                    onChange={(e) => setFormDailyBonus(e.target.value)}
                    className={`w-24 shrink-0 ${tc.cardBg} rounded-lg px-3 py-1.5 text-sm ${tc.appText} text-center focus:outline-none focus:ring-1 ${tc.focusRing}`}
                  />
                </div>
              </div>
            </div>

            {/* 按钮反馈交互 */}
            <button 
              onClick={handleSaveSettings}
              disabled={saveSuccess}
              className={`w-full py-4 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-all duration-300 ${
                saveSuccess 
                  ? 'bg-green-500 hover:bg-green-500 text-white scale-[0.98]' 
                  : tc.btnPrimary
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={20} className="animate-bounce" /> 
                  {t.savedSuccessfully}
                </>
              ) : (
                <>
                  <Save size={20} /> 
                  {t.saveSettings}
                </>
              )}
            </button>
          </>
        )}

        {/* --- 软件关于与版权信息 --- */}
        <div className="pt-8 pb-4 flex flex-col items-center justify-center opacity-80">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tc.gradientIcon} flex items-center justify-center shadow-md mb-3`}>
            <Flame size={24} className="text-white" />
          </div>
          <h3 className={`font-black text-lg ${tc.textHeading} tracking-tight`}>BLAZE SKATE</h3>
          <p className={`text-[10px] font-bold ${tc.textPrimary} tracking-widest uppercase mt-0.5`}>
            {t.brandSub}
          </p>
          
          <div className={`mt-4 text-center space-y-1`}>
            <p className={`text-xs font-medium ${tc.textMuted}`}>{t.version}</p>
            <p className={`text-[10px] ${tc.textMuted}`}>{t.copyright}</p>
            <p className={`text-[10px] ${tc.textMuted} flex items-center justify-center gap-1 mt-2`}>
              <User size={10} /> {t.loggedIn} {user?.uid.slice(0,8)}...
            </p>
          </div>
        </div>
      </div>
    );
  };

  const TaskLibraryModal = () => {
    if (!showLibrary) return null;
    const currentLib = TASK_LIBRARY[data.language || 'zh'];
    const activeData = currentLib[activeLibraryCat];

    return (
      <div className={`fixed inset-0 z-50 flex flex-col ${tc.appBg} transition-colors duration-300`}>
        <div className={`flex items-center justify-between px-5 py-4 ${tc.headerBg} border-b ${tc.borderLight}`}>
          <button onClick={() => setShowLibrary(false)} className={`p-2 -ml-2 ${tc.textMuted} hover:${tc.textPrimary} shrink-0`}>
            <ArrowLeft size={24} />
          </button>
          <h2 className={`text-lg font-black ${tc.textHeading} truncate`}>{t.openLibrary}</h2>
          <div className="w-8 shrink-0"></div>
        </div>

        <div className={`flex gap-2 px-5 py-3 overflow-x-auto no-scrollbar border-b ${tc.borderLight}`}>
          {currentLib.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveLibraryCat(idx)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                activeLibraryCat === idx 
                  ? tc.btnPrimary + ' shadow-md' 
                  : tc.cardBg + ' ' + tc.textPrimary + ' hover:opacity-80'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {activeData.tasks.map((libTask, idx) => {
            const isAdded = addedLibraryTaskIds.includes(idx);
            return (
              <div key={idx} className={`p-4 ${tc.cardBg} rounded-xl shadow-sm flex items-center justify-between transition-all`}>
                <div className="flex-1 pr-4 min-w-0">
                  <div className={`font-bold ${tc.appText} text-base mb-1 truncate`}>{libTask.text}</div>
                  <div className={`text-xs font-medium ${tc.textPrimary} truncate`}>🎯 {t.targetLabel}: {libTask.target}</div>
                </div>
                <button
                  onClick={() => addFromLibrary(libTask, idx)}
                  disabled={isAdded}
                  className={`p-2 rounded-xl transition-all flex flex-col items-center justify-center min-w-[56px] shrink-0 ${
                    isAdded ? 'bg-green-100 text-green-600' : tc.badgeBg + ' ' + tc.textPrimary + ' hover:opacity-80'
                  }`}
                >
                  {isAdded ? <Check size={20} /> : <Plus size={20} />}
                  {isAdded && <span className="text-[10px] mt-0.5 whitespace-nowrap">{t.taskAdded}</span>}
                </button>
              </div>
            );
          })}
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

  if (loading) {
    return (
      <div className={`min-h-screen ${THEMES.purple.appBg} flex flex-col items-center justify-center ${THEMES.purple.textPrimary} font-sans max-w-md mx-auto shadow-2xl`}>
        <div className={`w-12 h-12 border-4 ${THEMES.purple.spinner} rounded-full animate-spin mb-4`}></div>
        <p className="font-bold">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${tc.appBg} ${tc.appText} font-sans max-w-md mx-auto shadow-2xl relative pb-24 transition-colors duration-300`}>
      {/* 全局隐藏原生滚动条的样式 */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <header className={`flex justify-between items-center px-5 py-3 sticky top-0 ${tc.headerBg} backdrop-blur-md z-10 border-b ${tc.borderLight} shadow-sm transition-colors duration-300`}>
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
          <div className={`flex items-center gap-1 ${tc.badgeOrange} px-3 py-1.5 rounded-full`}>
            <Flame size={16} />
            <span className="font-bold text-sm">{computedStreak}</span>
          </div>
          <div className={`flex items-center gap-1 ${tc.badgeYellow} px-3 py-1.5 rounded-full`}>
            <Trophy size={16} />
            <span className="font-bold text-sm">{data.points}</span>
          </div>
          
          {data.avatar ? (
            <img src={data.avatar} alt="User Avatar" className={`w-10 h-10 rounded-full object-cover border-2 ${tc.borderLight} shadow-sm ml-1 shrink-0`} />
          ) : (
            <div className={`w-10 h-10 rounded-full ${tc.badgeBg} flex items-center justify-center border-2 ${tc.borderLight} shadow-sm ml-1 shrink-0`}>
              <User size={18} className={tc.textPrimary} />
            </div>
          )}
        </div>
      </header>

      <main className="p-5">
        {activeTab === 'dashboard' && DashboardView()}
        {activeTab === 'tasks' && TasksView()}
        {activeTab === 'calendar' && CalendarView()}
        {activeTab === 'stats' && StatsView()}
        {activeTab === 'shop' && ShopView()}
        {activeTab === 'settings' && SettingsView()}
      </main>

      <nav className={`fixed bottom-0 w-full max-w-md ${tc.navBg} border-t ${tc.borderLight} pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)] transition-colors duration-300`}>
        <div className="flex justify-between items-center p-2 px-2">
          {[
            { id: 'dashboard', icon: Home, label: t.nav.dashboard },
            { id: 'tasks', icon: ListTodo, label: t.nav.tasks },
            { id: 'calendar', icon: CalendarDays, label: t.nav.calendar },
            { id: 'stats', icon: LineChart, label: t.nav.stats },
            { id: 'shop', icon: ShoppingCart, label: t.nav.shop },
            { id: 'settings', icon: Settings, label: t.nav.settings },
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
                <span className="text-[10px] font-bold whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {TaskLibraryModal()}
      {RewardHistoryModal()}

      {celebration && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] flex flex-col items-center shadow-2xl animate-[bounce_1s_ease-in-out]">
            <div className="text-7xl mb-6">{celebration.icon}</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">{t.redeemSuccess}</h2>
            <p className="text-gray-500 text-center font-medium max-w-[200px]">
              {t.enjoyReward.replace('{reward}', celebration.name)}
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
}