import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Forbidden } from './Forbidden';
import { DashboardRedirect } from './DashboardRedirect';
import { Loader2 } from 'lucide-react';

// Route-level Code Splitting via React.lazy() for Heavy Components
export const Landing = lazy(() => import('./Landing').then((m) => ({ default: m.Landing })));
export const Login = lazy(() => import('./Login').then((m) => ({ default: m.Login })));
export const VoiceQuery = lazy(() => import('./student/VoiceQuery').then((m) => ({ default: m.VoiceQuery })));
export const DoubtBoard = lazy(() => import('./mentor/DoubtBoard').then((m) => ({ default: m.DoubtBoard })));
export const CareerRoadmap = lazy(() => import('./roadmap/CareerRoadmap').then((m) => ({ default: m.CareerRoadmap })));
export const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
export const MentorDiscovery = lazy(() => import('./mentor/MentorDiscovery').then((m) => ({ default: m.MentorDiscovery })));
export const StudentProgressTracker = lazy(() => import('../components/student/StudentProgressTracker').then((m) => ({ default: m.StudentProgressTracker })));

export const RouteLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider animate-pulse">
      Loading page...
    </p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/roadmap" element={<CareerRoadmap />} />
          <Route path="/mentors" element={<MentorDiscovery />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Central Dynamic Role Resolver */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/voice-query"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <VoiceQuery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProgressTracker />
              </ProtectedRoute>
            }
          />
          <Route path="/student" element={<Navigate to="/student/voice-query" replace />} />

          {/* Mentor Protected Routes */}
          <Route
            path="/mentor/doubt-board"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <DoubtBoard />
              </ProtectedRoute>
            }
          />
          <Route path="/mentor" element={<Navigate to="/mentor/doubt-board" replace />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
