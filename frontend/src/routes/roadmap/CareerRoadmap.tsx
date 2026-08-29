import React, { useState, useEffect } from 'react';
import { RoadmapTree, RoadmapData } from '../../components/roadmap/RoadmapTree';
import { api } from '../../services/api';

export const CareerRoadmap: React.FC = () => {
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load existing student roadmaps from backend on mount
  useEffect(() => {
    const fetchExistingRoadmaps = async () => {
      try {
        const savedList = await api.getStudentRoadmaps();
        if (savedList && savedList.length > 0) {
          const latest: any = savedList[0];
          const mapped: RoadmapData = {
            track_title: latest.track_title || 'Personalized Career Pathway',
            summary: latest.summary || 'Custom career track curriculum.',
            total_estimated_hours: latest.total_estimated_hours || 120,
            skill_level: latest.skill_level || 'Intermediate',
            target_timeline: latest.target_timeline || '3 months',
            milestones: (latest.milestones || []).map((m: any, idx: number) => ({
              id: m.step_number || (idx + 1),
              title: m.title,
              description: m.description,
              estimated_hours: m.estimated_hours,
              subtasks: m.subtasks || [],
              resources: m.resources || [],
              checkpoint_project: m.checkpoint_project || 'Milestone project checkpoint',
              key_skills: m.key_skills || [],
            }))
          };
          setCurrentRoadmap(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch saved roadmaps from backend, using default interactive template:', err);
      }
    };

    fetchExistingRoadmaps();
  }, []);

  const handleGenerateNewRoadmap = async (goal: string, skillLevel: string, timeline: string) => {
    setIsGenerating(true);
    try {
      const res = await api.generateRoadmap({
        student_goal: goal,
        current_skill_level: skillLevel,
        target_timeline: timeline,
      });

      if (res.success && res.roadmap) {
        setCurrentRoadmap(res.roadmap);

        // Auto-save to Supabase
        try {
          await api.saveRoadmap({
            student_goal: goal,
            roadmap: res.roadmap,
          });
        } catch (saveErr) {
          console.warn('Auto-save to Supabase skipped in offline mode:', saveErr);
        }
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <RoadmapTree
        initialRoadmap={currentRoadmap}
        onGenerateNewRoadmap={handleGenerateNewRoadmap}
        isGenerating={isGenerating}
      />
    </div>
  );
};
