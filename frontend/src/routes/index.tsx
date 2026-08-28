import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Landing } from './Landing';
import { Login } from './Login';
import { VoiceQuery } from './student/VoiceQuery';
import { DoubtBoard } from './mentor/DoubtBoard';
import { CareerRoadmap } from './roadmap/CareerRoadmap';
import { AdminDashboard } from './admin/AdminDashboard';
import { ProtectedRoute } from './AuthGuard';
import { Forbidden } from './Forbidden';
import { DashboardRedirect } from './DashboardRedirect';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/roadmap" element={<CareerRoadmap />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Central Dynamic Role Resolver */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Student Protected Routes (CUJ 1) */}
        <Route
          path="/student/voice-query"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <VoiceQuery />
            </ProtectedRoute>
          }
        />
        <Route path="/student" element={<Navigate to="/student/voice-query" replace />} />

        {/* Mentor Protected Routes (CUJ 3) */}
        <Route
          path="/mentor/doubt-board"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
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
  );
};
