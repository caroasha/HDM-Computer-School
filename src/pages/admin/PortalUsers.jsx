import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';

export const PortalUsers = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [portalUsers, setPortalUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all', 'admins', 'portal'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    students: 0,
    staff: 0,
    active: 0,
    inactive: 0
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch portal users (students/staff)
      const { data: portalData } = await api.get('/portal/admin/users');
      
      // Fetch admin users from school_users
      const { data: adminData } = await api.get('/auth/users');
      
      // Format admin users for display
      const formattedAdmins = adminData.map(admin => ({
        ...admin,
        userType: 'admin',
        regNumber: 'ADMIN',
        role: admin.role || 'admin',
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
        active: true
      }));
      
      // Format portal users
      const formattedPortal = portalData.map(user => ({
        ...user,
        userType: 'portal'
      }));
      
      // Combine: admins first, then portal users
      const allUsers = [...formattedAdmins, ...formattedPortal];
      
      setAdmins(formattedAdmins);
      setPortalUsers(formattedPortal);
      setUsers(allUsers);
      applyFilters(allUsers, searchTerm, roleFilter, statusFilter, userTypeFilter);
      
      // Calculate stats
      const students = formattedPortal.filter(u => u.role === 'student').length;
      const staff = formattedPortal.filter(u => u.role === 'staff').length;
      const active = allUsers.filter(u => u.active !== false).length;
      const inactive = allUsers.filter(u => u.active === false).length;
      
      setStats({
        total: allUsers.length,
        admins: formattedAdmins.length,
        students,
        staff,
        active,
        inactive
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      alert(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const applyFilters = (usersList, search, role, status, userType) => {
    let filtered = [...usersList];
    
    // Search filter
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.regNumber?.toLowerCase().includes(term)
      );
    }
    
    // User type filter (admin vs portal)
    if (userType === 'admins') {
      filtered = filtered.filter(u => u.userType === 'admin');
    } else if (userType === 'portal') {
      filtered = filtered.filter(u => u.userType === 'portal');
    }
    
    // Role filter (only applies to portal users)
    if (role !== 'all') {
      filtered = filtered.filter(u => u.role === role);
    }
    
    // Status filter
    if (status !== 'all') {
      const isActive = status === 'active';
      filtered = filtered.filter(u => u.active === isActive);
    }
    
    setFilteredUsers(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(users, value, roleFilter, statusFilter, userTypeFilter);
  };

  const handleRoleFilter = (e) => {
    const value = e.target.value;
    setRoleFilter(value);
    applyFilters(users, searchTerm, value, statusFilter, userTypeFilter);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    applyFilters(users, searchTerm, roleFilter, value, userTypeFilter);
  };

  const handleUserTypeFilter = (e) => {
    const value = e.target.value;
    setUserTypeFilter(value);
    applyFilters(users, searchTerm, roleFilter, statusFilter, value);
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;
    try {
      if (selectedUser.userType === 'admin') {
        await api.put(`/auth/users/${selectedUser._id}`, { role: newRole });
      } else {
        await api.put(`/portal/admin/users/${selectedUser._id}`, { role: newRole });
      }
      setModalOpen(false);
      fetchUsers();
      alert(`User role updated to ${newRole}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
      try {
        if (user.userType === 'admin') {
          await api.put(`/auth/users/${user._id}/toggle`, { active: newStatus });
        } else {
          await api.put(`/portal/admin/users/${user._id}/toggle`);
        }
        fetchUsers();
        alert(`User ${action}d successfully`);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update status');
      }
    }
  };

  const deleteUser = async (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        if (user.userType === 'admin') {
          await api.delete(`/auth/users/${user._id}`);
        } else {
          await api.delete(`/portal/admin/users/${user._id}`);
        }
        fetchUsers();
        alert('User deleted successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setModalOpen(true);
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'student': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeBadge = (userType) => {
    if (userType === 'admin') {
      return <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>;
    }
    return null;
  };

  if (loading) return <div className="text-center py-10">Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="text-sm text-gray-500">
          Total: {stats.total} | Admins: {stats.admins} | Students: {stats.students} | Staff: {stats.staff}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-500 text-sm">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-500 text-sm">Students</p>
          <p className="text-2xl font-bold text-green-600">{stats.students}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-500 text-sm">Staff</p>
          <p className="text-2xl font-bold text-blue-600">{stats.staff}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-500 text-sm">Active / Inactive</p>
          <p className="text-2xl font-bold">
            <span className="text-green-600">{stats.active}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-red-600">{stats.inactive}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, email or reg number..."
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User Type</label>
            <select
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={userTypeFilter}
              onChange={handleUserTypeFilter}
            >
              <option value="all">All Users</option>
              <option value="admins">Admins Only</option>
              <option value="portal">Portal Users Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Role</label>
            <select
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={roleFilter}
              onChange={handleRoleFilter}
              disabled={userTypeFilter === 'admins'}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Status</label>
            <select
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Reg Number / ID</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Registered</th>
                  <th className="p-3 text-left">Last Login</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {getUserTypeBadge(user.userType)}
                      </div>
                     </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      {user.userType === 'admin' ? 'System Admin' : (user.regNumber || '-')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                     </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.active !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active !== false ? 'Active' : 'Inactive'}
                      </span>
                     </td>
                    <td className="p-3 text-sm">{formatDate(user.createdAt)}</td>
                    <td className="p-3 text-sm">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Change Role"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`text-sm ${user.active !== false ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                          title={user.active !== false ? 'Deactivate' : 'Activate'}
                        >
                          {user.active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredUsers.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Change User Role">
        {selectedUser && (
          <div>
            <p className="mb-4">
              <strong>User:</strong> {selectedUser.name}<br />
              <strong>Current Role:</strong> <span className="capitalize">{selectedUser.role}</span>
              {selectedUser.userType === 'admin' && (
                <span className="ml-2 text-xs text-purple-600">(Admin User)</span>
              )}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Role</label>
              <select
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {selectedUser.userType === 'admin' ? (
                  <>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </>
                ) : (
                  <>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </>
                )}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={updateUserRole}>Update Role</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};