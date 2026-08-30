import type { 
  StudentDossier, 
  MentorProfile, 
  OfflineHomeVisit, 
  MentorshipRequest, 
  Doubt, 
  User 
} from '../types';
import { evaluateStudentPriority } from '../utils/studentPriorityEngine';

// -----------------------------------------------------------------------------
// 1. Initial 5 Mentors with Academic Specializations
// -----------------------------------------------------------------------------

export const INITIAL_MENTORS: MentorProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    headline: 'Senior Physics & Chemistry Teacher',
    bio: '12+ years helping high school students build confidence in Physics, Chemistry, and lab sciences.',
    organization: 'High School Academic Mentorship',
    expertiseTags: ['Physics', 'Chemistry', 'Kinematics', 'Lab Safety', 'Study Skills'],
    rating: 4.98,
    resolvedCount: 48,
    assignedStudentIds: ['stu-001', 'stu-002', 'stu-003'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    slaStatus: {
      isInactiveOver10Days: false,
      daysSinceLastActive: 0,
      noDoubtSolvedIn5Days: false,
      daysSinceLastDoubtResolved: 1,
      noOfflineVisitIn30Days: false,
      daysSinceLastOfflineVisit: 12,
      hasAnySlaBreach: false,
    },
    isAvailable: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    headline: 'Algebra & Calculus Educator',
    bio: 'Passionate about nurturing high school students in Mathematics, Calculus, and problem-solving.',
    organization: 'STEM Student Guidance Network',
    expertiseTags: ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Exam Prep'],
    rating: 5.00,
    resolvedCount: 54,
    assignedStudentIds: ['stu-004', 'stu-005', 'stu-006'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    slaStatus: {
      isInactiveOver10Days: false,
      daysSinceLastActive: 0,
      noDoubtSolvedIn5Days: false,
      daysSinceLastDoubtResolved: 0,
      noOfflineVisitIn30Days: false,
      daysSinceLastOfflineVisit: 4,
      hasAnySlaBreach: false,
    },
    isAvailable: true,
    createdAt: '2026-01-12T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    fullName: 'Marcus Chen',
    email: 'marcus.chen@shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    headline: 'Chemistry & Environmental Science Teacher',
    bio: 'Specializes in chemical equations, stoichiometry, and environmental science learning.',
    organization: 'High School Academic Mentorship',
    expertiseTags: ['Chemistry', 'Biology', 'Redox Reactions', 'Lab Safety', 'Science Projects'],
    rating: 4.85,
    resolvedCount: 25,
    assignedStudentIds: ['stu-007', 'stu-008', 'stu-009'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    slaStatus: {
      isInactiveOver10Days: true,
      daysSinceLastActive: 14,
      noDoubtSolvedIn5Days: true,
      daysSinceLastDoubtResolved: 16,
      noOfflineVisitIn30Days: false,
      daysSinceLastOfflineVisit: 18,
      hasAnySlaBreach: true,
    },
    isAvailable: false,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    headline: 'Senior Geometry & Mathematics Teacher',
    bio: 'Coaching secondary school students through geometry proofs, algebra, and exam preparation.',
    organization: 'Academic Excellence Network',
    expertiseTags: ['Geometry', 'Algebra', 'Trigonometry', 'Proof Techniques', 'Exam Prep'],
    rating: 4.90,
    resolvedCount: 31,
    assignedStudentIds: ['stu-010', 'stu-011', 'stu-012'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    slaStatus: {
      isInactiveOver10Days: false,
      daysSinceLastActive: 0,
      noDoubtSolvedIn5Days: true,
      daysSinceLastDoubtResolved: 8,
      noOfflineVisitIn30Days: false,
      daysSinceLastOfflineVisit: 15,
      hasAnySlaBreach: true,
    },
    isAvailable: true,
    createdAt: '2026-01-18T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    fullName: 'Alex Rivera',
    email: 'alex.rivera@shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    headline: 'World History & English Literature Educator',
    bio: 'Guiding students in analytical essay writing, historical analysis, and literature comprehension.',
    organization: 'High School Humanities Circle',
    expertiseTags: ['World History', 'Literature', 'Essay Writing', 'Reading Comprehension', 'Social Studies'],
    rating: 4.92,
    resolvedCount: 38,
    assignedStudentIds: ['stu-013', 'stu-014', 'stu-015'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
    slaStatus: {
      isInactiveOver10Days: false,
      daysSinceLastActive: 0,
      noDoubtSolvedIn5Days: false,
      daysSinceLastDoubtResolved: 2,
      noOfflineVisitIn30Days: true,
      daysSinceLastOfflineVisit: 42,
      hasAnySlaBreach: true,
    },
    isAvailable: true,
    createdAt: '2026-01-20T08:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// 2. Initial 15 High School Students
// -----------------------------------------------------------------------------

export const INITIAL_STUDENTS: StudentDossier[] = [
  {
    id: 'stu-001',
    name: 'Rahul Kumar',
    email: 'rahul.k@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 10 (Secondary Boards)',
    age: 15,
    schoolOrCollege: 'Prerna High School',
    dreamCareer: 'Physics Researcher & Engineer',
    trackTitle: 'Physics & Secondary Algebra Foundations',
    attendanceRate: 68,
    academicScore: 61,
    learningInterests: ['Physics', 'Chemistry', 'Algebra', 'Lab Experiments'],
    skillsMastered: ['Kinematics Basics', 'Atomic Structure', 'Linear Equations'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000001',
    assignedMentorName: 'Dr. Sarah Jenkins',
    assignedMentorEmail: 'sarah.jenkins@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    doubtsCount: 6,
    unresolvedDoubtsCount: 3,
    urgentFlag: true,
    specialNotes: 'Family has single room with limited study light. Rahul needs encouragement and quiet study schedule guidance.',
    homeVisits: [
      {
        id: 'visit-001',
        studentId: 'stu-001',
        studentName: 'Rahul Kumar',
        mentorId: '00000000-0000-0000-0000-000000000001',
        mentorName: 'Dr. Sarah Jenkins',
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        rawSpeechTranscript: 'Visited Rahul at home. Family warm and welcoming. Provided study schedule for physics and math board exam preparation.',
        summary: 'Home visit confirmed student interest in physical sciences but needs evening study support.',
        livingEnvironment: 'Quiet study space needed in evening.',
        academicObservations: 'Grasps physics concepts well when given step-by-step guidance.',
        riskLevel: 'Medium',
        actionItems: ['Provide study guide for Grade 10 Physics', 'Tutoring for Algebra'],
        tags: ['Physics Prep', 'Study Schedule'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      }
    ],
    recentDoubts: [
      {
        id: 'd-001',
        studentId: 'stu-001',
        studentName: 'Rahul Kumar',
        title: 'I don\'t understand how to balance this redox equation',
        description: 'I am struggling to balance the half-reactions for oxidation and reduction in acidic solution.',
        category: 'Chemistry',
        status: 'pending',
        urgency: 'Urgent',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      }
    ],
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'stu-002',
    name: 'Ananya Patel',
    email: 'ananya.p@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 17,
    schoolOrCollege: 'Sarvodaya Senior High',
    dreamCareer: 'Biomedical Researcher',
    trackTitle: 'Biology & Organic Chemistry Mastery',
    attendanceRate: 94,
    academicScore: 88,
    learningInterests: ['Biology', 'Chemistry', 'Genetics', 'Environmental Science'],
    skillsMastered: ['Genetics', 'Chemical Bonding', 'Cellular Biology'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000001',
    assignedMentorName: 'Dr. Sarah Jenkins',
    assignedMentorEmail: 'sarah.jenkins@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    doubtsCount: 4,
    unresolvedDoubtsCount: 0,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'stu-003',
    name: 'Amit Verma',
    email: 'amit.v@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 9 (Early High School)',
    age: 14,
    schoolOrCollege: 'Model High School',
    dreamCareer: 'Civil Engineer',
    trackTitle: 'Foundational Geometry & Physics',
    attendanceRate: 78,
    academicScore: 72,
    learningInterests: ['Geometry', 'Physics', 'Algebra'],
    skillsMastered: ['Triangles & Angles', 'Newtonian Mechanics'],
    financialAidStatus: 'Subsidized Learning',
    assignedMentorId: '00000000-0000-0000-0000-000000000001',
    assignedMentorName: 'Dr. Sarah Jenkins',
    assignedMentorEmail: 'sarah.jenkins@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    doubtsCount: 3,
    unresolvedDoubtsCount: 1,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-02T08:00:00Z',
  },
  {
    id: 'stu-004',
    name: 'Sneha Roy',
    email: 'sneha.r@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 17,
    schoolOrCollege: 'Government Secondary School',
    dreamCareer: 'Biochemist',
    trackTitle: 'Advanced Biology & Cell Energetics',
    attendanceRate: 91,
    academicScore: 84,
    learningInterests: ['Biology', 'Chemistry', 'Genetics'],
    skillsMastered: ['Cell Structure', 'Enzyme Kinetics'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000002',
    assignedMentorName: 'Priya Sharma',
    assignedMentorEmail: 'priya.sharma@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    doubtsCount: 8,
    unresolvedDoubtsCount: 1,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-03T08:00:00Z',
  },
  {
    id: 'stu-005',
    name: 'Vikram Singh',
    email: 'vikram.s@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 11 (Senior Secondary)',
    age: 16,
    schoolOrCollege: 'Navodaya High School',
    dreamCareer: 'Applied Mathematician',
    trackTitle: 'Calculus & Physics Foundations',
    attendanceRate: 64,
    academicScore: 58,
    learningInterests: ['Calculus', 'Algebra', 'Physics'],
    skillsMastered: ['Linear Equations', 'Basic Limits'],
    financialAidStatus: 'Hardware/Device Grant',
    assignedMentorId: '00000000-0000-0000-0000-000000000002',
    assignedMentorName: 'Priya Sharma',
    assignedMentorEmail: 'priya.sharma@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    doubtsCount: 7,
    unresolvedDoubtsCount: 3,
    urgentFlag: true,
    specialNotes: 'Vikram needs help reviewing calculus concepts before the upcoming school evaluation.',
    homeVisits: [],
    recentDoubts: [
      {
        id: 'd-005',
        studentId: 'stu-005',
        studentName: 'Vikram Singh',
        title: 'Can someone explain the chain rule in calculus?',
        description: 'I understand basic derivatives, but I get confused when taking derivatives of composite functions like sin(x^2).',
        category: 'Algebra',
        status: 'pending',
        urgency: 'Urgent',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      }
    ],
    createdAt: '2026-02-03T08:00:00Z',
  },
  {
    id: 'stu-006',
    name: 'Pooja Nair',
    email: 'pooja.n@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 10 (Secondary Boards)',
    age: 15,
    schoolOrCollege: 'Kasturba Vidyalaya',
    dreamCareer: 'Environmental Scientist',
    trackTitle: 'Secondary Science & World History',
    attendanceRate: 88,
    academicScore: 79,
    learningInterests: ['Chemistry', 'World History', 'Biology'],
    skillsMastered: ['Periodic Table', 'Ecology'],
    financialAidStatus: 'Subsidized Learning',
    assignedMentorId: '00000000-0000-0000-0000-000000000002',
    assignedMentorName: 'Priya Sharma',
    assignedMentorEmail: 'priya.sharma@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    doubtsCount: 4,
    unresolvedDoubtsCount: 0,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-04T08:00:00Z',
  },
  {
    id: 'stu-007',
    name: 'Deepa Mehta',
    email: 'deepa.m@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 17,
    schoolOrCollege: 'Vikas Secondary School',
    dreamCareer: 'Astrophysicist',
    trackTitle: 'Kinematics & Advanced Physics',
    attendanceRate: 82,
    academicScore: 76,
    learningInterests: ['Physics', 'Kinematics', 'Trigonometry'],
    skillsMastered: ['Newton\'s Laws', 'Vectors'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000003',
    assignedMentorName: 'Marcus Chen',
    assignedMentorEmail: 'marcus.chen@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    doubtsCount: 5,
    unresolvedDoubtsCount: 2,
    urgentFlag: true,
    specialNotes: 'Deepa is preparing a physics lab report on projectile motion and needs mentor feedback.',
    homeVisits: [],
    recentDoubts: [
      {
        id: 'd-007',
        studentId: 'stu-007',
        studentName: 'Deepa Mehta',
        title: 'How do I calculate kinetic energy in a projectile motion problem?',
        description: 'I need help breaking down the vertical and horizontal velocity components to find total kinetic energy at maximum height.',
        category: 'Physics',
        status: 'pending',
        urgency: 'Urgent',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      }
    ],
    createdAt: '2026-02-04T08:00:00Z',
  },
  {
    id: 'stu-008',
    name: 'Rohit Gupta',
    email: 'rohit.g@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 11 (Senior Secondary)',
    age: 16,
    schoolOrCollege: 'National High School',
    dreamCareer: 'Chemical Engineer',
    trackTitle: 'Stoichiometry & Chemical Bonding',
    attendanceRate: 74,
    academicScore: 66,
    learningInterests: ['Chemistry', 'Physics', 'Algebra'],
    skillsMastered: ['Molar Mass', 'Boyle\'s Law'],
    financialAidStatus: 'Subsidized Learning',
    assignedMentorId: '00000000-0000-0000-0000-000000000003',
    assignedMentorName: 'Marcus Chen',
    assignedMentorEmail: 'marcus.chen@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    doubtsCount: 3,
    unresolvedDoubtsCount: 1,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'stu-009',
    name: 'Kavita Joshi',
    email: 'kavita.j@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 8 (Middle School)',
    age: 13,
    schoolOrCollege: 'Shanti Niketan School',
    dreamCareer: 'Biology Teacher',
    trackTitle: 'Middle School Life Sciences',
    attendanceRate: 89,
    academicScore: 82,
    learningInterests: ['Biology', 'Environmental Science', 'General Science'],
    skillsMastered: ['Photosynthesis', 'Plant Biology'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000003',
    assignedMentorName: 'Marcus Chen',
    assignedMentorEmail: 'marcus.chen@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    doubtsCount: 2,
    unresolvedDoubtsCount: 0,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'stu-010',
    name: 'Tarun Sharma',
    email: 'tarun.s@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 17,
    schoolOrCollege: 'Institute of Science & Math',
    dreamCareer: 'Mathematics Professor',
    trackTitle: 'Advanced Trigonometry & Geometry Proofs',
    attendanceRate: 95,
    academicScore: 92,
    learningInterests: ['Geometry', 'Trigonometry', 'Algebra'],
    skillsMastered: ['Geometric Proofs', 'Trigonometric Identities'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000004',
    assignedMentorName: 'Elena Rostova',
    assignedMentorEmail: 'elena.rostova@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    doubtsCount: 6,
    unresolvedDoubtsCount: 1,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-06T08:00:00Z',
  },
  {
    id: 'stu-011',
    name: 'Ritu Desai',
    email: 'ritu.d@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 17,
    schoolOrCollege: 'Adarsh Secondary School',
    dreamCareer: 'Architectural Engineer',
    trackTitle: 'Coordinate Geometry & Vectors',
    attendanceRate: 81,
    academicScore: 68,
    learningInterests: ['Geometry', 'Calculus', 'Physics'],
    skillsMastered: ['Vectors', 'Coordinate Systems'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000004',
    assignedMentorName: 'Elena Rostova',
    assignedMentorEmail: 'elena.rostova@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    doubtsCount: 4,
    unresolvedDoubtsCount: 2,
    urgentFlag: true,
    specialNotes: 'Ritu has geometry proof questions awaiting mentor review.',
    homeVisits: [],
    recentDoubts: [
      {
        id: 'd-011',
        studentId: 'stu-011',
        studentName: 'Ritu Desai',
        title: '3D Geometry lines and planes shortest distance formula derivation',
        description: 'Need step-by-step vector method explanation for skew lines distance formula.',
        category: 'Geometry',
        status: 'pending',
        urgency: 'Urgent',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      }
    ],
    createdAt: '2026-02-06T08:00:00Z',
  },
  {
    id: 'stu-012',
    name: 'Sameer Khan',
    email: 'sameer.k@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 10 (Secondary Boards)',
    age: 15,
    schoolOrCollege: 'City Central Secondary School',
    dreamCareer: 'Historian & Educator',
    trackTitle: 'World History & Secondary Literature',
    attendanceRate: 85,
    academicScore: 78,
    learningInterests: ['World History', 'Literature', 'Social Studies'],
    skillsMastered: ['Essay Writing', 'Historical Analysis'],
    financialAidStatus: 'Subsidized Learning',
    assignedMentorId: '00000000-0000-0000-0000-000000000004',
    assignedMentorName: 'Elena Rostova',
    assignedMentorEmail: 'elena.rostova@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    doubtsCount: 3,
    unresolvedDoubtsCount: 0,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-07T08:00:00Z',
  },
  {
    id: 'stu-013',
    name: 'Sunita Devi',
    email: 'sunita.d@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 11 (Senior Secondary)',
    age: 16,
    schoolOrCollege: 'Gramin Secondary School',
    dreamCareer: 'Historian & Author',
    trackTitle: 'World History & Analytical Writing',
    attendanceRate: 62,
    academicScore: 59,
    learningInterests: ['World History', 'Literature', 'Essay Writing'],
    skillsMastered: ['Thesis Construction', 'Chronological Analysis'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000005',
    assignedMentorName: 'Alex Rivera',
    assignedMentorEmail: 'alex.rivera@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
    doubtsCount: 5,
    unresolvedDoubtsCount: 2,
    urgentFlag: true,
    specialNotes: 'Sunita needs support with her World History essay draft.',
    homeVisits: [],
    recentDoubts: [
      {
        id: 'd-013',
        studentId: 'stu-013',
        studentName: 'Sunita Devi',
        title: 'What were the primary economic causes of the American Revolution?',
        description: 'I am preparing a history essay and want to structure key causes like colonial trade acts and taxation.',
        category: 'World History',
        status: 'pending',
        urgency: 'Urgent',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      }
    ],
    createdAt: '2026-02-07T08:00:00Z',
  },
  {
    id: 'stu-014',
    name: 'Manoj Yadav',
    email: 'manoj.y@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 9 (Early High School)',
    age: 14,
    schoolOrCollege: 'Zilla Parishad High School',
    dreamCareer: 'Literature Scholar',
    trackTitle: 'Literature & Creative Writing',
    attendanceRate: 77,
    academicScore: 71,
    learningInterests: ['Literature', 'English Grammar', 'World History'],
    skillsMastered: ['Poetry Analysis', 'Grammar Basics'],
    financialAidStatus: 'Subsidized Learning',
    assignedMentorId: '00000000-0000-0000-0000-000000000005',
    assignedMentorName: 'Alex Rivera',
    assignedMentorEmail: 'alex.rivera@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
    doubtsCount: 2,
    unresolvedDoubtsCount: 0,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-08T08:00:00Z',
  },
  {
    id: 'stu-015',
    name: 'Divya Rani',
    email: 'divya.r@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 18,
    schoolOrCollege: 'State Secondary School',
    dreamCareer: 'Economics & Math Specialist',
    trackTitle: 'Algebra & Microeconomics',
    attendanceRate: 88,
    academicScore: 82,
    learningInterests: ['Algebra', 'Economics', 'Statistics'],
    skillsMastered: ['Supply & Demand Curves', 'Graph Interpretation'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000005',
    assignedMentorName: 'Alex Rivera',
    assignedMentorEmail: 'alex.rivera@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
    doubtsCount: 4,
    unresolvedDoubtsCount: 1,
    urgentFlag: false,
    homeVisits: [],
    recentDoubts: [],
    createdAt: '2026-02-08T08:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// 3. Initial Mentorship Requests
// -----------------------------------------------------------------------------

export const INITIAL_MENTORSHIP_REQUESTS: MentorshipRequest[] = [
  {
    id: 'req-001',
    studentId: 'stu-001',
    studentName: 'Rahul Kumar',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    mentorId: '00000000-0000-0000-0000-000000000001',
    mentorName: 'Dr. Sarah Jenkins',
    topic: 'Physics Board Exam Preparation & Study Habits',
    description: 'I need guidance on organizing my daily review for Grade 10 Physics and balancing my home responsibilities.',
    urgency: 'Urgent',
    preferredMode: 'In-Person Home Visit',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'req-002',
    studentId: 'stu-005',
    studentName: 'Vikram Singh',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mentorId: '00000000-0000-0000-0000-000000000002',
    mentorName: 'Priya Sharma',
    topic: 'Calculus Chain Rule & Derivatives Review',
    description: 'Need step-by-step guidance on calculus derivatives before our upcoming exam.',
    urgency: 'Urgent',
    preferredMode: 'In-Person Home Visit',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];

// -----------------------------------------------------------------------------
// 4. Persistence & Local Storage Service Helpers
// -----------------------------------------------------------------------------

const STORAGE_KEY_STUDENTS = 'shifting_orbits_students';
const STORAGE_KEY_MENTORS = 'shifting_orbits_mentors';
const STORAGE_KEY_VISITS = 'shifting_orbits_visits';
const STORAGE_KEY_REQUESTS = 'shifting_orbits_requests';

export function getPersistedStudents(): StudentDossier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    let students: StudentDossier[] = raw ? JSON.parse(raw) : INITIAL_STUDENTS;
    return students.map((s) => ({
      ...s,
      priorityEvaluation: evaluateStudentPriority(s),
    }));
  } catch (err) {
    return INITIAL_STUDENTS.map((s) => ({
      ...s,
      priorityEvaluation: evaluateStudentPriority(s),
    }));
  }
}

export function savePersistedStudents(students: StudentDossier[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent('shifting_orbits_data_updated'));
  } catch (err) {
    console.error('Failed to save students:', err);
  }
}

export function getPersistedMentors(): MentorProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENTORS);
    const mentors: MentorProfile[] = raw ? JSON.parse(raw) : INITIAL_MENTORS;
    const students = getPersistedStudents();

    return mentors.map((m) => {
      const now = Date.now();
      const lastActiveMs = new Date(m.lastActiveDate).getTime();
      const lastDoubtMs = new Date(m.lastDoubtResolvedDate).getTime();
      const lastVisitMs = new Date(m.lastOfflineVisitDate).getTime();

      const daysSinceActive = Math.max(0, Math.floor((now - lastActiveMs) / (1000 * 60 * 60 * 24)));
      const daysSinceDoubt = Math.max(0, Math.floor((now - lastDoubtMs) / (1000 * 60 * 60 * 24)));
      const daysSinceVisit = Math.max(0, Math.floor((now - lastVisitMs) / (1000 * 60 * 60 * 24)));

      const isInactiveOver10Days = daysSinceActive >= 10;
      const noDoubtSolvedIn5Days = daysSinceDoubt >= 5;
      const noOfflineVisitIn30Days = daysSinceVisit >= 30;
      const hasAnySlaBreach = isInactiveOver10Days || noDoubtSolvedIn5Days || noOfflineVisitIn30Days;

      const assigned = students.filter((s) => m.assignedStudentIds.includes(s.id));

      return {
        ...m,
        assignedStudents: assigned,
        slaStatus: {
          isInactiveOver10Days,
          daysSinceLastActive: daysSinceActive,
          noDoubtSolvedIn5Days,
          daysSinceLastDoubtResolved: daysSinceDoubt,
          noOfflineVisitIn30Days,
          daysSinceLastOfflineVisit: daysSinceVisit,
          hasAnySlaBreach,
        },
      };
    });
  } catch (err) {
    return INITIAL_MENTORS;
  }
}

export function getPersistedHomeVisits(): OfflineHomeVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISITS);
    if (raw) return JSON.parse(raw);
    const allVisits: OfflineHomeVisit[] = [];
    INITIAL_STUDENTS.forEach((s) => {
      if (s.homeVisits) allVisits.push(...s.homeVisits);
    });
    return allVisits;
  } catch (err) {
    return [];
  }
}

export function recordOfflineHomeVisit(newVisit: OfflineHomeVisit): void {
  try {
    const existingVisits = getPersistedHomeVisits();
    const updatedVisits = [newVisit, ...existingVisits];
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(updatedVisits));

    const students = getPersistedStudents();
    const studentIndex = students.findIndex((s) => s.id === newVisit.studentId);
    if (studentIndex >= 0) {
      const student = students[studentIndex];
      student.lastHomeVisitDate = newVisit.visitDate;
      student.homeVisits = [newVisit, ...(student.homeVisits || [])];
      students[studentIndex] = student;
      savePersistedStudents(students);
    }

    const mentors = getPersistedMentors();
    const mentorIndex = mentors.findIndex((m) => m.id === newVisit.mentorId);
    if (mentorIndex >= 0) {
      mentors[mentorIndex].lastOfflineVisitDate = newVisit.visitDate;
      localStorage.setItem(STORAGE_KEY_MENTORS, JSON.stringify(mentors));
    }

    window.dispatchEvent(new CustomEvent('shifting_orbits_data_updated'));
  } catch (err) {
    console.error('Failed to record home visit:', err);
  }
}

export function getPersistedMentorshipRequests(): MentorshipRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    return raw ? JSON.parse(raw) : INITIAL_MENTORSHIP_REQUESTS;
  } catch (err) {
    return INITIAL_MENTORSHIP_REQUESTS;
  }
}

export function submitMentorshipRequest(req: Omit<MentorshipRequest, 'id' | 'createdAt' | 'status'>): MentorshipRequest {
  const newRequest: MentorshipRequest = {
    ...req,
    id: `req-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const current = getPersistedMentorshipRequests();
    const updated = [newRequest, ...current];
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shifting_orbits_data_updated'));
  } catch (err) {
    console.error('Failed to save mentorship request:', err);
  }

  return newRequest;
}

export function updateMentorshipRequestStatus(requestId: string, newStatus: 'accepted' | 'completed' | 'declined'): void {
  try {
    const current = getPersistedMentorshipRequests();
    const updated = current.map((r) => r.id === requestId ? { ...r, status: newStatus } : r);
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shifting_orbits_data_updated'));
  } catch (err) {
    console.error('Failed to update request status:', err);
  }
}
