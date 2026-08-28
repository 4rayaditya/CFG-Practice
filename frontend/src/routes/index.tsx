import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Landing } from './Landing';
import { Login } from './Login';
import { VoiceQuery } from './student/VoiceQuery';
import { DoubtBoard } from './mentor/DoubtBoard';
import { CareerRoadmap } from './roadmap/CareerRoadmap';
import { AdminDashboard } from './admin/AdminDashboard';
import { AuthGuard } from './AuthGuard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/roadmap" element={<CareerRoadmap />} />

        {/* Student Protected Routes (CUJ 1) */}
        <Route
          path="/student/voice-query"
          element={
            <AuthGuard allowedRoles={['student', 'admin']}>
              <VoiceQuery />
            </AuthGuard>
          }
        />

        {/* Mentor Protected Routes (CUJ 3) */}
        <Route
          path="/mentor/doubt-board"
          element={
            <AuthGuard allowedRoles={['mentor', 'admin']}>
              <DoubtBoard />
            </AuthGuard>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/analytics"
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </AuthGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
