import { createCompetitionGoal } from './goals.js';
import { createPlanTask, createTrainingPlan } from './plans.js';

const toDateString = (date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const addDays = (dateString, daysToAdd) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day + daysToAdd);
  return toDateString(date);
};

export const TRAINING_V1_DEFAULT_FIELDS = {
  competitionGoalsV1: [],
  trainingPlansV1: [],
  activeTrainingPlanId: null,
};

export const createDefaultLindsayGoals = () => [
  createCompetitionGoal({
    title: 'AGN 2027 500m',
    competitionName: 'Age Group Nationals 2027',
    competitionDate: '2027-03-20',
    eventName: '500m',
    targetDistance: '500m',
    currentTimeSeconds: 49.8,
    targetTimeSeconds: 48.0,
    priority: 'A',
    status: 'active',
  }),
  createCompetitionGoal({
    title: 'AGN 2027 777m',
    competitionName: 'Age Group Nationals 2027',
    competitionDate: '2027-03-20',
    eventName: '777m',
    targetDistance: '777m',
    currentTimeSeconds: 82.0,
    targetTimeSeconds: 77.0,
    priority: 'A',
    status: 'active',
  }),
  createCompetitionGoal({
    title: 'AGN 2027 1000m',
    competitionName: 'Age Group Nationals 2027',
    competitionDate: '2027-03-20',
    eventName: '1000m',
    targetDistance: '1000m',
    currentTimeSeconds: 104.0,
    targetTimeSeconds: 103.0,
    priority: 'A',
    status: 'active',
  }),
];

export const createDefaultLindsayWeeklyPlan = (startDateString) => {
  const dayTemplates = [
    {
      focus: 'Ice Training',
      tasks: [
        { text: 'Ice Training', category: 'ice', intensity: 'medium' },
        { text: 'Dryland Activation', category: 'dryland', intensity: 'low' },
      ],
    },
    {
      focus: 'Corner Technique Focus',
      tasks: [
        { text: 'Ice Training', category: 'ice', intensity: 'medium' },
        { text: 'Corner Technique Focus', category: 'ice', intensity: 'medium' },
      ],
    },
    {
      focus: 'Running Intervals',
      tasks: [
        { text: 'Running Intervals', category: 'running', intensity: 'high' },
        { text: 'Mobility', category: 'mobility', intensity: 'low' },
      ],
    },
    {
      focus: 'Video Review',
      tasks: [
        { text: 'Ice Training', category: 'ice', intensity: 'medium' },
        { text: 'Video Review', category: 'video', intensity: 'low' },
      ],
    },
    {
      focus: 'Strength',
      tasks: [
        { text: 'Strength', category: 'strength', intensity: 'high' },
        { text: 'Recovery Mobility', category: 'recovery', intensity: 'low' },
      ],
    },
    {
      focus: 'Starts and Race Simulation',
      tasks: [
        { text: 'Ice Training', category: 'ice', intensity: 'medium' },
        { text: 'Starts and Race Simulation', category: 'competition', intensity: 'high' },
      ],
    },
    {
      focus: 'Recovery / Rest',
      tasks: [
        { text: 'Recovery / Rest', category: 'recovery', intensity: 'low' },
      ],
    },
  ];

  return createTrainingPlan({
    title: 'Lindsay Weekly Training Plan',
    startDate: startDateString,
    endDate: addDays(startDateString, 6),
    focus: 'AGN 2027 preparation',
    goalId: null,
    status: 'draft',
    days: dayTemplates.map((dayTemplate, index) => ({
      date: addDays(startDateString, index),
      focus: dayTemplate.focus,
      tasks: dayTemplate.tasks.map((task) => createPlanTask({
        text: task.text,
        target: null,
        desc: null,
        category: task.category,
        durationMinutes: null,
        intensity: task.intensity,
      })),
    })),
  });
};

export const shouldSeedTrainingV1Goals = (data = {}) => (
  !Array.isArray(data.competitionGoalsV1) || data.competitionGoalsV1.length === 0
);

export const shouldSeedTrainingV1Plan = (data = {}, weekStartDateString) => {
  const plans = data.trainingPlansV1 || [];

  return !plans.some((plan) => (
    plan?.startDate === weekStartDateString && plan?.status !== 'archived'
  ));
};
