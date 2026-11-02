import React, { createContext, useContext, useState, useEffect } from 'react';
import initialCompany from '../data/company.json';
import initialEmployees from '../data/employees.json';
import initialSubscriptions from '../data/subscriptions.json';
import initialAssignments from '../data/assignments.json';
import initialUsage from '../data/usage.json';
import initialRecommendations from '../data/recommendations.json';
import initialNotifications from '../data/notifications.json';
import initialOffboarding from '../data/offboarding.json';
import { getMonthlyCost, getDaysRemaining, getDaysInactive } from '../utils/helpers';

const STORAGE_KEY = 'saasguard_storage_v1';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Load initial state from localStorage or seed JSON
  const [dataLoaded, setDataLoaded] = useState(false);
  const [company, setCompany] = useState(initialCompany);
  const [employees, setEmployees] = useState(initialEmployees);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [usage, setUsage] = useState(initialUsage);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [offboarding, setOffboarding] = useState(initialOffboarding);

  // Inactivity threshold state (30, 45, 60 days)
  const [inactivityThreshold, setInactivityThreshold] = useState(company.inactivityThresholdDays || 30);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.company) setCompany(parsed.company);
        if (parsed.employees) setEmployees(parsed.employees);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.assignments) setAssignments(parsed.assignments);
        if (parsed.usage) setUsage(parsed.usage);
        if (parsed.recommendations) setRecommendations(parsed.recommendations);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.offboarding) setOffboarding(parsed.offboarding);
        if (parsed.inactivityThreshold) setInactivityThreshold(parsed.inactivityThreshold);
      }
    } catch (e) {
      console.error('Failed to load SaaSGuard data from localStorage:', e);
    } finally {
      setDataLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        company,
        employees,
        subscriptions,
        assignments,
        usage,
        recommendations,
        notifications,
        offboarding,
        inactivityThreshold,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to persist SaaSGuard state to localStorage:', e);
    }
  }, [
    company,
    employees,
    subscriptions,
    assignments,
    usage,
    recommendations,
    notifications,
    offboarding,
    inactivityThreshold,
    dataLoaded,
  ]);

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompany(initialCompany);
    setEmployees(initialEmployees);
    setSubscriptions(initialSubscriptions);
    setAssignments(initialAssignments);
    setUsage(initialUsage);
    setRecommendations(initialRecommendations);
    setNotifications(initialNotifications);
    setOffboarding(initialOffboarding);
    setInactivityThreshold(initialCompany.inactivityThresholdDays || 30);
  };

  // ---------------- Subscriptions Operations ----------------
  const addSubscription = (newSub) => {
    const item = {
      ...newSub,
      id: newSub.id || `sub-${Date.now()}`,
      assignedLicences: parseInt(newSub.assignedLicences, 10) || 0,
      totalLicences: parseInt(newSub.totalLicences, 10) || 1,
      cost: parseFloat(newSub.cost) || 0,
      status: newSub.status || 'Active',
    };
    setSubscriptions((prev) => [item, ...prev]);

    // Add notification
    addNotification({
      type: 'general',
      title: 'New Subscription Added',
      message: `${item.applicationName} was added to subscription inventory.`,
      actionUrl: '/subscriptions',
    });
  };

  const updateSubscription = (id, updatedFields) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              ...updatedFields,
              cost: updatedFields.cost !== undefined ? parseFloat(updatedFields.cost) : sub.cost,
              totalLicences:
                updatedFields.totalLicences !== undefined
                  ? parseInt(updatedFields.totalLicences, 10)
                  : sub.totalLicences,
              assignedLicences:
                updatedFields.assignedLicences !== undefined
                  ? parseInt(updatedFields.assignedLicences, 10)
                  : sub.assignedLicences,
            }
          : sub
      )
    );
  };

  const deleteSubscription = (id) => {
    const sub = subscriptions.find((s) => s.id === id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    // Remove related assignments
    setAssignments((prev) => prev.filter((a) => a.subscriptionId !== id));
    // Remove related usage
    setUsage((prev) => prev.filter((u) => u.subscriptionId !== id));

    if (sub) {
      addNotification({
        type: 'general',
        title: 'Subscription Deleted',
        message: `${sub.applicationName} was removed from the inventory.`,
        actionUrl: '/subscriptions',
      });
    }
  };

  const importSubscriptions = (importedList) => {
    if (!Array.isArray(importedList) || importedList.length === 0) return;
    setSubscriptions((prev) => [...importedList, ...prev]);
    addNotification({
      type: 'general',
      title: 'CSV Import Completed',
      message: `Successfully imported ${importedList.length} subscriptions.`,
      actionUrl: '/subscriptions',
    });
  };

  // ---------------- Employees Operations ----------------
  const addEmployee = (newEmp) => {
    const item = {
      ...newEmp,
      id: newEmp.id || `emp-${Date.now()}`,
      status: newEmp.status || 'Active',
      joiningDate: newEmp.joiningDate || new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [item, ...prev]);
  };

  const updateEmployee = (id, updatedFields) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updatedFields } : emp))
    );
  };

  const deleteEmployee = (id) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    // Remove assignments
    setAssignments((prev) => prev.filter((a) => a.employeeId !== id));
    // Remove usage
    setUsage((prev) => prev.filter((u) => u.employeeId !== id));

    if (emp) {
      addNotification({
        type: 'general',
        title: 'Employee Removed',
        message: `${emp.name} was removed from employee records.`,
        actionUrl: '/employees',
      });
    }
  };

  // ---------------- Assignments Operations ----------------
  const assignApplication = (employeeId, subscriptionId, role = 'Member', accessLevel = 'Member') => {
    // Prevent duplicate assignment
    const exists = assignments.some(
      (a) => a.employeeId === employeeId && a.subscriptionId === subscriptionId
    );
    if (exists) {
      return { success: false, message: 'This application is already assigned to this employee.' };
    }

    const sub = subscriptions.find((s) => s.id === subscriptionId);
    if (sub && sub.assignedLicences >= sub.totalLicences) {
      // Still allow or warn, but let's update subscription count
    }

    const newAssignment = {
      id: `asg-${Date.now()}`,
      employeeId,
      subscriptionId,
      assignedDate: new Date().toISOString().split('T')[0],
      role,
      accessLevel,
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Also update assignedLicences count on subscription
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subscriptionId
          ? { ...s, assignedLicences: s.assignedLicences + 1 }
          : s
      )
    );

    // Add baseline usage record
    const usageExists = usage.some(
      (u) => u.employeeId === employeeId && u.subscriptionId === subscriptionId
    );
    if (!usageExists) {
      setUsage((prev) => [
        {
          id: `use-${Date.now()}`,
          employeeId,
          subscriptionId,
          lastActive: new Date().toISOString().split('T')[0],
          loginCount30d: 1,
        },
        ...prev,
      ]);
    }

    return { success: true };
  };

  const removeAssignment = (assignmentId) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));

    // Decrement assignedLicences on subscription
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === assignment.subscriptionId
          ? { ...s, assignedLicences: Math.max(0, s.assignedLicences - 1) }
          : s
      )
    );

    // Clean up usage record
    setUsage((prev) =>
      prev.filter(
        (u) =>
          !(
            u.employeeId === assignment.employeeId &&
            u.subscriptionId === assignment.subscriptionId
          )
      )
    );
  };

  // ---------------- Usage Operations ----------------
  const updateInactivityThreshold = (days) => {
    setInactivityThreshold(days);
    setCompany((prev) => ({ ...prev, inactivityThresholdDays: days }));
  };

  // ---------------- Recommendations Operations ----------------
  const updateRecommendationStatus = (id, newStatus) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
  };

  // ---------------- Offboarding Operations ----------------
  const startOffboarding = (employeeId, targetDate, notes = '') => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return { success: false, message: 'Employee not found.' };

    // Check if employee already has an active offboarding
    const existing = offboarding.find(
      (o) => o.employeeId === employeeId && o.status === 'In Progress'
    );
    if (existing) {
      return { success: false, message: 'An active offboarding case is already open for this employee.' };
    }

    // Retrieve their assigned applications
    const empAssignments = assignments.filter((a) => a.employeeId === employeeId);
    const assignedSubIds = empAssignments.map((a) => a.subscriptionId);
    const assignedSubs = subscriptions.filter((s) => assignedSubIds.includes(s.id));

    // Generate tasks checklist
    const tasks = assignedSubs.map((sub, idx) => ({
      id: `task-off-${Date.now()}-${idx}`,
      subscriptionId: sub.id,
      applicationName: sub.applicationName,
      actionRequired: `Revoke ${sub.applicationName} user seat, terminate OAuth tokens and reassign assets.`,
      status: 'Pending',
      completedAt: null,
      completedBy: null,
    }));

    const newOffboarding = {
      id: `off-${Date.now()}`,
      employeeId,
      employeeName: emp.name,
      department: emp.department,
      designation: emp.designation,
      initiator: company.primaryAdmin || 'Sarah Chen',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: tasks.length === 0 ? 'Completed' : 'In Progress',
      notes: notes || `Standard departure workflow initiated for ${emp.name}.`,
      tasks,
    };

    setOffboarding((prev) => [newOffboarding, ...prev]);

    // Update employee status to 'Offboarding'
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, status: 'Offboarding' } : e))
    );

    // Create notification
    addNotification({
      type: 'offboarding',
      title: `Offboarding Initiated: ${emp.name}`,
      message: `${tasks.length} application access revocations queued for ${emp.name}.`,
      actionUrl: '/offboarding',
    });

    return { success: true, offboardingId: newOffboarding.id };
  };

  const toggleOffboardingTask = (offboardingId, taskId, completedBy = 'Sarah Chen') => {
    setOffboarding((prev) =>
      prev.map((record) => {
        if (record.id !== offboardingId) return record;

        const updatedTasks = record.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const isPending = task.status === 'Pending';
          return {
            ...task,
            status: isPending ? 'Completed' : 'Pending',
            completedAt: isPending ? new Date().toISOString() : null,
            completedBy: isPending ? completedBy : null,
          };
        });

        // Check if all tasks are completed
        const allCompleted = updatedTasks.every((t) => t.status === 'Completed');
        const newStatus = allCompleted ? 'Completed' : 'In Progress';

        return {
          ...record,
          tasks: updatedTasks,
          status: newStatus,
        };
      })
    );
  };

  const completeOffboardingWorkflow = (offboardingId) => {
    const record = offboarding.find((o) => o.id === offboardingId);
    if (!record) return;

    // Check if all tasks completed
    const pendingTasks = record.tasks.filter((t) => t.status === 'Pending');
    if (pendingTasks.length > 0) {
      return {
        success: false,
        message: `Cannot mark completed: ${pendingTasks.length} revocation task(s) still pending.`,
      };
    }

    setOffboarding((prev) =>
      prev.map((o) => (o.id === offboardingId ? { ...o, status: 'Completed' } : o))
    );

    // Set employee status to Inactive
    setEmployees((prev) =>
      prev.map((e) => (e.id === record.employeeId ? { ...e, status: 'Inactive' } : e))
    );

    // Remove assignments now that offboarding is finished
    setAssignments((prev) => prev.filter((a) => a.employeeId !== record.employeeId));

    addNotification({
      type: 'offboarding',
      title: `Offboarding Completed: ${record.employeeName}`,
      message: `All access revocations verified and ${record.employeeName} moved to Inactive.`,
      actionUrl: '/offboarding',
    });

    return { success: true };
  };

  // ---------------- Notifications Operations ----------------
  const addNotification = ({ type, title, message, actionUrl }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: type || 'general',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: actionUrl || '/notifications',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ---------------- Computed Metrics ----------------
  const totalApplications = subscriptions.length;

  const monthlySaaSSpending = subscriptions.reduce((acc, sub) => {
    return acc + getMonthlyCost(sub);
  }, 0);

  const annualSaaSSpending = monthlySaaSSpending * 12;

  const activeEmployees = employees.filter((e) => e.status === 'Active').length;

  const totalLicences = subscriptions.reduce((acc, sub) => acc + (sub.totalLicences || 0), 0);

  const totalAssignedLicences = assignments.length;

  const unusedLicences = Math.max(0, totalLicences - totalAssignedLicences);

  // Potentially unused licences based on inactivity threshold
  const potentiallyUnusedLicences = usage
    .map((u) => {
      const days = getDaysInactive(u.lastActive);
      const emp = employees.find((e) => e.id === u.employeeId);
      const sub = subscriptions.find((s) => s.id === u.subscriptionId);
      return {
        ...u,
        daysInactive: days,
        employee: emp,
        subscription: sub,
        isInactive: days >= inactivityThreshold,
      };
    })
    .filter((u) => u.isInactive && u.employee && u.subscription);

  // Upcoming renewals (within 30 days)
  const upcomingRenewals = subscriptions
    .map((sub) => ({
      ...sub,
      daysRemaining: getDaysRemaining(sub.renewalDate),
    }))
    .filter((sub) => sub.daysRemaining >= 0 && sub.daysRemaining <= 30)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Pending offboarding count
  const pendingOffboardingCount = offboarding.filter((o) => o.status === 'In Progress').length;

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Estimated savings from active recommendations
  const totalEstimatedMonthlySavings = recommendations
    .filter((r) => r.status === 'Active' || r.status === 'Accepted')
    .reduce((acc, r) => acc + (parseFloat(r.estimatedSavings) || 0), 0);

  return (
    <DataContext.Provider
      value={{
        // Data
        company,
        setCompany,
        employees,
        subscriptions,
        assignments,
        usage,
        recommendations,
        notifications,
        offboarding,
        inactivityThreshold,
        updateInactivityThreshold,

        // Subscriptions CRUD
        addSubscription,
        updateSubscription,
        deleteSubscription,
        importSubscriptions,

        // Employees CRUD
        addEmployee,
        updateEmployee,
        deleteEmployee,

        // Assignments CRUD
        assignApplication,
        removeAssignment,

        // Recommendations
        updateRecommendationStatus,

        // Offboarding
        startOffboarding,
        toggleOffboardingTask,
        completeOffboardingWorkflow,

        // Notifications
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        // Settings
        resetDemoData,

        // Computed metrics
        metrics: {
          totalApplications,
          monthlySaaSSpending,
          annualSaaSSpending,
          activeEmployees,
          totalEmployees: employees.length,
          totalLicences,
          totalAssignedLicences,
          unusedLicences,
          potentiallyUnusedLicences,
          upcomingRenewals,
          pendingOffboardingCount,
          unreadNotificationsCount,
          totalEstimatedMonthlySavings,
        },
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
