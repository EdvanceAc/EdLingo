import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalAssignments: 0,
    totalTeachers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard statistics
      await loadStats();
      
      // Load recent activity
      await loadRecentActivity();
      
      // Load users if on students tab
      if (activeTab === 'students') {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalStudents: 156,
        activeCourses: 12,
        totalAssignments: 48,
        totalTeachers: 8
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setRecentActivity([
        {
          id: 1,
          type: 'enrollment',
          message: 'New student enrolled in Spanish Basics',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          user: 'John Doe'
        },
        {
          id: 2,
          type: 'assignment',
          message: 'Assignment "Grammar Exercise 1" submitted',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          user: 'Jane Smith'
        },
        {
          id: 3,
          type: 'completion',
          message: 'Course "French Intermediate" completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          user: 'Mike Johnson'
        }
      ]);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStudents([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          level: 'Beginner',
          progress: 65,
          lastActive: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          level: 'Intermediate',
          progress: 82,
          lastActive: new Date(Date.now() - 1000 * 60 * 60)
        }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'enrollment': return UserCheck;
        case 'assignment': return BookOpen;
        case 'completion': return Award;
        default: return AlertCircle;
      }
    };

    const Icon = getActivityIcon(activity.type);
    
    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{activity.message}</p>
          <p className="text-xs text-muted-foreground">
            {activity.user} • {activity.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage courses, students, and monitor system activity
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </motion.div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              change={12}
            />
            <StatCard
              title="Active Courses"
              value={stats.activeCourses}
              icon={BookOpen}
              color="bg-gradient-to-br from-green-500 to-green-600"
              change={5}
            />
            <StatCard
              title="Total Assignments"
              value={stats.totalAssignments}
              icon={GraduationCap}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              change={-2}
            />
            <StatCard
              title="Teachers"
              value={stats.totalTeachers}
              icon={UserCheck}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              change={0}
            />
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <button className="text-sm text-primary hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Student Management</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>
              <button className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Student</th>
                    <th className="text-left p-4 font-medium">Level</th>
                    <th className="text-left p-4 font-medium">Progress</th>
                    <th className="text-left p-4 font-medium">Last Active</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-t border-border">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {student.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {student.lastActive.toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-muted rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Placeholder for other tabs */}
      {(activeTab === 'courses' || activeTab === 'settings') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">
            {activeTab === 'courses' ? 'Course Management' : 'Settings'}
          </h2>
          <p className="text-muted-foreground">
            This section is under development.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;