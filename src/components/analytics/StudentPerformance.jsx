import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  ArrowUpDown,
  Filter,
  Minus
} from 'lucide-react';
import {
  calculateStudentComparisons,
  calculateMean,
  parseScore
} from '@/lib/analytics';

const STUDENT_COLORS = [
  '#65A39B',
  '#E3866B',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#3B82F6',
  '#10B981',
  '#F97316'
];

/**
 * Student Performance Component
 * Multi-student comparison with radar charts, heatmaps, and sortable tables
 */
export default function StudentPerformance({ students = [], goals = [], logs = [] }) {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sortBy, setSortBy] = useState('avgScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [gradeFilter, setGradeFilter] = useState(null);
  const [disabilityFilter, setDisabilityFilter] = useState(null);
  const [viewMode, setViewMode] = useState('radar');

  // Calculate student comparisons
  const studentComparisons = useMemo(() => {
    let comparisons = calculateStudentComparisons(students, goals, logs);

    // Apply filters
    if (gradeFilter) {
      comparisons = comparisons.filter(s => s.grade === gradeFilter);
    }
    if (disabilityFilter) {
      comparisons = comparisons.filter(s => s.disability === disabilityFilter);
    }

    // Apply sorting
    comparisons.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'trend') {
        const trendOrder = { improving: 3, stable: 2, declining: 1 };
        aVal = trendOrder[a.trend.direction] || 0;
        bVal = trendOrder[b.trend.direction] || 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return comparisons;
  }, [students, goals, logs, sortBy, sortOrder, gradeFilter, disabilityFilter]);

  // Get unique grades and disabilities for filters
  const uniqueGrades = useMemo(() => {
    return [...new Set(students.map(s => s.grade).filter(Boolean))];
  }, [students]);

  const uniqueDisabilities = useMemo(() => {
    return [...new Set(students.map(s => s.disability).filter(Boolean))];
  }, [students]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (selectedStudents.length === 0) return [];

    const studentsToCompare = studentComparisons.filter(s =>
      selectedStudents.includes(s.id)
    );

    if (studentsToCompare.length === 0) return [];

    // Get all skill areas
    const allSkills = new Set();
    studentsToCompare.forEach(student => {
      Object.keys(student.skillAverages).forEach(skill => allSkills.add(skill));
    });

    // Create radar data
    return Array.from(allSkills).map(skill => {
      const dataPoint = { skill };
      studentsToCompare.forEach(student => {
        dataPoint[student.name] = student.skillAverages[skill] || 0;
      });
      return dataPoint;
    });
  }, [studentComparisons, selectedStudents]);

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    return studentComparisons.map(student => {
      const skills = Object.keys(student.skillAverages);
      return {
        name: student.name,
        id: student.id,
        skills: skills.map(skill => ({
          skill,
          value: student.skillAverages[skill]
        }))
      };
    });
  }, [studentComparisons]);

  // Toggle student selection
  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId].slice(-5)
    );
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No students available to compare</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* View Mode */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <Button
                variant={viewMode === 'radar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('radar')}
              >
                Radar Chart
              </Button>
              <Button
                variant={viewMode === 'heatmap' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('heatmap')}
              >
                Heat Map
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>

              {/* Grade Filter */}
              {uniqueGrades.length > 0 && (
                <div className="flex gap-1">
                  <Button
                    variant={gradeFilter === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGradeFilter(null)}
                  >
                    All Grades
                  </Button>
                  {uniqueGrades.map(grade => (
                    <Button
                      key={grade}
                      variant={gradeFilter === grade ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGradeFilter(grade)}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              )}

              {/* Disability Filter */}
              {uniqueDisabilities.length > 0 && (
                <div className="flex gap-1">
                  <Button
                    variant={disabilityFilter === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDisabilityFilter(null)}
                  >
                    All Categories
                  </Button>
                  {uniqueDisabilities.slice(0, 3).map(disability => (
                    <Button
                      key={disability}
                      variant={disabilityFilter === disability ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDisabilityFilter(disability)}
                    >
                      {disability}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'radar' && (
            <RadarView
              radarData={radarData}
              selectedStudents={selectedStudents}
              studentComparisons={studentComparisons}
            />
          )}

          {viewMode === 'heatmap' && (
            <HeatmapView heatmapData={heatmapData} />
          )}

          {viewMode === 'table' && (
            <TableView
              studentComparisons={studentComparisons}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Student Selection Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Students to Compare</CardTitle>
            <Badge variant="outline">
              {selectedStudents.length}/5 selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentComparisons.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                color={STUDENT_COLORS[index % STUDENT_COLORS.length]}
                isSelected={selectedStudents.includes(student.id)}
                onToggle={() => toggleStudent(student.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <PerformanceSummary studentComparisons={studentComparisons} />
    </div>
  );
}

function RadarView({ radarData, selectedStudents, studentComparisons }) {
  if (radarData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Select students to compare their skills</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const studentsToShow = studentComparisons.filter(s =>
    selectedStudents.includes(s.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 10 }}
            />
            <Tooltip content={<RadarTooltip />} />
            <Legend />
            {studentsToShow.map((student, index) => (
              <Radar
                key={student.id}
                name={student.name}
                dataKey={student.name}
                stroke={STUDENT_COLORS[index % STUDENT_COLORS.length]}
                fill={STUDENT_COLORS[index % STUDENT_COLORS.length]}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={800}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HeatmapView({ heatmapData }) {
  const getHeatmapColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHeatmapOpacity = (value) => {
    return Math.max(0.2, value / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {heatmapData.map((student) => (
              <div key={student.id} className="mb-4">
                <div className="font-semibold text-sm mb-2">{student.name}</div>
                <div className="flex gap-2 flex-wrap">
                  {student.skills.map((skill) => (
                    <motion.div
                      key={skill.skill}
                      className="relative group"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center ${getHeatmapColor(
                          skill.value
                        )} transition-all`}
                        style={{ opacity: getHeatmapOpacity(skill.value) }}
                      >
                        <span className="text-white font-bold text-sm">
                          {skill.value.toFixed(0)}
                        </span>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {skill.skill}
                        </div>
                      </div>
                      <div className="text-xs text-center mt-1 text-gray-600 truncate w-16">
                        {skill.skill}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700">Legend:</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-xs text-gray-600">80-100</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-xs text-gray-600">60-79</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500" />
                  <span className="text-xs text-gray-600">40-59</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-xs text-gray-600">0-39</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TableView({ studentComparisons, sortBy, sortOrder, onSort }) {
  const SortButton = ({ field, label }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-[#65A39B] transition-colors"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
      {sortBy === field && (
        <span className="text-[#65A39B] font-bold">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="name" label="Student" />
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="grade" label="Grade" />
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="totalGoals" label="Goals" />
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="avgScore" label="Avg Score" />
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="medianScore" label="Median" />
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="trend" label="Trend" />
                </th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">
                  <SortButton field="dataPoints" label="Data Points" />
                </th>
              </tr>
            </thead>
            <tbody>
              {studentComparisons.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">
                    <div className="font-medium text-sm">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.disability}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {student.grade || 'N/A'}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">{student.totalGoals}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {student.avgScore.toFixed(1)}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#65A39B] h-2 rounded-full transition-all"
                          style={{ width: `${student.avgScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{student.medianScore.toFixed(1)}</td>
                  <td className="p-3">
                    <TrendBadge trend={student.trend} />
                  </td>
                  <td className="p-3 text-sm">{student.dataPoints}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentCard({ student, color, isSelected, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-[#65A39B] bg-[#65A39B]/5 shadow-md'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 mb-1 truncate">
            {student.name}
          </div>
          <div className="text-xs text-gray-600 mb-2">
            {student.grade} • {student.disability}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {student.totalGoals} goals
            </Badge>
            <Badge variant="outline" className="text-xs">
              {student.avgScore.toFixed(1)} avg
            </Badge>
            <TrendBadge trend={student.trend} small />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function TrendBadge({ trend, small = false }) {
  const getTrendIcon = (direction) => {
    if (direction === 'improving') return TrendingUp;
    if (direction === 'declining') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (direction) => {
    if (direction === 'improving') return 'bg-green-100 text-green-800 border-green-200';
    if (direction === 'declining') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const Icon = getTrendIcon(trend.direction);

  return (
    <Badge
      variant="outline"
      className={`capitalize ${getTrendColor(trend.direction)} ${
        small ? 'text-xs' : ''
      }`}
    >
      <Icon className={`${small ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
      {trend.direction}
    </Badge>
  );
}

function PerformanceSummary({ studentComparisons }) {
  const topPerformers = studentComparisons.slice(0, 3);
  const needsAttention = studentComparisons
    .filter(s => s.avgScore < 60 || s.trend.direction === 'declining')
    .slice(0, 3);

  const avgClassScore = calculateMean(studentComparisons.map(s => s.avgScore));
  const improvingCount = studentComparisons.filter(
    s => s.trend.direction === 'improving'
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <Card className="border-2 border-green-100 bg-green-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            <CardTitle className="text-base">Top Performers</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-green-600">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{student.name}</div>
                    <div className="text-xs text-gray-600">
                      {student.totalGoals} goals • {student.dataPoints} data points
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {student.avgScore.toFixed(1)}
                  </div>
                  <TrendBadge trend={student.trend} small />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Needs Attention */}
      <Card className="border-2 border-orange-100 bg-orange-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-base">Needs Attention</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {needsAttention.length > 0 ? (
            <div className="space-y-3">
              {needsAttention.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                >
                  <div>
                    <div className="font-semibold text-sm">{student.name}</div>
                    <div className="text-xs text-gray-600">
                      {student.totalGoals} goals • {student.dataPoints} data points
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">
                      {student.avgScore.toFixed(1)}
                    </div>
                    <TrendBadge trend={student.trend} small />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">All students are performing well</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Class Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {studentComparisons.length}
              </div>
              <div className="text-sm text-blue-900 mt-1">Total Students</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {avgClassScore.toFixed(1)}
              </div>
              <div className="text-sm text-green-900 mt-1">Class Average</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {improvingCount}
              </div>
              <div className="text-sm text-purple-900 mt-1">Improving</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {needsAttention.length}
              </div>
              <div className="text-sm text-orange-900 mt-1">Need Support</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RadarTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">{payload[0].payload.skill}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.name}:</span>
            </div>
            <span className="text-sm font-bold">{entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCircle({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
