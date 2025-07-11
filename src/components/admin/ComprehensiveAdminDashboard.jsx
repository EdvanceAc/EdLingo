import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  BarChart3,
  Trophy,
  Settings,
  Brain,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Award,
  MessageSquare,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Calendar,
  Globe,
  Lightbulb,
  Shield,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../renderer/components/ui/Card';
import { Progress } from '../../renderer/components/ui/Progress';
import { Badge } from '../../renderer/components/ui/Badge';
import Button from '../../renderer/components/ui/Button';

const ComprehensiveAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real implementation, this would come from API calls
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalCourses: 24,
      totalStudents: 1247,
      activeInstructors: 8,
      completionRate: 78.5,
      avgEngagement: 85.2,
      monthlyRevenue: 15420
    },
    courses: [],
    students: [],
    analytics: {},
    gamification: {},
    content: {},
    ai: {}
  });

  // Navigation sections for the comprehensive admin dashboard
  const navigationSections = [
    {
      id: 'overview',
      name: 'Dashboard Overview',
      icon: BarChart3,
      description: 'Key metrics and insights'
    },
    {
      id: 'course-management',
      name: 'Course Management',
      icon: BookOpen,
      description: 'Create, edit, and manage courses'
    },
    {
      id: 'student-analytics',
      name: 'Student Analytics',
      icon: Users,
      description: 'Track student progress and performance'
    },
    {
      id: 'content-management',
      name: 'Content Management',
      icon: FileText,
      description: 'Manage lessons, media, and assessments'
    },
    {
      id: 'gamification',
      name: 'Gamification',
      icon: Trophy,
      description: 'Badges, leaderboards, and rewards'
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: Shield,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      icon: TrendingUp,
      description: 'Deep insights and reporting'
    },
    {
      id: 'ai-integration',
      name: 'AI Integration',
      icon: Brain,
      description: 'AI-powered content and automation'
    }
  ];

  // Overview Dashboard Component
  const OverviewDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Courses</p>
                <p className="text-2xl font-bold">{dashboardData.overview.totalCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Students</p>
                <p className="text-2xl font-bold">{dashboardData.overview.totalStudents.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Instructors</p>
                <p className="text-2xl font-bold">{dashboardData.overview.activeInstructors}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">{dashboardData.overview.completionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Avg Engagement</p>
                <p className="text-2xl font-bold">{dashboardData.overview.avgEngagement}%</p>
              </div>
              <Zap className="w-8 h-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold">${dashboardData.overview.monthlyRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2">
              <Plus className="w-6 h-6" />
              <span>Create Course</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              <span>Add Students</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Brain className="w-6 h-6" />
              <span>Generate Content</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New course "Advanced Spanish" created', time: '2 hours ago', type: 'course' },
                { action: '15 students enrolled in "French Basics"', time: '4 hours ago', type: 'enrollment' },
                { action: 'AI generated 20 new vocabulary exercises', time: '6 hours ago', type: 'ai' },
                { action: 'Weekly analytics report generated', time: '1 day ago', type: 'analytics' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'course' ? 'bg-blue-500' :
                    activity.type === 'enrollment' ? 'bg-green-500' :
                    activity.type === 'ai' ? 'bg-purple-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Course Completion Rate</span>
                  <span className="text-green-600">+5.2%</span>
                </div>
                <Progress value={78.5} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Student Engagement</span>
                  <span className="text-green-600">+3.1%</span>
                </div>
                <Progress value={85.2} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Content Quality Score</span>
                  <span className="text-blue-600">+1.8%</span>
                </div>
                <Progress value={92.3} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>AI Efficiency</span>
                  <span className="text-purple-600">+7.4%</span>
                </div>
                <Progress value={88.7} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Course Management Component
  const CourseManagement = () => (
    <div className="space-y-6">
      {/* Course Management Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your language courses</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 1,
            title: "Spanish for Beginners",
            language: "Spanish",
            level: "A1",
            students: 245,
            completion: 78,
            status: "active",
            lastUpdated: "2 days ago",
            instructor: "Maria Garcia"
          },
          {
            id: 2,
            title: "Advanced French Grammar",
            language: "French",
            level: "B2",
            students: 89,
            completion: 65,
            status: "active",
            lastUpdated: "1 week ago",
            instructor: "Pierre Dubois"
          },
          {
            id: 3,
            title: "German Conversation",
            language: "German",
            level: "B1",
            students: 156,
            completion: 82,
            status: "draft",
            lastUpdated: "3 days ago",
            instructor: "Hans Mueller"
          }
        ].map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.language} • {course.level}</p>
                </div>
                <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Students: {course.students}</span>
                  <span>Completion: {course.completion}%</span>
                </div>
                <Progress value={course.completion} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  <p>Instructor: {course.instructor}</p>
                  <p>Updated: {course.lastUpdated}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Student Analytics Component
  const StudentAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Analytics & Progress Tracking</h2>
          <p className="text-muted-foreground">Comprehensive student performance analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Student Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Study Time</p>
                <p className="text-2xl font-bold">2.4h</p>
                <p className="text-xs text-green-600">+8% this week</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">78.5%</p>
                <p className="text-xs text-orange-600">-2% this month</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Score</p>
                <p className="text-2xl font-bold">85.2</p>
                <p className="text-xs text-green-600">+5% this week</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Alice Johnson", course: "Spanish A1", progress: 95, streak: 15 },
                { name: "Bob Smith", course: "French B1", progress: 92, streak: 12 },
                { name: "Carol Davis", course: "German A2", progress: 89, streak: 8 },
                { name: "David Wilson", course: "Italian A1", progress: 87, streak: 10 }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{student.progress}%</p>
                    <p className="text-sm text-muted-foreground">{student.streak} day streak</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Morning Sessions (6-12 PM)</span>
                  <span>35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Afternoon Sessions (12-6 PM)</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Evening Sessions (6-12 AM)</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ContentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Management System</h2>
          <p className="text-muted-foreground">Manage lessons, multimedia content, and assessments</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-semibold mb-2">Lessons</h3>
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Total lessons</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <PlayCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold mb-2">Videos</h3>
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-muted-foreground">Video content</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="font-semibold mb-2">Exercises</h3>
            <p className="text-2xl font-bold">342</p>
            <p className="text-sm text-muted-foreground">Practice exercises</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <h3 className="font-semibold mb-2">Assessments</h3>
            <p className="text-2xl font-bold">67</p>
            <p className="text-sm text-muted-foreground">Tests & quizzes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Spanish Verb Conjugation Lesson", type: "Lesson", course: "Spanish A1", status: "Published", date: "2 hours ago" },
              { title: "French Pronunciation Video", type: "Video", course: "French B1", status: "Draft", date: "1 day ago" },
              { title: "German Grammar Exercise Set", type: "Exercise", course: "German A2", status: "Published", date: "3 days ago" },
              { title: "Italian Vocabulary Assessment", type: "Assessment", course: "Italian A1", status: "Review", date: "1 week ago" }
            ].map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    content.type === 'Lesson' ? 'bg-blue-100 text-blue-600' :
                    content.type === 'Video' ? 'bg-green-100 text-green-600' :
                    content.type === 'Exercise' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {content.type === 'Lesson' ? <FileText className="w-5 h-5" /> :
                     content.type === 'Video' ? <PlayCircle className="w-5 h-5" /> :
                     content.type === 'Exercise' ? <MessageSquare className="w-5 h-5" /> :
                     <Target className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{content.title}</h4>
                    <p className="text-sm text-muted-foreground">{content.course} • {content.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={content.status === 'Published' ? 'default' : content.status === 'Draft' ? 'secondary' : 'outline'}>
                    {content.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const GamificationManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gamification Management</h2>
          <p className="text-muted-foreground">Configure badges, leaderboards, and reward systems</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Badge
          </Button>
          <Button variant="outline">
            <Trophy className="w-4 h-4 mr-2" />
            Manage Rewards
          </Button>
        </div>
      </div>

      {/* Gamification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Badges System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Badges</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex justify-between">
                <span>Awarded This Month</span>
                <span className="font-bold text-green-600">156</span>
              </div>
              <div className="flex justify-between">
                <span>Most Popular</span>
                <span className="font-bold">First Lesson</span>
              </div>
              <Button className="w-full" variant="outline">
                Manage Badges
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Leaderboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Active Boards</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between">
                <span>Participants</span>
                <span className="font-bold text-blue-600">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Winners</span>
                <span className="font-bold">32</span>
              </div>
              <Button className="w-full" variant="outline">
                View Leaderboards
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Achievements</span>
                <span className="font-bold">45</span>
              </div>
              <div className="flex justify-between">
                <span>Unlocked Today</span>
                <span className="font-bold text-green-600">23</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate</span>
                <span className="font-bold">67%</span>
              </div>
              <Button className="w-full" variant="outline">
                Configure Achievements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Management */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "First Lesson", description: "Complete your first lesson", awarded: 1247, icon: "🎯" },
              { name: "Week Warrior", description: "Study for 7 consecutive days", awarded: 456, icon: "⚡" },
              { name: "Grammar Master", description: "Perfect score on grammar test", awarded: 234, icon: "📚" },
              { name: "Conversation Pro", description: "Complete 10 conversations", awarded: 123, icon: "💬" }
            ].map((badge, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <p className="text-sm font-medium">{badge.awarded} awarded</p>
                  <div className="flex gap-1 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management & Administration</h2>
          <p className="text-muted-foreground">Manage students, instructors, and system permissions</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,289</p>
                <p className="text-xs text-green-600">+15 this week</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">+12 this week</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Instructors</p>
                <p className="text-2xl font-bold">34</p>
                <p className="text-xs text-blue-600">+2 this week</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">No change</p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Directory</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Alice Johnson", email: "alice@example.com", role: "Student", status: "Active", lastLogin: "2 hours ago", courses: 3 },
              { name: "Dr. Maria Garcia", email: "maria@example.com", role: "Instructor", status: "Active", lastLogin: "1 hour ago", courses: 5 },
              { name: "Bob Smith", email: "bob@example.com", role: "Student", status: "Active", lastLogin: "1 day ago", courses: 2 },
              { name: "Prof. Pierre Dubois", email: "pierre@example.com", role: "Instructor", status: "Active", lastLogin: "3 hours ago", courses: 4 },
              { name: "Carol Davis", email: "carol@example.com", role: "Student", status: "Inactive", lastLogin: "1 week ago", courses: 1 }
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{user.role}</p>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                      {user.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{user.courses} courses</p>
                    <p className="text-xs text-muted-foreground">{user.lastLogin}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AdvancedAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics & Reporting</h2>
          <p className="text-muted-foreground">Deep insights, custom reports, and business intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-2xl font-bold">+23.5%</p>
                <p className="text-xs text-green-600">vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Retention</p>
                <p className="text-2xl font-bold">87.2%</p>
                <p className="text-xs text-blue-600">+2.1% this quarter</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Course Effectiveness</p>
                <p className="text-2xl font-bold">92.8%</p>
                <p className="text-xs text-purple-600">+5.3% improvement</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Efficiency</p>
                <p className="text-2xl font-bold">94.1%</p>
                <p className="text-xs text-orange-600">+8.7% optimization</p>
              </div>
              <Brain className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Effectiveness Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Vocabulary Retention</span>
                  <span className="text-green-600">89.5%</span>
                </div>
                <Progress value={89.5} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Grammar Comprehension</span>
                  <span className="text-blue-600">76.3%</span>
                </div>
                <Progress value={76.3} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Speaking Confidence</span>
                  <span className="text-purple-600">82.1%</span>
                </div>
                <Progress value={82.1} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Listening Skills</span>
                  <span className="text-orange-600">91.7%</span>
                </div>
                <Progress value={91.7} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { course: "Spanish A1", students: 245, completion: 78, satisfaction: 4.6 },
                { course: "French B1", students: 189, completion: 65, satisfaction: 4.4 },
                { course: "German A2", students: 156, completion: 82, satisfaction: 4.7 },
                { course: "Italian A1", students: 134, completion: 71, satisfaction: 4.3 }
              ].map((course, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{course.course}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{course.satisfaction}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Students: </span>
                      <span className="font-medium">{course.students}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completion: </span>
                      <span className="font-medium">{course.completion}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AIIntegration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Integration & Automation</h2>
          <p className="text-muted-foreground">AI-powered content generation and intelligent automation</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Brain className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* AI Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Content Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Generated Today</span>
                <span className="font-bold text-green-600">47 items</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="font-bold">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Time</span>
                <span className="font-bold">2.3s avg</span>
              </div>
              <Button className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Generate Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Active Models</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy Rate</span>
                <span className="font-bold text-blue-600">91.7%</span>
              </div>
              <div className="flex justify-between">
                <span>User Adoption</span>
                <span className="font-bold">78.5%</span>
              </div>
              <Button className="w-full" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Active Workflows</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks Automated</span>
                <span className="font-bold text-purple-600">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Time Saved</span>
                <span className="font-bold">156 hours</span>
              </div>
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Content Generation */}
      <Card>
        <CardHeader>
          <CardTitle>AI Content Generation Hub</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "Vocabulary Lists", generated: 156, icon: "📝", color: "blue" },
              { type: "Grammar Exercises", generated: 89, icon: "📚", color: "green" },
              { type: "Conversation Scenarios", generated: 67, icon: "💬", color: "purple" },
              { type: "Assessment Questions", generated: 234, icon: "❓", color: "orange" }
            ].map((item, index) => (
              <Card key={index} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold mb-1">{item.type}</h4>
                  <p className="text-2xl font-bold mb-1">{item.generated}</p>
                  <p className="text-xs text-muted-foreground mb-3">Generated this month</p>
                  <Button size="sm" className="w-full">
                    <Plus className="w-3 h-3 mr-1" />
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent AI Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Generated 15 vocabulary exercises for Spanish A1", time: "5 minutes ago", status: "completed" },
              { action: "Created conversation scenarios for French B1", time: "12 minutes ago", status: "completed" },
              { action: "Optimized grammar lesson structure", time: "1 hour ago", status: "completed" },
              { action: "Generated assessment questions for German A2", time: "2 hours ago", status: "processing" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render the appropriate section based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />;
      case 'course-management':
        return <CourseManagement />;
      case 'student-analytics':
        return <StudentAnalytics />;
      case 'content-management':
        return <ContentManagement />;
      case 'gamification':
        return <GamificationManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'advanced-analytics':
        return <AdvancedAnalytics />;
      case 'ai-integration':
        return <AIIntegration />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">EdLingo Admin Dashboard</h1>
              <Badge variant="outline">Comprehensive Course Management</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs opacity-70">{section.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderActiveSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;