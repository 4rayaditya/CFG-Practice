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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/roadmap" element={<CareerRoadmap />} />

        {/* Student Protected Routes (CUJ 1: Voice Question Intake) */}
        <Route
          path="/student/voice-query"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <VoiceQuery />
            </ProtectedRoute>
          }
        />

        {/* Mentor Protected Routes (CUJ 3: Volunteer Doubt Board) */}
        <Route
          path="/mentor/doubt-board"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
              <DoubtBoard />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes (Director Analytics Dashboard) */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
