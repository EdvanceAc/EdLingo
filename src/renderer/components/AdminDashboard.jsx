import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Mail,
  Calendar,
  Award,
  Target,
  Activity,
  Upload,
  FolderOpen
} from 'lucide-react';
import adminService from '../services/adminService.js';
import FileUpload from './FileUpload.jsx';
import FileManager from './FileManager.jsx';

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalAssignments: 0,
    totalTeachers: 1,
    activeUsers: 0
  });
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter users based on search term and filter
  useEffect(() => {
    let filtered = users;
    
    // Apply search filter
    if (userSearchTerm) {
      filtered = filtered.filter(user => 
        (user.username && user.username.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (userFilter) {
          case 'active':
            return user.isActive;
          case 'inactive':
            return !user.isActive;
          case 'recent':
            const lastActivity = new Date(user.lastActivity);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return lastActivity > sevenDaysAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredUsers(filtered);
  }, [users, userSearchTerm, userFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, coursesData, assignmentsData, activityData, userActivityData, usersData] = await Promise.all([
        adminService.getStatistics(),
        adminService.getCourses(),
        adminService.getAssignments(),
        adminService.getRecentActivity(),
        adminService.getUserActivityData(),
        adminService.getUsers()
      ]);
      
      setStatistics(statsData);
      setCourses(coursesData);
      setAssignments(assignmentsData);
      setRecentActivity(activityData);
      setUserActivityData(userActivityData);
      setUsers(usersData || []);
      setFilteredUsers(usersData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await adminService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        // Update statistics
        setStatistics(prev => ({ ...prev, activeCourses: prev.activeCourses - 1 }));
      } catch (err) {
        alert('Failed to delete course: ' + err.message);
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
          <div className="flex items-center mt-2 space-x-4">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {course.level}
            </span>
            <span className="text-xs text-gray-500">
              {course.estimated_duration || 15} min
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDeleteCourse(course.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Language: {course.language || 'Spanish'}</span>
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          Active
        </span>
      </div>
    </div>
  );

  const AssignmentRow = ({ assignment }) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'Not set';
      return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (assignment) => {
      if (assignment.completed_at) return 'text-green-600';
      if (assignment.started_at) return 'text-blue-600';
      return 'text-gray-600';
    };

    const getStatusText = (assignment) => {
      if (assignment.completed_at) return 'Completed';
      if (assignment.started_at) return 'In Progress';
      return 'Not Started';
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {assignment.session_type || 'Assignment'}
          </div>
          <div className="text-sm text-gray-500">
            {assignment.users?.username || assignment.users?.first_name || 'Unknown User'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatDate(assignment.started_at)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {assignment.duration_minutes} min
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {assignment.accuracy_percentage ? `${assignment.accuracy_percentage}%` : 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`text-sm font-medium ${getStatusColor(assignment)}`}>
            {getStatusText(assignment)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {assignment.xp_earned} XP
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EdLingo Admin Dashboard</h1>
              <p className="text-gray-600">Manage courses, assignments, and student progress</p>
            </div>
            <button 
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'files', label: 'File Manager', icon: FolderOpen }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === id 
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard 
                title="Total Students" 
                value={statistics.totalStudents} 
                icon={Users} 
                color="#3B82F6" 
              />
              <StatCard 
                title="Active Users (7d)" 
                value={statistics.activeUsers} 
                icon={Users} 
                color="#06B6D4" 
              />
              <StatCard 
                title="Active Courses" 
                value={statistics.activeCourses} 
                icon={BookOpen} 
                color="#10B981" 
              />
              <StatCard 
                title="Assignments" 
                value={statistics.totalAssignments} 
                icon={FileText} 
                color="#F59E0B" 
              />
              <StatCard 
                title="Teachers" 
                value={statistics.totalTeachers} 
                icon={GraduationCap} 
                color="#8B5CF6" 
              />
            </div>

            {/* User Activity Overview */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">User Activity Overview</h2>
                <p className="text-sm text-gray-600">Student engagement and progress metrics</p>
              </div>
              <div className="p-6">
                {userActivityData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time Spent (30d)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            XP Earned (30d)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Streak
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total XP
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userActivityData.slice(0, 10).map((user, index) => {
                          const formatTime = (minutes) => {
                            if (minutes < 60) return `${minutes}m`;
                            const hours = Math.floor(minutes / 60);
                            const remainingMinutes = minutes % 60;
                            return `${hours}h ${remainingMinutes}m`;
                          };

                          const formatDate = (dateString) => {
                            if (!dateString) return 'Never';
                            const date = new Date(dateString);
                            const now = new Date();
                            const diffTime = Math.abs(now - date);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 1) return 'Today';
                            if (diffDays === 2) return 'Yesterday';
                            if (diffDays <= 7) return `${diffDays - 1} days ago`;
                            return date.toLocaleDateString();
                          };

                          return (
                            <tr key={user.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-blue-800">
                                        {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.username || user.email || `User ${user.id}`}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {user.email && user.username ? user.email : ''}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(user.lastActivity)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatTime(user.totalTimeSpent || 0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.totalXPEarned || 0} XP
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.user_progress?.[0]?.current_streak || 0} days
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.user_progress?.[0]?.total_xp || 0} XP
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No user activity data available</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600">Latest learning sessions and achievements</p>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 8).map((activity, index) => {
                      const getActivityIcon = (type) => {
                        switch (type) {
                          case 'lesson': return <BookOpen className="h-5 w-5 text-blue-500" />;
                          case 'practice': return <Edit className="h-5 w-5 text-green-500" />;
                          case 'quiz': return <FileText className="h-5 w-5 text-purple-500" />;
                          case 'assignment': return <CheckCircle className="h-5 w-5 text-orange-500" />;
                          default: return <CheckCircle className="h-5 w-5 text-gray-500" />;
                        }
                      };

                      return (
                        <div key={activity.id || index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                              {activity.duration && (
                                <span className="text-xs text-blue-600">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {activity.duration}m
                                </span>
                              )}
                              {activity.accuracy && (
                                <span className="text-xs text-green-600">
                                  {activity.accuracy}% accuracy
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="recent">Recent Activity</option>
                </select>
              </div>
            </div>
            
            {filteredUsers.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total XP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Streak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user, index) => {
                        const formatTime = (minutes) => {
                          if (!minutes) return '0m';
                          if (minutes < 60) return `${minutes}m`;
                          const hours = Math.floor(minutes / 60);
                          const remainingMinutes = minutes % 60;
                          return `${hours}h ${remainingMinutes}m`;
                        };

                        const formatDate = (dateString) => {
                          if (!dateString) return 'Never';
                          const date = new Date(dateString);
                          const now = new Date();
                          const diffTime = Math.abs(now - date);
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays === 1) return 'Today';
                          if (diffDays === 2) return 'Yesterday';
                          if (diffDays <= 7) return `${diffDays - 1} days ago`;
                          return date.toLocaleDateString();
                        };

                        return (
                          <tr key={user.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-800">
                                      {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.username || user.email || `User ${user.id}`}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email && user.username ? user.email : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(user.lastActivity)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.user_progress?.[0]?.total_xp || 0} XP
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.user_progress?.[0]?.current_streak || 0} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTime(user.totalTimeSpent || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {userSearchTerm || userFilter !== 'all' 
                    ? 'No users found matching your criteria.' 
                    : 'No users found.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Course</span>
              </button>
            </div>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No courses found. Create your first course to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Assignment</span>
              </button>
            </div>
            
            {assignments.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment / Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        XP Earned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map(assignment => (
                      <AssignmentRow key={assignment.id} assignment={assignment} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found. Create your first assignment to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* File Management Tab */}
        {activeTab === 'files' && (
          <div className="space-y-8">
            {/* File Upload Section */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Upload Files to Google Drive</h2>
                    <p className="text-sm text-gray-600">Upload files, videos, images, and audio for use in courses and assignments</p>
                  </div>
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Course Files */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Course Materials</h3>
                    <FileUpload
                      category="courses"
                      subcategory="general"
                      onUploadComplete={(results) => {
                        console.log('Course files uploaded:', results);
                        // You can add a toast notification here
                      }}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                        // You can add error notification here
                      }}
                      className="border border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Assignment Files */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Assignment Materials</h3>
                    <FileUpload
                      category="assignments"
                      subcategory="general"
                      onUploadComplete={(results) => {
                        console.log('Assignment files uploaded:', results);
                      }}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                      }}
                      className="border border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* Shared Resources */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Shared Resources</h3>
                    <FileUpload
                      category="shared_resources"
                      subcategory="general"
                      onUploadComplete={(results) => {
                        console.log('Shared files uploaded:', results);
                      }}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                      }}
                      className="border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* File Manager Section */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Manage Uploaded Files</h2>
                    <p className="text-sm text-gray-600">View, organize, and manage all uploaded files</p>
                  </div>
                  <FolderOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="p-6">
                <FileManager className="" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* User Profile Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-medium text-blue-800">
                      {(selectedUser.username || selectedUser.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUser.username || selectedUser.email || `User ${selectedUser.id}`}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      {selectedUser.email && (
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{selectedUser.email}</span>
                        </div>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total XP</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {selectedUser.user_progress?.[0]?.total_xp || 0}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Current Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {selectedUser.user_progress?.[0]?.current_streak || 0} days
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Time Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {(() => {
                        const minutes = selectedUser.totalTimeSpent || 0;
                        if (minutes < 60) return `${minutes}m`;
                        const hours = Math.floor(minutes / 60);
                        const remainingMinutes = minutes % 60;
                        return `${hours}h ${remainingMinutes}m`;
                      })()}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Last Activity</span>
                    </div>
                    <p className="text-sm font-bold text-orange-900 mt-1">
                      {(() => {
                        if (!selectedUser.lastActivity) return 'Never';
                        const date = new Date(selectedUser.lastActivity);
                        const now = new Date();
                        const diffTime = Math.abs(now - date);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 1) return 'Today';
                        if (diffDays === 2) return 'Yesterday';
                        if (diffDays <= 7) return `${diffDays - 1} days ago`;
                        return date.toLocaleDateString();
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Details */}
              <div className="mb-8">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Lessons Completed</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedUser.user_progress?.[0]?.lessons_completed || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Exercises Completed</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedUser.user_progress?.[0]?.exercises_completed || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Average Accuracy</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedUser.user_progress?.[0]?.average_accuracy || 0}%
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Level</span>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedUser.user_progress?.[0]?.level || 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">User ID</span>
                      <p className="text-sm text-gray-900">{selectedUser.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Registration Date</span>
                      <p className="text-sm text-gray-900">
                        {selectedUser.created_at 
                          ? new Date(selectedUser.created_at).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Last Login</span>
                      <p className="text-sm text-gray-900">
                        {selectedUser.last_login 
                          ? new Date(selectedUser.last_login).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                      <p className="text-sm text-gray-900">
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;