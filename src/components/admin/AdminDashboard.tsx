import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Scissors,
  Settings,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Phone,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  Ban,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import type {
  Booking,
  ServiceItem,
  SalonSettings,
  BlockedPeriod,
  DashboardStats,
  BookingStatus,
} from '../../types';
import {
  adminLogin,
  adminVerify,
  adminChangeCredentials,
  fetchDashboardStats,
  fetchAdminBookings,
  updateBookingStatus,
  createWalkInBooking,
  deleteBooking,
  fetchAdminServices,
  addAdminService,
  updateAdminService,
  deleteAdminService,
  fetchAdminSettings,
  updateAdminSettings,
  addBlockedPeriod,
  deleteBlockedPeriod,
  setStoredAdminToken,
} from '../../api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [loginUser, setLoginUser] = useState<string>('admin');
  const [loginPass, setLoginPass] = useState<string>('admin@vj123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Admin Tab: 'overview' | 'bookings' | 'services' | 'timings' | 'settings' | 'security'
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [salonSettings, setSalonSettings] = useState<SalonSettings | null>(null);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters for Bookings
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Walk-in booking modal state
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);
  const [walkInName, setWalkInName] = useState<string>('');
  const [walkInPhone, setWalkInPhone] = useState<string>('');
  const [walkInServiceIds, setWalkInServiceIds] = useState<string[]>([]);
  const [walkInDate, setWalkInDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [walkInTime, setWalkInTime] = useState<string>('12:00 PM');
  const [walkInNote, setWalkInNote] = useState<string>('');

  // Service Edit / Add Modal
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isNewService, setIsNewService] = useState<boolean>(false);

  // Block period state
  const [blockDate, setBlockDate] = useState<string>('');
  const [blockStartTime, setBlockStartTime] = useState<string>('');
  const [blockEndTime, setBlockEndTime] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('');

  // Credentials change state
  const [newAdminUser, setNewAdminUser] = useState<string>('');
  const [newAdminPass, setNewAdminPass] = useState<string>('');

  // Check existing token on mount
  useEffect(() => {
    if (isOpen) {
      adminVerify()
        .then((res) => {
          setIsAuthenticated(true);
          setAdminUsername(res.username);
          loadAllAdminData();
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    }
  }, [isOpen]);

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [statsData, bookingsData, servicesData, settingsData] = await Promise.all([
        fetchDashboardStats(),
        fetchAdminBookings({ search: searchQuery, date: filterDate, status: filterStatus }),
        fetchAdminServices(),
        fetchAdminSettings(),
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setServices(servicesData);
      setSalonSettings(settingsData.settings);
      setBlockedPeriods(settingsData.blockedPeriods);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Re-fetch bookings when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminBookings({ search: searchQuery, date: filterDate, status: filterStatus })
        .then((data) => setBookings(data))
        .catch(console.error);
    }
  }, [searchQuery, filterDate, filterStatus, isAuthenticated]);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
    if (onDataChanged) onDataChanged();
  };

  const triggerError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(null), 5000);
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await adminLogin(loginUser.trim(), loginPass.trim());
      setIsAuthenticated(true);
      setAdminUsername(res.username);
      await loadAllAdminData();
      triggerSuccess('Welcome back, Admin!');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setStoredAdminToken(null);
    setIsAuthenticated(false);
    onClose();
  };

  // Change Booking Status
  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      const updatedStats = await fetchDashboardStats();
      setStats(updatedStats);
      triggerSuccess(`Booking ${id} marked as ${newStatus}`);
    } catch (err: any) {
      triggerError(err.message || 'Failed to update status');
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm(`Are you sure you want to delete booking ${id}?`)) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      const updatedStats = await fetchDashboardStats();
      setStats(updatedStats);
      triggerSuccess(`Booking ${id} deleted.`);
    } catch (err: any) {
      triggerError(err.message || 'Failed to delete booking');
    }
  };

  // Handle Walk-in Submission
  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || walkInServiceIds.length === 0) {
      triggerError('Please enter customer name and select at least one service');
      return;
    }

    try {
      await createWalkInBooking({
        customerName: walkInName,
        mobileNumber: walkInPhone || '9999999999',
        serviceIds: walkInServiceIds,
        appointmentDate: walkInDate,
        appointmentTime: walkInTime,
        customerMessage: walkInNote,
      });
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServiceIds([]);
      await loadAllAdminData();
      triggerSuccess('Walk-in booking created successfully!');
    } catch (err: any) {
      triggerError(err.message || 'Failed to create walk-in booking');
    }
  };

  // Save Service (Add or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name || editingService.price === undefined || !editingService.duration) {
      triggerError('Please fill all required service fields');
      return;
    }

    try {
      if (isNewService) {
        const added = await addAdminService(editingService);
        setServices((prev) => [...prev, added]);
        triggerSuccess(`Service "${added.name}" added successfully.`);
      } else if (editingService.id) {
        const updated = await updateAdminService(editingService.id, editingService);
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        triggerSuccess(`Service "${updated.name}" updated successfully.`);
      }
      setEditingService(null);
    } catch (err: any) {
      triggerError(err.message || 'Failed to save service');
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteAdminService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      triggerSuccess(`Service "${name}" removed.`);
    } catch (err: any) {
      triggerError(err.message || 'Failed to delete service');
    }
  };

  // Toggle Service Active/Inactive
  const handleToggleServiceActive = async (service: ServiceItem) => {
    try {
      const updated = await updateAdminService(service.id, { active: !service.active });
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      triggerSuccess(`Service "${service.name}" is now ${updated.active ? 'Active' : 'Disabled'}.`);
    } catch (err: any) {
      triggerError(err.message || 'Failed to toggle service');
    }
  };

  // Update Salon Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonSettings) return;
    try {
      const saved = await updateAdminSettings(salonSettings);
      setSalonSettings(saved);
      triggerSuccess('Salon settings saved successfully!');
    } catch (err: any) {
      triggerError(err.message || 'Failed to update settings');
    }
  };

  // Add Blocked Date / Slot
  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      triggerError('Please select a date to block');
      return;
    }
    try {
      const created = await addBlockedPeriod({
        date: blockDate,
        startTime: blockStartTime || undefined,
        endTime: blockEndTime || undefined,
        reason: blockReason || 'Unavailable',
      });
      setBlockedPeriods((prev) => [...prev, created]);
      setBlockDate('');
      setBlockStartTime('');
      setBlockEndTime('');
      setBlockReason('');
      triggerSuccess('Date/Time slot blocked successfully.');
    } catch (err: any) {
      triggerError(err.message || 'Failed to block period');
    }
  };

  // Delete Blocked Period
  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteBlockedPeriod(id);
      setBlockedPeriods((prev) => prev.filter((b) => b.id !== id));
      triggerSuccess('Blocked period removed.');
    } catch (err: any) {
      triggerError(err.message || 'Failed to remove block');
    }
  };

  // Update Admin Credentials
  const handleChangeCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser && !newAdminPass) {
      triggerError('Please provide a new username or password');
      return;
    }
    try {
      const res = await adminChangeCredentials(newAdminUser, newAdminPass);
      setAdminUsername(res.username);
      setNewAdminUser('');
      setNewAdminPass('');
      triggerSuccess('Admin login credentials updated successfully!');
    } catch (err: any) {
      triggerError(err.message || 'Failed to change credentials');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-neutral-900 border border-[#c69214]/40 shadow-2xl text-neutral-100 flex flex-col my-auto max-h-[96vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-black/70 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c69214]/20 border border-[#c69214]/40 flex items-center justify-center text-[#f3cc51]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
                  VJ Salon Control Panel
                </h2>
                {isAuthenticated && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600/40 px-2 py-0.5 rounded font-mono font-bold">
                    SECURE ADMIN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Authorized Personnel Only • Dhamdha Salon Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                id="btn-admin-logout"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-red-300 flex items-center gap-1.5 border border-neutral-700 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notifications */}
        {actionSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-red-950/90 border-b border-red-500/50 px-4 py-2 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* LOGIN SCREEN (IF NOT AUTHENTICATED) */}
        {/* ========================================================= */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#c69214]/15 border border-[#c69214]/40 text-[#f3cc51] flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="font-serif-luxury text-2xl font-bold text-white">
                Admin Authentication
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your credentials to manage appointments, services, and salon hours.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Username / Email
                </label>
                <input
                  id="admin-login-username"
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  placeholder="admin"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 focus:border-[#f3cc51] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
                <span className="text-[#f3cc51] font-bold">Default credentials:</span> username: <code className="text-white">admin</code> / password: <code className="text-white">admin@vj123</code> (can be customized once logged in).
              </div>

              <button
                id="btn-admin-submit-login"
                type="submit"
                disabled={isLoggingIn}
                className="w-full gold-button py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-black" />
                    <span>Login to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================= */
          /* AUTHENTICATED ADMIN DASHBOARD */
          /* ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs Navigation */}
            <div className="px-6 bg-neutral-950 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                id="tab-admin-overview"
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'border-[#f3cc51] text-[#f3cc51]'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview & Stats</span>
              </button>

              <button
                id="tab-admin-bookings"
                onClick={() => setActiveTab('bookings')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'bookings'
                    ? 'border-[#f3cc51] text-[#f3cc51]'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Bookings ({bookings.length})</span>
              </button>

              <button
                id="tab-admin-services"
                onClick={() => setActiveTab('services')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'services'
                    ? 'border-[#f3cc51] text-[#f3cc51]'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Services ({services.length})</span>
              </button>

              <button
                id="tab-admin-timings"
                onClick={() => setActiveTab('timings')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'timings'
                    ? 'border-[#f3cc51] text-[#f3cc51]'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timings & Block Slots</span>
              </button>

              <button
                id="tab-admin-settings"
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'border-[#f3cc51] text-[#f3cc51]'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Salon Details</span>
              </button>

              <button
                id="tab-admin-security"
                onClick={() => setActiveTab('security')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeTab === 'security'
                    ? 'border-[#f3cc51] text-[#f3cc51]'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Admin Login Account</span>
              </button>
            </div>

            {/* Tab Views Content */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* ===================================================== */}
              {/* TAB 1: OVERVIEW & METRICS */}
              {/* ===================================================== */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-white">
                        Salon Overview & Today's Schedule
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Live performance and appointment statistics for VJ Salon
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowWalkInModal(true)}
                        className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-4 h-4 text-black" />
                        <span>Add Walk-in Booking</span>
                      </button>
                      <button
                        onClick={loadAllAdminData}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
                        title="Refresh Stats"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stat Cards Grid (Requested metrics) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {/* Today's Appointments */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 font-semibold block">Today's Appointments</span>
                      <p className="text-2xl font-black text-white mt-1">
                        {stats.todayAppointmentsCount}
                      </p>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 font-semibold block">Upcoming Bookings</span>
                      <p className="text-2xl font-black text-[#f3cc51] mt-1">
                        {stats.upcomingAppointmentsCount}
                      </p>
                    </div>

                    {/* Today's Estimated Revenue */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-[#c69214]/40">
                      <span className="text-[11px] text-neutral-400 font-semibold block">Today's Est. Revenue</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">
                        ₹{stats.todayEstimatedRevenue}
                      </p>
                    </div>

                    {/* Total Bookings */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                      <span className="text-[11px] text-neutral-400 font-semibold block">Total All-Time Bookings</span>
                      <p className="text-2xl font-black text-white mt-1">
                        {stats.totalBookingsCount}
                      </p>
                    </div>

                    {/* Confirmed */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-emerald-500/30">
                      <span className="text-[11px] text-emerald-400 font-semibold block">Confirmed</span>
                      <p className="text-2xl font-black text-emerald-300 mt-1">{stats.confirmedCount}</p>
                    </div>

                    {/* Pending */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-amber-500/30">
                      <span className="text-[11px] text-amber-400 font-semibold block">Pending</span>
                      <p className="text-2xl font-black text-amber-300 mt-1">{stats.pendingCount}</p>
                    </div>

                    {/* Completed */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-blue-500/30">
                      <span className="text-[11px] text-blue-400 font-semibold block">Completed</span>
                      <p className="text-2xl font-black text-blue-300 mt-1">{stats.completedCount}</p>
                    </div>

                    {/* Cancelled */}
                    <div className="p-4 rounded-2xl bg-neutral-950/70 border border-red-500/30">
                      <span className="text-[11px] text-red-400 font-semibold block">Cancelled</span>
                      <p className="text-2xl font-black text-red-300 mt-1">{stats.cancelledCount}</p>
                    </div>
                  </div>

                  {/* Quick Recent Activity preview */}
                  <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">Recent Appointments</h4>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs text-[#f3cc51] hover:underline font-semibold"
                      >
                        View All Bookings &rarr;
                      </button>
                    </div>

                    <div className="divide-y divide-neutral-800/80">
                      {bookings.slice(0, 5).map((b) => (
                        <div key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{b.customerName}</span>
                              <span className="text-neutral-400">({b.mobileNumber})</span>
                              {b.isWalkIn && (
                                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">Walk-in</span>
                              )}
                            </div>
                            <p className="text-neutral-400 text-[11px] mt-0.5">
                              {b.selectedServices.map((s) => s.name).join(', ')} • ₹{b.totalAmount}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-neutral-300">
                              {b.appointmentDate} at {b.appointmentTime}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              b.bookingStatus === 'Confirmed' ? 'bg-emerald-950 text-emerald-400' :
                              b.bookingStatus === 'Completed' ? 'bg-blue-950 text-blue-400' :
                              b.bookingStatus === 'Cancelled' ? 'bg-red-950 text-red-400' : 'bg-neutral-800 text-neutral-300'
                            }`}>
                              {b.bookingStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* TAB 2: BOOKING MANAGEMENT (SEARCH, FILTER, EDIT STATUS) */}
              {/* ===================================================== */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-white">
                        All Appointments & Bookings
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Manage customer bookings, walk-ins, and attendance status.
                      </p>
                    </div>

                    <button
                      id="btn-admin-add-walkin"
                      onClick={() => setShowWalkInModal(true)}
                      className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4 text-black" />
                      <span>Create Walk-in Booking</span>
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Search query */}
                    <div className="relative">
                      <input
                        id="admin-search-bookings"
                        type="text"
                        placeholder="Search by name, mobile, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none pl-9"
                      />
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    </div>

                    {/* Date filter */}
                    <div>
                      <input
                        id="admin-filter-date"
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-2">
                      <select
                        id="admin-filter-status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>

                      {(searchQuery || filterDate || filterStatus !== 'All') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterDate('');
                            setFilterStatus('All');
                          }}
                          className="p-2 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg shrink-0"
                          title="Clear Filters"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bookings Table / Cards */}
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 bg-neutral-950/40 rounded-2xl border border-neutral-800">
                      <p className="text-sm font-semibold text-white">No bookings match the filter criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-2xl p-4 bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 transition space-y-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#f3cc51] bg-neutral-900 px-2 py-0.5 rounded border border-[#c69214]/30">
                                {booking.id}
                              </span>
                              {booking.isWalkIn && (
                                <span className="bg-neutral-800 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded">
                                  Walk-in
                                </span>
                              )}
                              <span className="text-neutral-400 text-[11px]">
                                Booked: {new Date(booking.createdDateTime).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Status selector directly actionable */}
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-400 text-[11px]">Status:</span>
                              <select
                                value={booking.bookingStatus}
                                onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                                className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border ${
                                  booking.bookingStatus === 'Confirmed' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50' :
                                  booking.bookingStatus === 'Completed' ? 'bg-blue-950 text-blue-400 border-blue-500/50' :
                                  booking.bookingStatus === 'Cancelled' ? 'bg-red-950 text-red-400 border-red-500/50' :
                                  booking.bookingStatus === 'Pending' ? 'bg-amber-950 text-amber-400 border-amber-500/50' :
                                  'bg-neutral-800 text-neutral-300 border-neutral-700'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="No Show">No Show</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Customer</span>
                              <p className="font-bold text-white mt-0.5">{booking.customerName}</p>
                              <a href={`tel:${booking.mobileNumber}`} className="text-[#f3cc51] hover:underline font-mono">
                                +91 {booking.mobileNumber}
                              </a>
                            </div>

                            <div>
                              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Appointment Slot</span>
                              <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#f3cc51]" />
                                {booking.appointmentDate}
                              </p>
                              <p className="text-neutral-300 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-[#f3cc51]" />
                                {booking.appointmentTime}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Services & Total</span>
                              <p className="font-medium text-white mt-0.5">
                                {booking.selectedServices.map((s) => s.name).join(', ')}
                              </p>
                              <p className="text-[#f3cc51] font-black text-sm mt-0.5">
                                ₹{booking.totalAmount}
                              </p>
                            </div>

                            <div className="flex items-end justify-end gap-2">
                              {/* Direct WhatsApp client */}
                              <a
                                href={`https://wa.me/91${booking.mobileNumber}?text=${encodeURIComponent(
                                  `Hello ${booking.customerName}, this is VJ Salon regarding your booking ${booking.id} on ${booking.appointmentDate} at ${booking.appointmentTime}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/80"
                                title="WhatsApp Customer"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              {/* Call Customer */}
                              <a
                                href={`tel:${booking.mobileNumber}`}
                                className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white"
                                title="Call Customer"
                              >
                                <Phone className="w-4 h-4" />
                              </a>

                              {/* Delete booking */}
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {booking.customerMessage && (
                            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-[11px] text-neutral-300">
                              <span className="text-neutral-500 font-semibold">Note:</span> {booking.customerMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===================================================== */}
              {/* TAB 3: SERVICE MANAGEMENT (ADD / EDIT / PRICING) */}
              {/* ===================================================== */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-white">
                        Services & Menu Management
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Add, edit prices, durations, or temporarily enable/disable services.
                      </p>
                    </div>

                    <button
                      id="btn-admin-add-service"
                      onClick={() => {
                        setEditingService({
                          name: '',
                          price: 100,
                          duration: 30,
                          category: 'Hair & Styling',
                          description: '',
                          active: true,
                          popular: false,
                        });
                        setIsNewService(true);
                      }}
                      className="gold-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4 text-black" />
                      <span>Add New Service</span>
                    </button>
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
                          srv.active
                            ? 'bg-neutral-950/70 border-neutral-800'
                            : 'bg-neutral-950/30 border-neutral-800 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-serif-luxury text-sm font-bold text-white">
                              {srv.name}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              srv.active ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                              {srv.active ? 'Active' : 'Disabled'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
                            <span className="text-[#f3cc51] font-extrabold text-base">₹{srv.price}</span>
                            <span>•</span>
                            <span>{srv.duration} mins</span>
                            <span>•</span>
                            <span className="text-neutral-500">{srv.category}</span>
                          </div>

                          {srv.description && (
                            <p className="text-neutral-400 text-[11px] line-clamp-2 mb-3">
                              {srv.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleServiceActive(srv)}
                            className="text-[11px] font-semibold text-neutral-400 hover:text-white"
                          >
                            {srv.active ? 'Disable' : 'Enable'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingService(srv);
                                setIsNewService(false);
                              }}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[#f3cc51]"
                              title="Edit Service"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv.id, srv.name)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-red-400"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* TAB 4: TIMINGS & BLOCKED SLOTS */}
              {/* ===================================================== */}
              {activeTab === 'timings' && salonSettings && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-white">
                      Time Management & Slot Duration
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Configure daily salon timings, slot interval duration, or block holidays / specific time periods.
                    </p>
                  </div>

                  {/* Daily Timing Controls */}
                  <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                    <h4 className="text-xs font-bold text-[#f3cc51] uppercase tracking-wider">
                      Daily Operating Hours & Slot Size
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Opening Time (24h)
                        </label>
                        <input
                          id="input-opening-time"
                          type="time"
                          value={salonSettings.openingTime}
                          onChange={(e) => setSalonSettings({ ...salonSettings, openingTime: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Closing Time (24h)
                        </label>
                        <input
                          id="input-closing-time"
                          type="time"
                          value={salonSettings.closingTime}
                          onChange={(e) => setSalonSettings({ ...salonSettings, closingTime: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Slot Duration
                        </label>
                        <select
                          id="select-slot-duration"
                          value={salonSettings.slotDuration}
                          onChange={(e) => setSalonSettings({ ...salonSettings, slotDuration: Number(e.target.value) })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value={15}>15 Minutes</option>
                          <option value={20}>20 Minutes</option>
                          <option value={30}>30 Minutes (Standard)</option>
                          <option value={45}>45 Minutes</option>
                          <option value={60}>60 Minutes</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="gold-button px-5 py-2 rounded-xl text-xs font-bold shadow"
                      >
                        Save Salon Timings
                      </button>
                    </div>
                  </form>

                  {/* Block Specific Date or Time Slot (Requested in prompt) */}
                  <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-[#f3cc51] uppercase tracking-wider">
                        Block Date or Specific Time Slot
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        E.g. Sunday closed, or 15 September 2026 from 2 PM to 4 PM unavailable.
                      </p>
                    </div>

                    <form onSubmit={handleAddBlock} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-neutral-400 mb-1">Date or Day Name</label>
                        <input
                          type="text"
                          required
                          placeholder="2026-09-15 or Sunday"
                          value={blockDate}
                          onChange={(e) => setBlockDate(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">Start Time (Optional)</label>
                        <input
                          type="time"
                          value={blockStartTime}
                          onChange={(e) => setBlockStartTime(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">End Time (Optional)</label>
                        <input
                          type="time"
                          value={blockEndTime}
                          onChange={(e) => setBlockEndTime(e.target.value)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1">Reason</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Maintenance / Lunch"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-neutral-800 hover:bg-neutral-700 text-[#f3cc51] border border-[#c69214]/50 px-3 py-2 rounded-xl font-bold shrink-0"
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Blocked periods list */}
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-neutral-400 mb-2">
                        Currently Blocked Dates & Slots ({blockedPeriods.length})
                      </p>
                      {blockedPeriods.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic">No blocked slots right now.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {blockedPeriods.map((bp) => (
                            <div
                              key={bp.id}
                              className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-white block">{bp.date}</span>
                                <span className="text-[11px] text-[#f3cc51]">
                                  {bp.startTime && bp.startTime !== 'ALL_DAY'
                                    ? `${bp.startTime} to ${bp.endTime || 'End'}`
                                    : 'Full Day Closed'}
                                </span>
                                <p className="text-[10px] text-neutral-400">{bp.reason}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteBlock(bp.id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 bg-neutral-800"
                                title="Unblock"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* TAB 5: SALON DETAILS & SETTINGS */}
              {/* ===================================================== */}
              {activeTab === 'settings' && salonSettings && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-white">
                      Salon Profile & Public Information
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Edit salon name, address, phone numbers, WhatsApp, and Google Maps URL.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Salon Name</label>
                        <input
                          type="text"
                          value={salonSettings.name}
                          onChange={(e) => setSalonSettings({ ...salonSettings, name: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Tagline</label>
                        <input
                          type="text"
                          value={salonSettings.tagline}
                          onChange={(e) => setSalonSettings({ ...salonSettings, tagline: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-neutral-300 font-semibold mb-1">Full Salon Address</label>
                        <input
                          type="text"
                          value={salonSettings.address}
                          onChange={(e) => setSalonSettings({ ...salonSettings, address: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Primary Phone Number</label>
                        <input
                          type="text"
                          value={salonSettings.phone}
                          onChange={(e) => setSalonSettings({ ...salonSettings, phone: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Additional Phone</label>
                        <input
                          type="text"
                          value={salonSettings.additionalPhone}
                          onChange={(e) => setSalonSettings({ ...salonSettings, additionalPhone: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">WhatsApp Number (For booking alerts)</label>
                        <input
                          type="text"
                          value={salonSettings.whatsapp}
                          onChange={(e) => setSalonSettings({ ...salonSettings, whatsapp: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Google Maps Direct URL</label>
                        <input
                          type="url"
                          value={salonSettings.googleMapsUrl}
                          onChange={(e) => setSalonSettings({ ...salonSettings, googleMapsUrl: e.target.value })}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="gold-button px-6 py-2.5 rounded-xl font-bold shadow"
                      >
                        Save Salon Details
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ===================================================== */}
              {/* TAB 6: ADMIN LOGIN CREDENTIALS */}
              {/* ===================================================== */}
              {activeTab === 'security' && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-white">
                      Admin Login Credentials
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Update your administrator username or password securely.
                    </p>
                  </div>

                  <form onSubmit={handleChangeCredentialsSubmit} className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-4 text-xs">
                    <div>
                      <span className="text-neutral-400">Current Logged in Username:</span>
                      <strong className="text-white ml-2">{adminUsername}</strong>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">
                        New Username (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave blank to keep unchanged"
                        value={newAdminUser}
                        onChange={(e) => setNewAdminUser(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">
                        New Password (Optional, min 6 characters)
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="gold-button px-5 py-2.5 rounded-xl font-bold shadow"
                    >
                      Update Admin Password / Username
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: WALK-IN BOOKING CREATION */}
        {/* ========================================================= */}
        {showWalkInModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-[#c69214]/60 p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h4 className="font-serif-luxury text-base font-bold text-white">Create Walk-in Booking</h4>
                <button onClick={() => setShowWalkInModal(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWalkIn} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="7000211850"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Select Services *</label>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-neutral-800 p-2 rounded-xl">
                    {services.map((s) => {
                      const isChecked = walkInServiceIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setWalkInServiceIds(
                              isChecked
                                ? walkInServiceIds.filter((id) => id !== s.id)
                                : [...walkInServiceIds, s.id]
                            );
                          }}
                          className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                            isChecked ? 'bg-[#c69214]/20 text-[#f3cc51]' : 'hover:bg-neutral-800'
                          }`}
                        >
                          <span>{s.name}</span>
                          <span className="font-bold">₹{s.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-neutral-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={walkInDate}
                      onChange={(e) => setWalkInDate(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 02:30 PM"
                      value={walkInTime}
                      onChange={(e) => setWalkInTime(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWalkInModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gold-button px-5 py-2 rounded-xl font-bold"
                  >
                    Confirm Walk-in
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD / EDIT SERVICE */}
        {/* ========================================================= */}
        {editingService && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-[#c69214]/60 p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h4 className="font-serif-luxury text-base font-bold text-white">
                  {isNewService ? 'Add New Service' : `Edit "${editingService.name}"`}
                </h4>
                <button onClick={() => setEditingService(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingService.price ?? ''}
                      onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1">Duration (Mins) *</label>
                    <input
                      type="number"
                      required
                      min={5}
                      step={5}
                      value={editingService.duration ?? ''}
                      onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Hair & Styling, Beard & Shave, Face & Skin"
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.active !== false}
                      onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                      className="rounded accent-[#c69214]"
                    />
                    <span>Active in Menu</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingService.popular}
                      onChange={(e) => setEditingService({ ...editingService, popular: e.target.checked })}
                      className="rounded accent-[#c69214]"
                    />
                    <span>Popular Highlight</span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gold-button px-5 py-2 rounded-xl font-bold"
                  >
                    Save Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
