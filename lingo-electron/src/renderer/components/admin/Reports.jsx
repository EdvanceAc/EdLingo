import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  Award,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

const Reports = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [reportType, setReportType] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState({
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalCourses: 45,
      completionRate: 73.5,
      avgSessionTime: 28.5,
      totalLessons: 1250
    },
    userStats: {
      newUsers: 156,
      returningUsers: 736,
      churnRate: 12.3,
      engagementRate: 68.7
    },
    courseStats: {
      mostPopular: 'Spanish Basics',
      leastPopular: 'Advanced German',
      avgProgress: 45.2,
      completedCourses: 234
    },
    performance: {
      avgLoadTime: 2.3,
      errorRate: 0.8,
      uptime: 99.7,
      apiResponseTime: 145
    }
  });

  const [chartData, setChartData] = useState({
    userGrowth: [
      { date: '2024-01-01', users: 1000 },
      { date: '2024-01-02', users: 1025 },
      { date: '2024-01-03', users: 1050 },
      { date: '2024-01-04', users: 1080 },
      { date: '2024-01-05', users: 1120 },
      { date: '2024-01-06', users: 1180 },
      { date: '2024-01-07', users: 1247 }
    ],
    courseCompletion: [
      { course: 'Spanish Basics', completion: 85 },
      { course: 'French Intro', completion: 72 },
      { course: 'German A1', completion: 68 },
      { course: 'Italian Basics', completion: 79 },
      { course: 'Portuguese 101', completion: 63 }
    ],
    dailyActivity: [
      { day: 'Mon', sessions: 245 },
      { day: 'Tue', sessions: 289 },
      { day: 'Wed', sessions: 312 },
      { day: 'Thu', sessions: 298 },
      { day: 'Fri', sessions: 267 },
      { day: 'Sat', sessions: 189 },
      { day: 'Sun', sessions: 156 }
    ]
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange, reportType]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Loading ${reportType} data for ${dateRange}`);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = (format) => {
    console.log(`Exporting report as ${format}`);
    // Simulate export functionality
    const data = JSON.stringify(reportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${dateRange}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <div className={`flex items-center mt-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  trend === 'down' ? 'rotate-180' : ''
                }`} />
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SimpleChart = ({ data, type, title }) => {
    const maxValue = Math.max(...data.map(item => 
      type === 'userGrowth' ? item.users : 
      type === 'courseCompletion' ? item.completion :
      item.sessions
    ));

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.map((item, index) => {
              const value = type === 'userGrowth' ? item.users : 
                           type === 'courseCompletion' ? item.completion :
                           item.sessions;
              const percentage = (value / maxValue) * 100;
              const label = type === 'userGrowth' ? item.date : 
                           type === 'courseCompletion' ? item.course :
                           item.day;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600 truncate">{label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-900 text-right">{value}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadReportData()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last Day</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="users">User Analytics</SelectItem>
              <SelectItem value="courses">Course Analytics</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => exportReport('json')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={reportData.overview.totalUsers.toLocaleString()}
              icon={Users}
              trend="up"
              trendValue="+12.5%"
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={reportData.overview.activeUsers.toLocaleString()}
              icon={Users}
              trend="up"
              trendValue="+8.3%"
              color="green"
            />
            <StatCard
              title="Total Courses"
              value={reportData.overview.totalCourses}
              icon={BookOpen}
              trend="up"
              trendValue="+3"
              color="purple"
            />
            <StatCard
              title="Completion Rate"
              value={`${reportData.overview.completionRate}%`}
              icon={Award}
              trend="up"
              trendValue="+2.1%"
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SimpleChart
              data={chartData.userGrowth}
              type="userGrowth"
              title="User Growth"
            />
            <SimpleChart
              data={chartData.courseCompletion}
              type="courseCompletion"
              title="Course Completion Rates"
            />
            <SimpleChart
              data={chartData.dailyActivity}
              type="dailyActivity"
              title="Daily Activity"
            />
          </div>
        </>
      )}

      {/* User Analytics */}
      {reportType === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="New Users"
            value={reportData.userStats.newUsers}
            icon={Users}
            trend="up"
            trendValue="+15.2%"
            color="blue"
          />
          <StatCard
            title="Returning Users"
            value={reportData.userStats.returningUsers}
            icon={Users}
            trend="up"
            trendValue="+7.8%"
            color="green"
          />
          <StatCard
            title="Churn Rate"
            value={`${reportData.userStats.churnRate}%`}
            icon={TrendingUp}
            trend="down"
            trendValue="-2.1%"
            color="red"
          />
          <StatCard
            title="Engagement Rate"
            value={`${reportData.userStats.engagementRate}%`}
            icon={Award}
            trend="up"
            trendValue="+4.5%"
            color="purple"
          />
        </div>
      )}

      {/* Course Analytics */}
      {reportType === 'courses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Most Popular"
              value={reportData.courseStats.mostPopular}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              title="Avg Progress"
              value={`${reportData.courseStats.avgProgress}%`}
              icon={TrendingUp}
              trend="up"
              trendValue="+3.2%"
              color="green"
            />
            <StatCard
              title="Completed Courses"
              value={reportData.courseStats.completedCourses}
              icon={Award}
              trend="up"
              trendValue="+18"
              color="purple"
            />
            <StatCard
              title="Total Lessons"
              value={reportData.overview.totalLessons.toLocaleString()}
              icon={BookOpen}
              color="orange"
            />
          </div>
          <SimpleChart
            data={chartData.courseCompletion}
            type="courseCompletion"
            title="Course Completion Rates"
          />
        </div>
      )}

      {/* Performance Analytics */}
      {reportType === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Avg Load Time"
            value={`${reportData.performance.avgLoadTime}s`}
            icon={Clock}
            trend="down"
            trendValue="-0.2s"
            color="blue"
          />
          <StatCard
            title="Error Rate"
            value={`${reportData.performance.errorRate}%`}
            icon={TrendingUp}
            trend="down"
            trendValue="-0.3%"
            color="green"
          />
          <StatCard
            title="Uptime"
            value={`${reportData.performance.uptime}%`}
            icon={Award}
            color="purple"
          />
          <StatCard
            title="API Response"
            value={`${reportData.performance.apiResponseTime}ms`}
            icon={Clock}
            trend="down"
            trendValue="-15ms"
            color="orange"
          />
        </div>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => exportReport('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportReport('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;