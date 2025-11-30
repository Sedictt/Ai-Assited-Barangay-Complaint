import React, { useState, useEffect } from 'react';
import { User, Role, SystemLog, LogCategory } from '../types';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { addSystemLog, subscribeToSystemLogs } from '../services/firestoreService';
import { Users, Plus, Edit, Trash2, Shield, Search, X, Loader2, Save, Activity, FileText, Filter } from './Icons';

interface SuperAdminDashboardProps {
    currentUser: User;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        role: Role.OFFICIAL
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else {
            setIsLoading(true);
            const unsubscribe = subscribeToSystemLogs((data) => {
                setLogs(data);
                setIsLoading(false);
            });
            return () => unsubscribe();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setIsLoading(false);
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '', // Don't show existing password
                fullName: user.fullName,
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                fullName: '',
                role: Role.OFFICIAL
            });
        }
        setFormError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            if (editingUser) {
                // Update
                const updates: Partial<User> = {
                    fullName: formData.fullName,
                    role: formData.role
                };
                // Only update password if provided
                if (formData.password) {
                    updates.password = formData.password;
                }
                await updateUser(editingUser.id, updates);

                // Log Action
                await addSystemLog({
                    timestamp: new Date().toISOString(),
                    action: 'USER_UPDATED',
                    category: LogCategory.USER_MANAGEMENT,
                    actor: currentUser.username,
                    details: `Updated user ${editingUser.username} (${formData.role})`,
                    metadata: { userId: editingUser.id, target: editingUser.username }
                });

            } else {
                // Create
                if (!formData.username || !formData.password || !formData.fullName) {
                    throw new Error('All fields are required for new users');
                }
                const newUserId = await createUser({
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    role: formData.role
                });

                // Log Action
                await addSystemLog({
                    timestamp: new Date().toISOString(),
                    action: 'USER_CREATED',
                    category: LogCategory.USER_MANAGEMENT,
                    actor: currentUser.username,
                    details: `Created new user ${formData.username} (${formData.role})`,
                    metadata: { userId: newUserId, target: formData.username }
                });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            setFormError(error.message || 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const userToDelete = users.find(u => u.id === id);
                await deleteUser(id);

                // Log Action
                await addSystemLog({
                    timestamp: new Date().toISOString(),
                    action: 'USER_DELETED',
                    category: LogCategory.USER_MANAGEMENT,
                    actor: currentUser.username,
                    details: `Deleted user ${userToDelete?.username || id}`,
                    metadata: { userId: id, target: userToDelete?.username }
                });

                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (category: LogCategory) => {
        switch (category) {
            case LogCategory.AUTH: return 'bg-blue-100 text-blue-800';
            case LogCategory.USER_MANAGEMENT: return 'bg-purple-100 text-purple-800';
            case LogCategory.COMPLAINT: return 'bg-orange-100 text-orange-800';
            case LogCategory.SYSTEM: return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Page Title */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="bg-purple-600 text-white p-2 rounded-lg font-bold">SA</div>
                    <div>
                        <h1 className="font-bold text-gray-900 text-2xl">System Administration</h1>
                        <p className="text-sm text-gray-500">Manage officials and access control</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 max-w-md">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${activeTab === 'users'
                                ? 'bg-white text-purple-700 shadow'
                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-purple-600'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            User Management
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${activeTab === 'logs'
                                ? 'bg-white text-purple-700 shadow'
                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-purple-600'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Activity className="w-4 h-4" />
                            System Logs
                        </div>
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full max-w-2xl">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={activeTab === 'users' ? "Search users..." : "Search logs..."}
                                />
                            </div>

                            {activeTab === 'logs' && (
                                <div className="relative w-48">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Filter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                                    >
                                        <option value="ALL">All Categories</option>
                                        {Object.values(LogCategory).map(cat => (
                                            <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {activeTab === 'users' && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add New User
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="overflow-x-auto">
                        {activeTab === 'users' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4">Created At</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                                    <p>Loading users...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.role === Role.SUPERADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {user.fullName.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{user.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === Role.SUPERADMIN
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {user.role === Role.SUPERADMIN && <Shield className="w-3 h-3 mr-1" />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal(user)}
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        {user.id !== currentUser.id && (
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Actor</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                                    <p>Loading logs...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No logs found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                                                        {log.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {log.actor}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {log.details}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. Juan Dela Cruz"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value={Role.OFFICIAL}>Official</option>
                                    <option value={Role.SUPERADMIN}>Super Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g. juandelacruz"
                                    required
                                    disabled={!!editingUser} // Prevent changing username for now
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    required={!editingUser}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
