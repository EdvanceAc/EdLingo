import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, BookOpen, Clock, Award, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);

  // Sample analytics data
  const sampleAnalytics = {
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalCourses: 24,
      completedLessons: 15678,
      averageSessionTime: '24m 32s',
      retentionRate: 78.5
    },
    userGrowth: [
      { date: '2024-01-14', users: 1180 },
      { date: '2024-01-15', users: 1195 },
      { date: '2024-01-16', users: 1210 },
      { date: '2024-01-17', users: 1225 },
      { date: '2024-01-18', users: 1235 },
      { date: '2024-01-19', users: 1242 },
      { date: '2024-01-20', users: 1247 }
    ],
    coursePopularity: [
      { course: 'Spanish for Beginners', enrollments: 156, completion: 89 },
      { course: 'Advanced French Grammar', enrollments: 89, completion: 76 },
      { course: 'German Pronunciation', enrollments: 67, completion: 82 },
      { course: 'Italian Basics', enrollments: 45, completion: 91 },
      { course: 'Portuguese Conversation', enrollments: 38, completion: 74 }
    ],
    learningProgress: {
      totalXP: 245680,
      averageLevel: 4.2,
      streakData: {
        average: 12,
        longest: 45,
        active: 234
      }
    },
    engagement: {
      dailyActiveUsers: 456,
      weeklyActiveUsers: 892,
      monthlyActiveUsers: 1247,
      averageSessionsPerUser: 3.4,
      bounceRate: 12.3
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalytics(sampleAnalytics);
    }, 1000);
  }, [timeRange]);

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <p className={`text-sm flex items-center gap-1 ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-3 w-3" />
                {change > 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressBar = ({ label, value, max, color = 'blue' }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers.toLocaleString()}
          change={8.2}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={analytics.overview.activeUsers.toLocaleString()}
          change={12.5}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Courses"
          value={analytics.overview.totalCourses}
          change={4.1}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Completed Lessons"
          value={analytics.overview.completedLessons.toLocaleString()}
          change={15.3}
          icon={Award}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.userGrowth.map((data, index) => {
                const prevValue = index > 0 ? analytics.userGrowth[index - 1].users : data.users;
                const growth = ((data.users - prevValue) / prevValue * 100).toFixed(1);
                return (
                  <div key={data.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(data.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{data.users}</span>
                      {index > 0 && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          growth > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {growth > 0 ? '+' : ''}{growth}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Course Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Course Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.coursePopularity.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{course.course}</span>
                    <span className="text-sm text-gray-600">{course.enrollments} enrolled</span>
                  </div>
                  <ProgressBar
                    label="Completion Rate"
                    value={course.completion}
                    max={100}
                    color="green"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total XP Earned</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.learningProgress.totalXP.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Level</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.learningProgress.averageLevel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Streaks</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.learningProgress.streakData.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Active</span>
                <span className="font-medium">{analytics.engagement.dailyActiveUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Weekly Active</span>
                <span className="font-medium">{analytics.engagement.weeklyActiveUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Active</span>
                <span className="font-medium">{analytics.engagement.monthlyActiveUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Sessions/User</span>
                <span className="font-medium">{analytics.engagement.averageSessionsPerUser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="font-medium">{analytics.engagement.bounceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProgressBar
                label="Server Uptime"
                value={99.8}
                max={100}
                color="green"
              />
              <ProgressBar
                label="Database Performance"
                value={94.2}
                max={100}
                color="blue"
              />
              <ProgressBar
                label="User Satisfaction"
                value={analytics.overview.retentionRate}
                max={100}
                color="purple"
              />
              <div className="pt-2">
                <p className="text-sm text-gray-600">Avg Session Time</p>
                <p className="text-lg font-bold text-green-600">
                  {analytics.overview.averageSessionTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;