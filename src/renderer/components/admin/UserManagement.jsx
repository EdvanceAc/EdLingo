import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Edit, Trash2, Plus, Eye, Ban, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Sample user data
  const sampleUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20',
      progress: {
        level: 5,
        xp: 1250,
        lessonsCompleted: 23
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'teacher',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-01-19',
      progress: {
        level: 8,
        xp: 2100,
        lessonsCompleted: 45
      }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'student',
      status: 'suspended',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-18',
      progress: {
        level: 3,
        xp: 750,
        lessonsCompleted: 12
      }
    }
  ];

  useEffect(() => {
    setUsers(sampleUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'teacher': return 'text-blue-600 bg-blue-100';
      case 'student': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Progress</th>
                  <th className="text-left p-3">Last Login</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>Level {user.progress.level}</div>
                        <div className="text-gray-500">{user.progress.xp} XP</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? 
                            <Ban className="h-4 w-4 text-red-500" /> : 
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-gray-600">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <p className="text-sm text-gray-600">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-gray-600">{selectedUser.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Progress</label>
                <div className="text-sm text-gray-600">
                  <p>Level: {selectedUser.progress.level}</p>
                  <p>XP: {selectedUser.progress.xp}</p>
                  <p>Lessons Completed: {selectedUser.progress.lessonsCompleted}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;