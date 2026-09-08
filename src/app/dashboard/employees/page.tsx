'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  Check,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import CSVImportModal from '@/components/CSVImportModal';

interface EmployeeItem {
  id: string;
  userId: string;
  companyId: string;
  employeeId: string;
  phone?: string | null;
  skillsJson?: string | null;
  hireDate?: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatar?: string | null;
    createdAt?: string;
  };
  department?: { id: string; name: string } | null;
  position?: { id: string; name: string } | null;
  _count?: {
    examAssignments?: number;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  // Selected employee for Edit / Delete
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);

  // Form states
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: 'Employee123!',
    employeeId: '',
    phone: '',
    role: 'EMPLOYEE',
    companyId: 'comp-dahabshiil-01',
    skills: '',
  });

  const [editEmp, setEditEmp] = useState({
    name: '',
    email: '',
    employeeId: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    phone: '',
    skills: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/employees?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setEmployees(json.employees || []);
      } else {
        showToast('Failed to load employee records', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, roleFilter, statusFilter]);

  // Handle CREATE
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skillsArray = newEmp.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEmp.name,
          email: newEmp.email,
          password: newEmp.password,
          employeeId: newEmp.employeeId,
          phone: newEmp.phone,
          role: newEmp.role,
          companyId: newEmp.companyId,
          skills: skillsArray,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setShowAddModal(false);
        setNewEmp({
          name: '',
          email: '',
          password: 'Employee123!',
          employeeId: '',
          phone: '',
          role: 'EMPLOYEE',
          companyId: 'comp-dahabshiil-01',
          skills: '',
        });
        showToast(`Staff member "${newEmp.name}" registered successfully!`);
        fetchEmployees();
      } else {
        showToast(data.error || 'Failed to create employee', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (emp: EmployeeItem) => {
    setSelectedEmployee(emp);
    let skillsStr = '';
    try {
      if (emp.skillsJson) {
        const parsed = JSON.parse(emp.skillsJson);
        if (Array.isArray(parsed)) skillsStr = parsed.join(', ');
      }
    } catch (e) {}

    setEditEmp({
      name: emp.user.name,
      email: emp.user.email,
      employeeId: emp.employeeId,
      role: emp.user.role,
      status: emp.user.status,
      phone: emp.phone || '',
      skills: skillsStr,
      password: '',
    });
    setShowEditModal(true);
  };

  // Handle UPDATE (Edit)
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      const skillsArray = editEmp.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const targetId = selectedEmployee.id || selectedEmployee.userId;
      const res = await fetch(`/api/employees/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editEmp.name,
          email: editEmp.email,
          employeeId: editEmp.employeeId,
          role: editEmp.role,
          status: editEmp.status,
          phone: editEmp.phone,
          skills: skillsArray,
          password: editEmp.password.trim().length > 0 ? editEmp.password.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setShowEditModal(false);
        showToast(`Employee "${editEmp.name}" updated successfully!`);
        fetchEmployees();
      } else {
        showToast(data.error || 'Failed to update employee', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (emp: EmployeeItem) => {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  };

  // Handle DELETE
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    setIsDeleting(true);
    try {
      const targetId = selectedEmployee.id || selectedEmployee.userId;
      const res = await fetch(`/api/employees/${targetId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setShowDeleteModal(false);
        showToast(`Employee "${selectedEmployee.user.name}" permanently deleted.`);
        fetchEmployees();
      } else {
        showToast(data.error || 'Failed to delete employee', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting employee', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = 'Name,Email,Employee ID,Role,Status,Phone\n';
    const rows = employees
      .map(
        (e) =>
          `"${e.user.name}","${e.user.email}","${e.employeeId}","${
            e.user.role
          }","${e.user.status}","${e.phone || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_directory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md animate-in slide-in-from-top-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/90 text-white border-emerald-400'
              : 'bg-rose-500/90 text-white border-rose-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {employees.length} Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time corporate workforce management, role assignments, and credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEmployees()}
            title="Refresh list"
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import CSV
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="EMPLOYEE">Staff / Employee</option>
                <option value="EXAMINER">Examiner / Proctor</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="TRAINING_MANAGER">Training Manager</option>
                <option value="COMPANY_ADMIN">Company Administrator</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="p-16 flex flex-col justify-center items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-xs font-medium text-slate-400">Loading workforce records from database...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No employees found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No employee matches the specified search or filter criteria. Try clearing your filters or add a new staff member.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Role & Access</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => (
                  <tr key={e.id || e.userId} className="hover:bg-slate-50/90 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                          {e.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                            {e.user.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {e.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
                        {e.employeeId}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${
                          e.user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : e.user.role === 'COMPANY_ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : e.user.role === 'EXAMINER'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : e.user.role === 'HR_MANAGER'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {e.user.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          e.user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : e.user.status === 'SUSPENDED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.user.status === 'ACTIVE'
                              ? 'bg-emerald-500'
                              : e.user.status === 'SUSPENDED'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        {e.user.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {e.phone ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {e.phone}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(e)}
                          title="Edit Employee Information"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(e)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onSuccess={() => {
          showToast('CSV employees imported successfully!');
          fetchEmployees();
        }}
        departments={[]}
      />

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Employee</h3>
                  <p className="text-[11px] text-slate-500">Create staff profile with persistent database credentials</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="e.g. Hassan Ali Shire"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.employeeId}
                    onChange={(e) => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                    placeholder="e.g. EMP-DBI-2030"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  placeholder="hassan.ali@company.so"
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Organization / Company *</label>
                <select
                  value={newEmp.companyId}
                  onChange={(e) => setNewEmp({ ...newEmp, companyId: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                >
                  <option value="comp-dahabshiil-01">Dahabshiil Bank International</option>
                  <option value="comp-banadir-02">Banadir Health & Medical Center</option>
                  <option value="comp-hormuud-03">Hormuud Telecom & Cloud Solutions</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Permissions</label>
                  <select
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  >
                    <option value="EMPLOYEE">Staff / Employee</option>
                    <option value="EXAMINER">Examiner / Proctor</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="TRAINING_MANAGER">Training Manager</option>
                    <option value="COMPANY_ADMIN">Company Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="+252 (61) 500-0000"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newEmp.password}
                    onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills & Competencies (comma separated)</label>
                <input
                  type="text"
                  value={newEmp.skills}
                  onChange={(e) => setNewEmp({ ...newEmp, skills: e.target.value })}
                  placeholder="e.g. Risk Assessment, Treasury, AML Due Diligence"
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Employee Profile</h3>
                  <p className="text-[11px] text-slate-500">Update workforce details for {selectedEmployee.user.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editEmp.name}
                    onChange={(e) => setEditEmp({ ...editEmp, name: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={editEmp.employeeId}
                    onChange={(e) => setEditEmp({ ...editEmp, employeeId: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmp.email}
                  onChange={(e) => setEditEmp({ ...editEmp, email: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Permissions</label>
                  <select
                    value={editEmp.role}
                    onChange={(e) => setEditEmp({ ...editEmp, role: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  >
                    <option value="EMPLOYEE">Staff / Employee</option>
                    <option value="EXAMINER">Examiner / Proctor</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="TRAINING_MANAGER">Training Manager</option>
                    <option value="COMPANY_ADMIN">Company Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editEmp.status}
                    onChange={(e) => setEditEmp({ ...editEmp, status: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editEmp.phone}
                    onChange={(e) => setEditEmp({ ...editEmp, phone: e.target.value })}
                    placeholder="+252 (61) 500-0000"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Password (Optional)</label>
                  <input
                    type="password"
                    value={editEmp.password}
                    onChange={(e) => setEditEmp({ ...editEmp, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills & Competencies (comma separated)</label>
                <input
                  type="text"
                  value={editEmp.skills}
                  onChange={(e) => setEditEmp({ ...editEmp, skills: e.target.value })}
                  placeholder="e.g. Risk Assessment, Treasury, AML Due Diligence"
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">Delete Employee Permanently?</h3>
              <p className="text-xs text-slate-500 mt-2">
                Are you sure you want to remove <span className="font-bold text-slate-900">{selectedEmployee.user.name}</span> (
                <span className="font-mono text-slate-700">{selectedEmployee.employeeId}</span>)?
              </p>

              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-700 text-left">
                ⚠️ This action cannot be undone. All user authentication records, exam assignments, and profile metadata will be permanently deleted from the database.
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteEmployee}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 transition flex items-center gap-2 active:scale-95"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Delete Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
