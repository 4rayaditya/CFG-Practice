import React from 'react';
import { OfflineVisitLogger } from '../../components/mentors/OfflineVisitLogger';
import { INITIAL_STUDENTS } from '../../data/mockData';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const FieldVisitLogger: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-4">
      <OfflineVisitLogger
        assignedStudents={INITIAL_STUDENTS}
        currentUser={user}
        onVisitLogged={() => {
          navigate('/mentor/doubt-board');
        }}
        onClose={() => {
          navigate('/mentor/doubt-board');
        }}
      />
    </div>
  );
};

export default FieldVisitLogger;
