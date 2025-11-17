import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector
} from 'recharts';
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  calculateGoalAreaDistribution,
  calculateGoalStatusDistribution,
  parseScore,
  calculatePerformanceScore
} from '@/lib/analytics';

const AREA_COLORS = [
  '#65A39B',
  '#E3866B',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#3B82F6',
  '#10B981',
  '#6366F1'
];

/**
 * Goal Distribution Component
 * Visualizes goal areas and status with interactive pie and bar charts
 */
export default function GoalDistribution({ goals = [], logs = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [chartType, setChartType] = useState('pie');
  const [expandedStatus, setExpandedStatus] = useState(null);

  // Calculate distributions
  const areaDistribution = useMemo(() => {
    return calculateGoalAreaDistribution(goals);
  }, [goals]);

  const statusDistribution = useMemo(() => {
    return calculateGoalStatusDistribution(goals, logs);
  }, [goals, logs]);

  // Get detailed goals for selected area
  const selectedAreaGoals = useMemo(() => {
    if (!selectedArea) return [];
    return goals
      .filter(g => (g.area || 'General') === selectedArea)
      .map(goal => {
        const goalLogs = logs.filter(l => l.goalId === goal.id);
        const performance = calculatePerformanceScore(goalLogs, goal.baseline, goal.target);
        return { ...goal, performance, logsCount: goalLogs.length };
      });
  }, [goals, logs, selectedArea]);

  // Drill down into area
  const handleAreaClick = (data) => {
    setSelectedArea(data.area === selectedArea ? null : data.area);
  };

  // Toggle status details
  const toggleStatusDetails = (status) => {
    setExpandedStatus(expandedStatus === status ? null : status);
  };

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No goals available to analyze</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Goal Area Distribution */}
      <Card className="border-2 border-gray-100 hover:border-gray-200 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Goal Areas</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                Pie
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={chartType}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {chartType === 'pie' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={areaDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onClick={(data) => handleAreaClick(data)}
                      style={{ cursor: 'pointer' }}
                      animationDuration={800}
                    >
                      {areaDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={AREA_COLORS[index % AREA_COLORS.length]}
                          opacity={selectedArea === null || selectedArea === entry.area ? 1 : 0.3}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={areaDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" stroke="#6B7280" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="area"
                      stroke="#6B7280"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#65A39B"
                      radius={[0, 4, 4, 0]}
                      animationDuration={800}
                      onClick={(data) => handleAreaClick(data)}
                      style={{ cursor: 'pointer' }}
                    >
                      {areaDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={AREA_COLORS[index % AREA_COLORS.length]}
                          opacity={selectedArea === null || selectedArea === entry.area ? 1 : 0.3}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            {areaDistribution.map((area, index) => (
              <motion.button
                key={area.area}
                onClick={() => handleAreaClick(area)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  selectedArea === area.area
                    ? 'border-[#65A39B] bg-[#65A39B]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: AREA_COLORS[index % AREA_COLORS.length] }}
                  />
                  <span className="font-medium text-sm">{area.area}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{area.count} goals</Badge>
                  <span className="text-sm font-semibold text-gray-600">
                    {area.percentage}%
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Drill-down view */}
          <AnimatePresence>
            {selectedArea && selectedAreaGoals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-700">
                    {selectedArea} Goals
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedArea(null)}
                  >
                    Close
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedAreaGoals.map((goal) => (
                    <DrillDownGoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Goal Status Distribution */}
      <Card className="border-2 border-gray-100 hover:border-gray-200 transition-all">
        <CardHeader>
          <CardTitle>Goal Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="status"
                stroke="#6B7280"
                fontSize={12}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<StatusTooltip />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Status Cards */}
          <div className="mt-6 space-y-3">
            {statusDistribution.map((status) => {
              const statusGoals = goals.filter(goal => {
                const goalLogs = logs.filter(l => l.goalId === goal.id);
                const scores = goalLogs.map(log => parseScore(log.score)).filter(s => s !== null);

                if (scores.length < 3) return status.status === 'Needs Data';

                const performance = calculatePerformanceScore(goalLogs, goal.baseline, goal.target);
                if (!performance) return status.status === 'Needs Data';

                if (performance.progress >= 100) return status.status === 'Completed';
                if (performance.progress >= 80) return status.status === 'On Track';
                return status.status === 'Off Track';
              });

              return (
                <StatusCard
                  key={status.status}
                  status={status}
                  goals={statusGoals}
                  isExpanded={expandedStatus === status.status}
                  onToggle={() => toggleStatusDetails(status.status)}
                />
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Success Rate</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {goals.length > 0
                    ? Math.round(
                        ((statusDistribution.find(s => s.status === 'On Track')?.count || 0) +
                          (statusDistribution.find(s => s.status === 'Completed')?.count || 0)) /
                          goals.length *
                          100
                      )
                    : 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Need Attention</span>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {statusDistribution.find(s => s.status === 'Off Track')?.count || 0}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function renderActiveShape(props) {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        className="text-sm font-semibold"
      >
        {payload.area}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        className="text-xs"
      >
        {`${payload.count} goals (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">{data.area}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Goals:</span>
          <span className="font-semibold">{data.count}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Percentage:</span>
          <span className="font-semibold">{data.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

function StatusTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">{data.status}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Count:</span>
          <span className="font-semibold">{data.count}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Percentage:</span>
          <span className="font-semibold">{data.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

function DrillDownGoalCard({ goal }) {
  const getPerformanceColor = (performance) => {
    if (!performance) return 'text-gray-600';
    if (performance.progress >= 100) return 'text-green-600';
    if (performance.progress >= 80) return 'text-green-600';
    if (performance.progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {goal.description || 'No description'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {goal.logsCount} logs
            </Badge>
            {goal.performance && (
              <span className={`text-xs font-semibold ${getPerformanceColor(goal.performance)}`}>
                {goal.performance.progress.toFixed(0)}% progress
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ status, goals, isExpanded, onToggle }) {
  const getStatusIcon = (statusName) => {
    if (statusName === 'Completed') return CheckCircle;
    if (statusName === 'On Track') return TrendingUp;
    if (statusName === 'Off Track') return AlertCircle;
    return Clock;
  };

  const Icon = getStatusIcon(status.status);

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${status.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: status.color }} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">{status.status}</div>
            <div className="text-xs text-gray-500">{status.count} goals</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: status.color }}>
              {status.percentage}%
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && goals.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto bg-gray-50">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 bg-white rounded border border-gray-200 text-sm"
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {goal.description || 'No description'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Area: {goal.area || 'General'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
