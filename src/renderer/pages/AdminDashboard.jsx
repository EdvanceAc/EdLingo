import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ClipboardList,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart,
  Upload,
  FileText,
  Video,
  File,
  Download,
  X,
  Search,
  Filter,
  MoreVertical,
  Bell,
  Settings,
  LogOut,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats] = useState({
    totalStudents: 1234,
    activeCourses: 24,
    assignments: 156,
    teachers: 18
  });

  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'English Grammar Basics',
      students: 45,
      progress: 78,
      status: 'active'
    },
    {
      id: 2,
      title: 'Pronunciation Practice',
      students: 32,
      progress: 65,
      status: 'active'
    },
    {
      id: 3,
      title: 'Vocabulary Building',
      students: 67,
      progress: 92,
      status: 'completed'
    }
  ]);

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Grammar Exercise #1',
      course: 'English Grammar Basics',
      dueDate: '2024-12-25',
      submissions: 23,
      total: 45,
      status: 'active'
    },
    {
      id: 2,
      title: 'Vocabulary Quiz',
      course: 'Vocabulary Building',
      dueDate: '2024-12-28',
      submissions: 45,
      total: 67,
      status: 'pending'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Handler functions
  const handleAddCourse = () => {
    alert('Add Course feature will be implemented soon!');
  };

  const handleEditCourse = (courseId) => {
    alert(`Edit Course ${courseId} feature will be implemented soon!`);
  };

  const handleDeleteCourse = (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(course => course.id !== courseId));
    }
  };

  const handleCreateAssignment = () => {
    alert('Create Assignment feature will be implemented soon!');
  };

  const handleViewSubmissions = () => {
    alert('View Submissions feature will be implemented soon!');
  };

  const handleGradeReports = () => {
    alert('Grade Reports feature will be implemented soon!');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logout functionality will be implemented soon!');
    }
  };

  // Stats Card Component
  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <motion.div
      whileHover={{ y: -1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all duration-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-xs flex items-center mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-${color}-50 flex-shrink-0`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  // Course Card Component
  const CourseCard = ({ course }) => (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">{course.title}</h3>
          <p className="text-xs text-gray-600 mb-2">{course.students} students enrolled</p>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
          
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            course.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {course.status}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 ml-3">
          <button
            onClick={() => handleEditCourse(course.id)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteCourse(course.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-gray-900">Lingo Admin</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col py-4">
          {/* Welcome Section */}
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back, Admin</h2>
            <p className="text-sm text-gray-600">Here's what's happening with your language learning platform today.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 flex-shrink-0">
            <StatCard
              icon={Users}
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              change={12}
              color="blue"
            />
            <StatCard
              icon={BookOpen}
              title="Active Courses"
              value={stats.activeCourses}
              change={8}
              color="green"
            />
            <StatCard
              icon={ClipboardList}
              title="Assignments"
              value={stats.assignments}
              change={-3}
              color="purple"
            />
            <StatCard
              icon={UserCheck}
              title="Teachers"
              value={stats.teachers}
              change={5}
              color="orange"
            />
          </div>

          {/* Main Grid - Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Course Management */}
              <div className="lg:col-span-2 flex flex-col">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
                      <button
                        onClick={handleAddCourse}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col space-y-4">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-shrink-0">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <button
                        onClick={handleCreateAssignment}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment
                      </button>
                      <button
                        onClick={handleViewSubmissions}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Submissions
                      </button>
                      <button
                        onClick={handleGradeReports}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                      >
                        <BarChart className="w-4 h-4 mr-2" />
                        Grade Reports
                      </button>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Materials
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Assignment submitted</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Course updated</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Grade report generated</p>
                          <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New material uploaded</p>
                          <p className="text-xs text-gray-500">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Upload Course Materials</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports: PDF, DOC, MP4, AVI, JPG, PNG (Max 100MB)
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Choose Files
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;