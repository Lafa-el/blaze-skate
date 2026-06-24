import { createPlanTask, createTrainingPlan } from './plans.js';

const toDateString = (date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const addDays = (dateString, daysToAdd) => {
  const [year, month, day] = String(dateString || '').split('-').map(Number);
  const date = new Date(year, month - 1, day + daysToAdd);
  return toDateString(date);
};

const createTemplateTask = (input) => ({
  text: input.text,
  target: input.target || null,
  desc: input.desc || null,
  category: input.category || 'other',
  durationMinutes: input.durationMinutes || null,
  intensity: input.intensity || null,
});

const TRAINING_PLAN_TEMPLATES = [
  {
    id: 'regular_week',
    title: {
      en: 'Regular Training Week',
      zh: '常规训练周',
    },
    focus: 'Balanced weekly training',
    days: [
      {
        focus: 'Technique and activation',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Balanced technique laps', category: 'ice', durationMinutes: 75, intensity: 'medium' }),
          createTemplateTask({ text: 'Dryland Activation', target: 'Core and ankle prep', category: 'dryland', durationMinutes: 25, intensity: 'low' }),
        ],
      },
      {
        focus: 'Aerobic technique',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Steady rhythm and corners', category: 'ice', durationMinutes: 80, intensity: 'medium' }),
          createTemplateTask({ text: 'Mobility', target: 'Hips and ankles', category: 'mobility', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Running and recovery',
        tasks: [
          createTemplateTask({ text: 'Running Intervals', target: 'Short aerobic repeats', category: 'running', durationMinutes: 35, intensity: 'medium' }),
          createTemplateTask({ text: 'Recovery Mobility', target: 'Easy stretch routine', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Technique review',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Corner consistency', category: 'ice', durationMinutes: 75, intensity: 'medium' }),
          createTemplateTask({ text: 'Video Review', target: 'Body position notes', category: 'video', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Strength support',
        tasks: [
          createTemplateTask({ text: 'Strength', target: 'Lower body and core', category: 'strength', durationMinutes: 45, intensity: 'medium' }),
          createTemplateTask({ text: 'Mobility', target: 'Post-strength reset', category: 'mobility', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Starts and race rhythm',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Race rhythm laps', category: 'ice', durationMinutes: 80, intensity: 'medium' }),
          createTemplateTask({ text: 'Starts', target: 'First 5 steps', category: 'ice', durationMinutes: 20, intensity: 'high' }),
        ],
      },
      {
        focus: 'Recovery',
        tasks: [
          createTemplateTask({ text: 'Recovery / Rest', target: 'Easy walk and stretching', category: 'recovery', durationMinutes: 25, intensity: 'low' }),
        ],
      },
    ],
  },
  {
    id: 'technique_focus_week',
    title: {
      en: 'Technique Focus Week',
      zh: '技术重点周',
    },
    focus: 'Corner technique, body position, and control',
    days: [
      {
        focus: 'Corner entry',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Corner entry line', category: 'ice', durationMinutes: 75, intensity: 'medium' }),
          createTemplateTask({ text: 'Mobility', target: 'Hip range of motion', category: 'mobility', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Deep track position',
        tasks: [
          createTemplateTask({ text: 'Dryland Technique', target: 'Deep track holds', category: 'dryland', durationMinutes: 35, intensity: 'medium' }),
          createTemplateTask({ text: 'Video Review', target: 'Body position checkpoints', category: 'video', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Exit power',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Corner exit power', category: 'ice', durationMinutes: 80, intensity: 'medium' }),
        ],
      },
      {
        focus: 'Control and balance',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'One-leg control and glide', category: 'ice', durationMinutes: 70, intensity: 'medium' }),
          createTemplateTask({ text: 'Mobility', target: 'Ankles and hips', category: 'mobility', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Technique strength',
        tasks: [
          createTemplateTask({ text: 'Strength', target: 'Single-leg stability', category: 'strength', durationMinutes: 40, intensity: 'medium' }),
          createTemplateTask({ text: 'Dryland Technique', target: 'Corner imitation', category: 'dryland', durationMinutes: 25, intensity: 'low' }),
        ],
      },
      {
        focus: 'Integrated technique',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Entry, apex, exit connection', category: 'ice', durationMinutes: 85, intensity: 'medium' }),
          createTemplateTask({ text: 'Video Review', target: 'Compare best laps', category: 'video', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Recovery and reset',
        tasks: [
          createTemplateTask({ text: 'Recovery Mobility', target: 'Light stretch and breathing', category: 'recovery', durationMinutes: 25, intensity: 'low' }),
        ],
      },
    ],
  },
  {
    id: 'speed_focus_week',
    title: {
      en: 'Speed Focus Week',
      zh: '速度重点周',
    },
    focus: 'Starts, acceleration, and high-speed laps',
    days: [
      {
        focus: 'Starts',
        tasks: [
          createTemplateTask({ text: 'Starts', target: 'First 10 meters', category: 'ice', durationMinutes: 30, intensity: 'high' }),
          createTemplateTask({ text: 'Dryland Activation', target: 'Explosive prep', category: 'dryland', durationMinutes: 20, intensity: 'medium' }),
        ],
      },
      {
        focus: 'Acceleration',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Acceleration repeats', category: 'ice', durationMinutes: 75, intensity: 'high' }),
          createTemplateTask({ text: 'Mobility', target: 'Hip and ankle reset', category: 'mobility', durationMinutes: 15, intensity: 'low' }),
        ],
      },
      {
        focus: 'Flying laps',
        tasks: [
          createTemplateTask({ text: 'Flying Laps', target: 'High-speed relaxed form', category: 'ice', durationMinutes: 60, intensity: 'high' }),
        ],
      },
      {
        focus: 'Strength and power',
        tasks: [
          createTemplateTask({ text: 'Strength', target: 'Explosive lower body', category: 'strength', durationMinutes: 45, intensity: 'high' }),
          createTemplateTask({ text: 'Recovery Mobility', target: 'Post-power reset', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Race simulation',
        tasks: [
          createTemplateTask({ text: 'Race Simulation', target: 'Start and one fast lap', category: 'competition', durationMinutes: 70, intensity: 'high' }),
          createTemplateTask({ text: 'Video Review', target: 'Speed posture notes', category: 'video', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Speed endurance',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Fast repeat laps', category: 'ice', durationMinutes: 80, intensity: 'high' }),
        ],
      },
      {
        focus: 'Recovery',
        tasks: [
          createTemplateTask({ text: 'Recovery / Rest', target: 'Easy aerobic and stretch', category: 'recovery', durationMinutes: 25, intensity: 'low' }),
        ],
      },
    ],
  },
  {
    id: 'competition_week',
    title: {
      en: 'Competition Week',
      zh: '比赛周',
    },
    focus: 'Taper, race preparation, and confidence',
    days: [
      {
        focus: 'Light technical ice',
        tasks: [
          createTemplateTask({ text: 'Light Ice', target: 'Easy rhythm and confidence', category: 'ice', durationMinutes: 55, intensity: 'low' }),
        ],
      },
      {
        focus: 'Starts and sharpness',
        tasks: [
          createTemplateTask({ text: 'Starts', target: 'Clean first steps', category: 'ice', durationMinutes: 25, intensity: 'medium' }),
          createTemplateTask({ text: 'Mobility', target: 'Relaxed hips and ankles', category: 'mobility', durationMinutes: 15, intensity: 'low' }),
        ],
      },
      {
        focus: 'Race visualization',
        tasks: [
          createTemplateTask({ text: 'Race Visualization', target: 'Start, corners, finish', category: 'mental', durationMinutes: 15, intensity: 'low' }),
          createTemplateTask({ text: 'Light Technical Review', target: 'Two key cues', category: 'video', durationMinutes: 15, intensity: 'low' }),
        ],
      },
      {
        focus: 'Equipment check',
        tasks: [
          createTemplateTask({ text: 'Equipment Check', target: 'Skates, blades, race kit', category: 'competition', durationMinutes: 20, intensity: 'low' }),
          createTemplateTask({ text: 'Recovery Mobility', target: 'Light stretch', category: 'recovery', durationMinutes: 15, intensity: 'low' }),
        ],
      },
      {
        focus: 'Pre-race touch',
        tasks: [
          createTemplateTask({ text: 'Light Ice', target: 'Short relaxed laps', category: 'ice', durationMinutes: 40, intensity: 'low' }),
          createTemplateTask({ text: 'Starts', target: 'Two confident starts', category: 'ice', durationMinutes: 15, intensity: 'medium' }),
        ],
      },
      {
        focus: 'Race day preparation',
        tasks: [
          createTemplateTask({ text: 'Race Preparation', target: 'Warm up and confidence cues', category: 'competition', durationMinutes: 30, intensity: 'medium' }),
        ],
      },
      {
        focus: 'Recovery',
        tasks: [
          createTemplateTask({ text: 'Recovery / Rest', target: 'Post-race reset', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
    ],
  },
  {
    id: 'recovery_week',
    title: {
      en: 'Recovery Week',
      zh: '恢复周',
    },
    focus: 'Recovery, mobility, and low-intensity work',
    days: [
      {
        focus: 'Mobility reset',
        tasks: [
          createTemplateTask({ text: 'Mobility', target: 'Full-body reset', category: 'mobility', durationMinutes: 30, intensity: 'low' }),
        ],
      },
      {
        focus: 'Easy aerobic',
        tasks: [
          createTemplateTask({ text: 'Easy Aerobic', target: 'Comfortable pace', category: 'running', durationMinutes: 30, intensity: 'low' }),
          createTemplateTask({ text: 'Stretching', target: 'Hips and back', category: 'mobility', durationMinutes: 15, intensity: 'low' }),
        ],
      },
      {
        focus: 'Light technical review',
        tasks: [
          createTemplateTask({ text: 'Light Technical Review', target: 'Simple skating cues', category: 'video', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Rest',
        tasks: [
          createTemplateTask({ text: 'Recovery / Rest', target: 'Sleep and hydration', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Mobility and core',
        tasks: [
          createTemplateTask({ text: 'Mobility', target: 'Ankles, hips, shoulders', category: 'mobility', durationMinutes: 25, intensity: 'low' }),
          createTemplateTask({ text: 'Core Stability', target: 'Easy control work', category: 'strength', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Easy movement',
        tasks: [
          createTemplateTask({ text: 'Easy Aerobic', target: 'Low heart rate movement', category: 'running', durationMinutes: 25, intensity: 'low' }),
        ],
      },
      {
        focus: 'Rest and readiness',
        tasks: [
          createTemplateTask({ text: 'Recovery / Rest', target: 'Prepare for next block', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
    ],
  },
  {
    id: 'summer_camp_week',
    title: {
      en: 'Summer Camp Week',
      zh: '夏训周',
    },
    focus: 'High-volume training block',
    days: [
      {
        focus: 'Volume ice and dryland',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'High-volume technique laps', category: 'ice', durationMinutes: 90, intensity: 'medium' }),
          createTemplateTask({ text: 'Dryland', target: 'Skating position circuits', category: 'dryland', durationMinutes: 35, intensity: 'medium' }),
        ],
      },
      {
        focus: 'Strength and mobility',
        tasks: [
          createTemplateTask({ text: 'Strength', target: 'Lower body and core', category: 'strength', durationMinutes: 50, intensity: 'medium' }),
          createTemplateTask({ text: 'Mobility', target: 'Recovery range', category: 'mobility', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Running volume',
        tasks: [
          createTemplateTask({ text: 'Running', target: 'Aerobic base intervals', category: 'running', durationMinutes: 45, intensity: 'medium' }),
          createTemplateTask({ text: 'Recovery Mobility', target: 'Leg reset', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Technique ice',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Corner technique volume', category: 'ice', durationMinutes: 95, intensity: 'medium' }),
          createTemplateTask({ text: 'Video Review', target: 'Camp technique notes', category: 'video', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Strength endurance',
        tasks: [
          createTemplateTask({ text: 'Strength', target: 'Endurance circuits', category: 'strength', durationMinutes: 45, intensity: 'medium' }),
          createTemplateTask({ text: 'Dryland', target: 'Low-position control', category: 'dryland', durationMinutes: 30, intensity: 'medium' }),
        ],
      },
      {
        focus: 'Camp simulation',
        tasks: [
          createTemplateTask({ text: 'Ice Training', target: 'Race rhythm and starts', category: 'ice', durationMinutes: 90, intensity: 'high' }),
          createTemplateTask({ text: 'Recovery Mobility', target: 'Post-session reset', category: 'recovery', durationMinutes: 20, intensity: 'low' }),
        ],
      },
      {
        focus: 'Recovery',
        tasks: [
          createTemplateTask({ text: 'Recovery / Rest', target: 'Full recovery day', category: 'recovery', durationMinutes: 30, intensity: 'low' }),
        ],
      },
    ],
  },
];

const cloneTemplate = (template) => ({
  ...template,
  title: { ...template.title },
  days: template.days.map(day => ({
    ...day,
    tasks: day.tasks.map(task => ({ ...task })),
  })),
});

export const getTrainingPlanTemplates = () => (
  TRAINING_PLAN_TEMPLATES.map(cloneTemplate)
);

export const createTrainingPlanFromTemplate = (templateId, startDateString, options = {}) => {
  const template = TRAINING_PLAN_TEMPLATES.find(item => item.id === templateId);
  if (!template) {
    throw new Error(`Unknown training plan template: ${templateId}`);
  }

  const timestamp = new Date().toISOString();
  const language = options.language === 'zh' ? 'zh' : 'en';
  const title = String(options.titleOverride || '').trim() || template.title[language] || template.title.en;

  return createTrainingPlan({
    title,
    startDate: startDateString,
    endDate: addDays(startDateString, 6),
    focus: options.focus || template.focus,
    goalId: options.goalId || null,
    status: options.status || 'draft',
    days: template.days.map((day, index) => ({
      date: addDays(startDateString, index),
      focus: day.focus,
      tasks: day.tasks.map(task => createPlanTask({
        ...task,
        completed: false,
        completedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })),
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};
