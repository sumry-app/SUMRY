/**
 * Demo Data for Testing AI Insights Engine
 * This file contains sample data that triggers various insight types
 * Use this to demonstrate the insights engine capabilities
 */

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

export const demoStudents = [
  {
    id: 'demo-s1',
    name: 'Emma Rodriguez',
    grade: '3rd',
    disability: 'Learning Disability',
    createdAt: new Date('2024-09-01').toISOString()
  },
  {
    id: 'demo-s2',
    name: 'Liam Chen',
    grade: '5th',
    disability: 'ADHD',
    createdAt: new Date('2024-09-01').toISOString()
  },
  {
    id: 'demo-s3',
    name: 'Sophia Martinez',
    grade: '4th',
    disability: 'Autism Spectrum',
    createdAt: new Date('2024-09-01').toISOString()
  },
  {
    id: 'demo-s4',
    name: 'Noah Johnson',
    grade: '2nd',
    disability: 'Speech/Language',
    createdAt: new Date('2024-09-01').toISOString()
  }
];

export const demoGoals = [
  // Emma - At Risk (Declining Progress)
  {
    id: 'demo-g1',
    studentId: 'demo-s1',
    area: 'Reading',
    description: 'Improve reading comprehension',
    baseline: '55',
    target: '85',
    metric: 'Percentage correct',
    createdAt: new Date('2024-09-05').toISOString()
  },
  {
    id: 'demo-g2',
    studentId: 'demo-s1',
    area: 'Math',
    description: 'Addition facts 0-20',
    baseline: '40',
    target: '90',
    metric: 'Percentage correct',
    createdAt: new Date('2024-09-05').toISOString()
  },

  // Liam - Excellent Progress (Will trigger success prediction)
  {
    id: 'demo-g3',
    studentId: 'demo-s2',
    area: 'Behavior',
    description: 'Stay on task during independent work',
    baseline: '45',
    target: '85',
    metric: 'Percentage of intervals',
    createdAt: new Date('2024-09-05').toISOString()
  },
  {
    id: 'demo-g4',
    studentId: 'demo-s2',
    area: 'Organization',
    description: 'Complete and turn in homework',
    baseline: '30',
    target: '80',
    metric: 'Percentage of assignments',
    createdAt: new Date('2024-09-05').toISOString()
  },

  // Sophia - Goal Already Achieved
  {
    id: 'demo-g5',
    studentId: 'demo-s3',
    area: 'Social Skills',
    description: 'Initiate conversations with peers',
    baseline: '25',
    target: '75',
    metric: 'Percentage of opportunities',
    createdAt: new Date('2024-09-05').toISOString()
  },

  // Noah - Has goals but no recent data (will trigger gap alert)
  {
    id: 'demo-g6',
    studentId: 'demo-s4',
    area: 'Speech',
    description: 'Articulate /r/ sound correctly',
    baseline: '35',
    target: '80',
    metric: 'Percentage correct in conversation',
    createdAt: new Date('2024-09-05').toISOString()
  }
];

export const demoLogs = [
  // Emma - Declining progress (will trigger at-risk alert)
  { id: 'demo-l1', goalId: 'demo-g1', dateISO: daysAgo(35), score: '58', notes: 'Good effort' },
  { id: 'demo-l2', goalId: 'demo-g1', dateISO: daysAgo(30), score: '60', notes: 'Making progress' },
  { id: 'demo-l3', goalId: 'demo-g1', dateISO: daysAgo(25), score: '57', notes: 'Struggled today' },
  { id: 'demo-l4', goalId: 'demo-g1', dateISO: daysAgo(20), score: '54', notes: 'Difficulty with comprehension' },
  { id: 'demo-l5', goalId: 'demo-g1', dateISO: daysAgo(15), score: '52', notes: 'Below baseline' },
  { id: 'demo-l6', goalId: 'demo-g1', dateISO: daysAgo(10), score: '50', notes: 'Continued decline' },

  { id: 'demo-l7', goalId: 'demo-g2', dateISO: daysAgo(35), score: '43', notes: '' },
  { id: 'demo-l8', goalId: 'demo-g2', dateISO: daysAgo(30), score: '45', notes: '' },
  { id: 'demo-l9', goalId: 'demo-g2', dateISO: daysAgo(25), score: '42', notes: '' },
  { id: 'demo-l10', goalId: 'demo-g2', dateISO: daysAgo(20), score: '40', notes: '' },
  { id: 'demo-l11', goalId: 'demo-g2', dateISO: daysAgo(15), score: '38', notes: '' },
  { id: 'demo-l12', goalId: 'demo-g2', dateISO: daysAgo(10), score: '35', notes: '' },

  // Liam - Excellent progress (will trigger success prediction)
  { id: 'demo-l13', goalId: 'demo-g3', dateISO: daysAgo(35), score: '48', notes: '', accommodationsUsed: [] },
  { id: 'demo-l14', goalId: 'demo-g3', dateISO: daysAgo(30), score: '52', notes: '', accommodationsUsed: ['Timer'] },
  { id: 'demo-l15', goalId: 'demo-g3', dateISO: daysAgo(25), score: '58', notes: '', accommodationsUsed: ['Timer'] },
  { id: 'demo-l16', goalId: 'demo-g3', dateISO: daysAgo(20), score: '65', notes: 'Great improvement!', accommodationsUsed: ['Timer', 'Break card'] },
  { id: 'demo-l17', goalId: 'demo-g3', dateISO: daysAgo(15), score: '70', notes: 'Consistent progress', accommodationsUsed: ['Timer', 'Break card'] },
  { id: 'demo-l18', goalId: 'demo-g3', dateISO: daysAgo(10), score: '75', notes: 'Almost at target!', accommodationsUsed: ['Timer', 'Break card'] },
  { id: 'demo-l19', goalId: 'demo-g3', dateISO: daysAgo(5), score: '78', notes: 'Excellent work', accommodationsUsed: ['Timer', 'Break card'] },

  { id: 'demo-l20', goalId: 'demo-g4', dateISO: daysAgo(35), score: '32', notes: '' },
  { id: 'demo-l21', goalId: 'demo-g4', dateISO: daysAgo(30), score: '40', notes: '' },
  { id: 'demo-l22', goalId: 'demo-g4', dateISO: daysAgo(25), score: '48', notes: '' },
  { id: 'demo-l23', goalId: 'demo-g4', dateISO: daysAgo(20), score: '55', notes: '' },
  { id: 'demo-l24', goalId: 'demo-g4', dateISO: daysAgo(15), score: '63', notes: '' },
  { id: 'demo-l25', goalId: 'demo-g4', dateISO: daysAgo(10), score: '70', notes: '' },

  // Sophia - Already exceeded target (will trigger baseline recommendation)
  { id: 'demo-l26', goalId: 'demo-g5', dateISO: daysAgo(35), score: '78', notes: '', accommodationsUsed: ['Visual schedule'] },
  { id: 'demo-l27', goalId: 'demo-g5', dateISO: daysAgo(30), score: '82', notes: '', accommodationsUsed: ['Visual schedule'] },
  { id: 'demo-l28', goalId: 'demo-g5', dateISO: daysAgo(25), score: '85', notes: 'Great social interaction', accommodationsUsed: ['Visual schedule', 'Social story'] },
  { id: 'demo-l29', goalId: 'demo-g5', dateISO: daysAgo(20), score: '88', notes: 'Exceeded target', accommodationsUsed: ['Visual schedule', 'Social story'] },
  { id: 'demo-l30', goalId: 'demo-g5', dateISO: daysAgo(15), score: '90', notes: 'Consistently high', accommodationsUsed: ['Visual schedule', 'Social story'] },
  { id: 'demo-l31', goalId: 'demo-g5', dateISO: daysAgo(10), score: '92', notes: 'Outstanding!', accommodationsUsed: ['Visual schedule', 'Social story'] },

  // Add anomaly for Sophia - one unusual drop
  { id: 'demo-l32', goalId: 'demo-g5', dateISO: daysAgo(5), score: '35', notes: 'Was absent most of the week', accommodationsUsed: [] },

  // Noah - Old data only (will trigger data gap alert)
  { id: 'demo-l33', goalId: 'demo-g6', dateISO: daysAgo(45), score: '38', notes: '' },
  { id: 'demo-l34', goalId: 'demo-g6', dateISO: daysAgo(40), score: '40', notes: '' },
  { id: 'demo-l35', goalId: 'demo-g6', dateISO: daysAgo(35), score: '42', notes: '' }
];

export const demoAccommodations = [
  { id: 'acc-1', name: 'Timer', type: 'Organizational' },
  { id: 'acc-2', name: 'Break card', type: 'Behavioral' },
  { id: 'acc-3', name: 'Visual schedule', type: 'Organizational' },
  { id: 'acc-4', name: 'Social story', type: 'Social' }
];

/**
 * Expected Insights from this demo data:
 *
 * 1. AT RISK - Emma Rodriguez
 *    - Multiple declining goals
 *    - Performance below baseline
 *    - Should trigger IEP review recommendation
 *
 * 2. SUCCESS PREDICTION - Liam Chen (Behavior goal)
 *    - On track to complete in ~15-20 days
 *    - Consistent improvement
 *    - High confidence
 *
 * 3. GOAL ACHIEVED - Sophia Martinez
 *    - Exceeded target significantly
 *    - Recommend new, higher goal
 *
 * 4. ANOMALY - Sophia Martinez
 *    - Unusual drop on recent date
 *    - Should investigate circumstances
 *
 * 5. ACCOMMODATION SUCCESS - Liam Chen
 *    - "Timer" and "Break card" showing high effectiveness
 *    - Should document and replicate
 *
 * 6. ACCOMMODATION SUCCESS - Sophia Martinez
 *    - "Visual schedule" and "Social story" highly effective
 *
 * 7. DATA GAP - Noah Johnson
 *    - No data in 35+ days
 *    - High priority alert
 *
 * 8. SUCCESS PATTERN - Liam Chen
 *    - Consistent improvement pattern
 *    - Possibly rapid acceleration
 *
 * 9. IEP REVIEW - Emma Rodriguez
 *    - Multiple concerning factors
 *    - Both goals declining
 *    - Recent performance below average
 */

export function loadDemoData() {
  return {
    students: demoStudents,
    goals: demoGoals,
    logs: demoLogs,
    accommodations: demoAccommodations
  };
}

export default {
  students: demoStudents,
  goals: demoGoals,
  logs: demoLogs,
  accommodations: demoAccommodations
};
