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
// 1. Initial 5 Mentors with SLA Performance Telemetry
// -----------------------------------------------------------------------------

export const INITIAL_MENTORS: MentorProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    headline: 'Staff Fullstack Architect & Cradle-to-College Tech Lead',
    bio: '12+ years building accessible software. Volunteer mentor for underrepresented youth in tech across secondary and college levels.',
    organization: 'Shifting Orbits Tech Fellowship',
    expertiseTags: ['Web Dev', 'React', 'TypeScript', 'Accessibility', 'Career Strategy'],
    rating: 4.98,
    resolvedCount: 48,
    assignedStudentIds: ['stu-001', 'stu-002', 'stu-003'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
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
    headline: 'AI/ML Systems Researcher & STEM Education Mentor',
    bio: 'Passionate about nurturing first-generation college students in STEM, Applied Python, and Data Science careers.',
    organization: 'Shifting Orbits STEM Initiative',
    expertiseTags: ['Python', 'AI/ML', 'Data Science', 'Algorithms', 'College Prep'],
    rating: 5.00,
    resolvedCount: 54,
    assignedStudentIds: ['stu-004', 'stu-005', 'stu-006'],
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
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
    headline: 'Cloud Infrastructure Architect & Systems Coach',
    bio: 'Specializes in DevOps, PostgreSQL, and Linux foundations. Dedicated mentor for youth vocational programs.',
    organization: 'Shifting Orbits Tech Fellowship',
    expertiseTags: ['Cloud', 'Linux', 'PostgreSQL', 'DevOps', 'System Design'],
    rating: 4.85,
    resolvedCount: 25,
    assignedStudentIds: ['stu-007', 'stu-008', 'stu-009'],
    // SLA Flag 1: Inactive > 10 Days (14 days inactive)
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(), // 16 days ago
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
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
    headline: 'Senior Math & Algorithms Educator',
    bio: 'Coaches students preparing for secondary board exams and college entrance aptitude competitions.',
    organization: 'Shifting Orbits Academic Bridge',
    expertiseTags: ['Mathematics', 'Algorithms', 'Logic', 'Data Structures', 'Exam Prep'],
    rating: 4.90,
    resolvedCount: 31,
    assignedStudentIds: ['stu-010', 'stu-011', 'stu-012'],
    // SLA Flag 2: No Doubt Solved in 5+ Days (8 days since doubt solved)
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // Active today (20 hours ago)
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
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
    headline: 'Field Counselor & Vocational Pathways Lead',
    bio: 'Focuses on student career counseling, parental engagement, and high school to college transitions.',
    organization: 'Shifting Orbits Field Outreach',
    expertiseTags: ['Career Counseling', 'Vocational Training', 'College Admissions', 'Soft Skills'],
    rating: 4.92,
    resolvedCount: 38,
    assignedStudentIds: ['stu-013', 'stu-014', 'stu-015'],
    // SLA Flag 3: No Offline Visit in 30+ Days (42 days since last offline visit)
    lastActiveDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    lastDoubtResolvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    lastOfflineVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(), // 42 days ago
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
// 2. Initial 15 Underprivileged Students (3 under each mentor)
// -----------------------------------------------------------------------------

export const INITIAL_STUDENTS: StudentDossier[] = [
  // --- Mentor 1: Dr. Sarah Jenkins (stu-001, stu-002, stu-003) ---
  {
    id: 'stu-001',
    name: 'Rahul Kumar',
    email: 'rahul.k@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 10 (Secondary Boards)',
    age: 15,
    schoolOrCollege: 'Prerna Public High School',
    dreamCareer: 'Full-Stack Software Engineer',
    trackTitle: 'Web Development & Secondary Board Mastery',
    attendanceRate: 68, // Low attendance
    academicScore: 61, // Low score
    learningInterests: ['HTML/CSS', 'JavaScript', 'Mathematics', 'Robotics'],
    skillsMastered: ['HTML Basics', 'CSS Flexbox', 'Linear Equations'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000001',
    assignedMentorName: 'Dr. Sarah Jenkins',
    assignedMentorEmail: 'sarah.jenkins@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    doubtsCount: 6,
    unresolvedDoubtsCount: 3,
    urgentFlag: true,
    specialNotes: 'Father works daily wage construction; Rahul missed school due to sibling care duties. High potential but needs attendance counseling.',
    homeVisits: [
      {
        id: 'visit-001',
        studentId: 'stu-001',
        studentName: 'Rahul Kumar',
        mentorId: '00000000-0000-0000-0000-000000000001',
        mentorName: 'Dr. Sarah Jenkins',
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        rawSpeechTranscript: 'Visited Rahul at his home in South Colony. The family has single room with limited lighting. Mother was welcoming. Rahul has difficulty studying after 7pm due to noise. Shared study schedule and provided LED study lamp.',
        summary: 'Home visit revealed cramped study conditions and family responsibilities affecting school attendance. Rahul is eager to learn but burdened with family chores.',
        livingEnvironment: 'Single room shared household, poor nighttime study lighting, quiet space needed.',
        academicObservations: 'Grasps coding concepts quickly during sessions but falling behind in school board physics and math.',
        riskLevel: 'High',
        actionItems: ['Provide rechargeable study lamp', 'Coordinate with local community center for evening study hall', 'Tutoring for Grade 10 Math'],
        tags: ['Attendance Risk', 'Board Exams', 'Evening Study Space'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      }
    ],
    recentDoubts: [
      {
        id: 'd-001',
        studentId: 'stu-001',
        studentName: 'Rahul Kumar',
        title: 'Need help with Quadratic Equations for upcoming unit test tomorrow',
        description: 'I cannot figure out how to find roots using factoring method when coefficient a is greater than 1.',
        category: 'Mathematics',
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
    schoolOrCollege: 'Sarvodaya Senior Secondary Vidyalaya',
    dreamCareer: 'Biomedical Informatics Specialist',
    trackTitle: 'College Entrance & Data Foundations',
    attendanceRate: 94,
    academicScore: 88,
    learningInterests: ['Biology', 'Python', 'Biostatistics', 'Medical Science'],
    skillsMastered: ['Genetics', 'Python Data Analysis', 'Statistical Inference'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000001',
    assignedMentorName: 'Dr. Sarah Jenkins',
    assignedMentorEmail: 'sarah.jenkins@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    doubtsCount: 4,
    unresolvedDoubtsCount: 0,
    urgentFlag: false,
    homeVisits: [
      {
        id: 'visit-002',
        studentId: 'stu-002',
        studentName: 'Ananya Patel',
        mentorId: '00000000-0000-0000-0000-000000000001',
        mentorName: 'Dr. Sarah Jenkins',
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        rawSpeechTranscript: 'Met with Ananya and her parents. Parents are very supportive of her college ambitions. Ananya has completed 85% of her college entrance exam syllabus.',
        summary: 'Excellent home environment and strong parental backing. Preparing for national university entrance exams with high consistency.',
        livingEnvironment: 'Dedicated study desk, stable internet via NGO modem.',
        academicObservations: 'Scoring top 5% in mock tests. In need of guidance for college scholarship application essays.',
        riskLevel: 'Low',
        actionItems: ['Review university scholarship drafts', 'Connect with university alumna mentor'],
        tags: ['College Ready', 'High Achiever', 'Scholarship Prep'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      }
    ],
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
    schoolOrCollege: 'Model Higher Secondary School',
    dreamCareer: 'Computer Hardware & Network Technician',
    trackTitle: 'Foundational STEM & Vocational IT',
    attendanceRate: 78,
    academicScore: 72,
    learningInterests: ['Computer Hardware', 'Networking Basics', 'General Science'],
    skillsMastered: ['PC Assembly', 'Ethernet Wiring', 'Basic Algebra'],
    financialAidStatus: 'Hardware/Device Grant',
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

  // --- Mentor 2: Priya Sharma (stu-004, stu-005, stu-006) ---
  {
    id: 'stu-004',
    name: 'Sneha Roy',
    email: 'sneha.r@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'College 1st Year (Freshman)',
    age: 19,
    schoolOrCollege: 'Government Engineering College',
    dreamCareer: 'AI Research Engineer',
    trackTitle: 'Python & Machine Learning Foundations',
    attendanceRate: 91,
    academicScore: 84,
    learningInterests: ['PyTorch', 'Linear Algebra', 'Computer Vision'],
    skillsMastered: ['Python OOP', 'NumPy', 'Pandas', 'Linear Regression'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000002',
    assignedMentorName: 'Priya Sharma',
    assignedMentorEmail: 'priya.sharma@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    doubtsCount: 8,
    unresolvedDoubtsCount: 1,
    urgentFlag: false,
    homeVisits: [
      {
        id: 'visit-004',
        studentId: 'stu-004',
        studentName: 'Sneha Roy',
        mentorId: '00000000-0000-0000-0000-000000000002',
        mentorName: 'Priya Sharma',
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        rawSpeechTranscript: 'Visited Sneha in hostel dormitory. She is adapting well to 1st year engineering. Demonstrated her first neural network project. Needs guidance on open source contribution.',
        summary: 'Successful transition into college freshman year. High enthusiasm for machine learning and actively building portfolio projects.',
        livingEnvironment: 'College hostel, shared room with stable connectivity.',
        academicObservations: 'Strong mathematical aptitude and coding speed. Prepared for summer research internship applications.',
        riskLevel: 'Low',
        actionItems: ['Introduce to open source AI research repo', 'Prepare resume for summer research fellowship'],
        tags: ['College Success', 'AI Portfolio', 'Internship Ready'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      }
    ],
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
    schoolOrCollege: 'Navodaya Model School',
    dreamCareer: 'Data Scientist',
    trackTitle: 'Senior Secondary Science & Applied AI',
    attendanceRate: 64, // Low attendance
    academicScore: 58, // Failing threshold
    learningInterests: ['Data Analysis', 'Calculus', 'Python'],
    skillsMastered: ['Variables & Loops', 'Basic Statistics'],
    financialAidStatus: 'Hardware/Device Grant',
    assignedMentorId: '00000000-0000-0000-0000-000000000002',
    assignedMentorName: 'Priya Sharma',
    assignedMentorEmail: 'priya.sharma@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    doubtsCount: 7,
    unresolvedDoubtsCount: 3,
    urgentFlag: true,
    specialNotes: 'NGO tablet screen broke 2 weeks ago; Vikram unable to attend online evening doubts sessions. Attendance falling rapidly.',
    homeVisits: [
      {
        id: 'visit-005',
        studentId: 'stu-005',
        studentName: 'Vikram Singh',
        mentorId: '00000000-0000-0000-0000-000000000002',
        mentorName: 'Priya Sharma',
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        rawSpeechTranscript: 'Visited Vikram at his residence. Discovered his learning tablet screen is shattered. He is struggling to keep up with calculus and physics lectures. Mother expressed concern regarding his falling grades.',
        summary: 'Severe hardware roadblock preventing access to learning materials. Vikram is demotivated due to falling test scores.',
        livingEnvironment: 'Modest rural home, limited device access.',
        academicObservations: 'Behind on 4 chapters in Grade 11 Calculus. Needs urgent hardware replacement and remedial tutoring.',
        riskLevel: 'Critical',
        actionItems: ['Urgent device replacement via NGO hardware reserve', 'Assign peer tutor for Calculus remedial', 'Weekly mentor check-in'],
        tags: ['Hardware Blocker', 'Failing Grade', 'Urgent Intervention'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      }
    ],
    recentDoubts: [
      {
        id: 'd-005',
        studentId: 'stu-005',
        studentName: 'Vikram Singh',
        title: 'Derivatives using chain rule - cannot understand outer vs inner function',
        description: 'I missed the last 2 math lectures because my tablet broke. I have board terminal exam on Monday.',
        category: 'Mathematics',
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
    schoolOrCollege: 'Kasturba Gandhi Balika Vidyalaya',
    dreamCareer: 'Mobile App Developer',
    trackTitle: 'Secondary Science & Mobile Web',
    attendanceRate: 88,
    academicScore: 79,
    learningInterests: ['JavaScript', 'Science', 'English Communication'],
    skillsMastered: ['DOM Manipulation', 'Chemistry Foundations'],
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

  // --- Mentor 3: Marcus Chen (stu-007, stu-008, stu-009) [FLAGGED: Inactive 14d] ---
  {
    id: 'stu-007',
    name: 'Deepa Mehta',
    email: 'deepa.m@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 12 (College Prep & Boards)',
    age: 17,
    schoolOrCollege: 'Vikas Senior Secondary School',
    dreamCareer: 'Cybersecurity Analyst',
    trackTitle: 'Network Security & College Entrance',
    attendanceRate: 82,
    academicScore: 76,
    learningInterests: ['Cybersecurity', 'Linux', 'Computer Networks'],
    skillsMastered: ['Linux CLI', 'TCP/IP Model', 'Cryptography Basics'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000003',
    assignedMentorName: 'Marcus Chen',
    assignedMentorEmail: 'marcus.chen@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    doubtsCount: 5,
    unresolvedDoubtsCount: 2,
    urgentFlag: true,
    specialNotes: 'Mentor Marcus Chen has been inactive for 14 days. Deepa submitted a cybersecurity project roadblock that has been waiting without reply for 12 days.',
    homeVisits: [],
    recentDoubts: [
      {
        id: 'd-007',
        studentId: 'stu-007',
        studentName: 'Deepa Mehta',
        title: 'Firewall IPTables rules blocking local SSH port in Linux VM',
        description: 'I am stuck on this practical project for 10 days and my assigned mentor has not answered.',
        category: 'Database & Cloud Infrastructure',
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
    schoolOrCollege: 'National Public School',
    dreamCareer: 'Cloud Infrastructure Engineer',
    trackTitle: 'Cloud Computing & Senior Physics',
    attendanceRate: 74, // Below 75%
    academicScore: 66,
    learningInterests: ['Docker', 'AWS Basics', 'Physics'],
    skillsMastered: ['Container Basics', 'Newtonian Mechanics'],
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
    schoolOrCollege: 'Shanti Niketan Middle Vidyalaya',
    dreamCareer: 'Environmental Engineer',
    trackTitle: 'Middle School Science Foundations',
    attendanceRate: 89,
    academicScore: 82,
    learningInterests: ['Environmental Science', 'Mathematics', 'Scratch Coding'],
    skillsMastered: ['Fractions', 'Photosynthesis', 'Scratch Game Basics'],
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

  // --- Mentor 4: Elena Rostova (stu-010, stu-011, stu-012) [FLAGGED: No Doubts Solved in 8d] ---
  {
    id: 'stu-010',
    name: 'Tarun Sharma',
    email: 'tarun.s@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'College 2nd Year (Undergraduate)',
    age: 20,
    schoolOrCollege: 'Institute of Technology & Science',
    dreamCareer: 'Algorithms Researcher & Professor',
    trackTitle: 'Advanced Data Structures & Competitive Programming',
    attendanceRate: 95,
    academicScore: 92,
    learningInterests: ['Dynamic Programming', 'Graph Theory', 'C++ STL'],
    skillsMastered: ['Segment Trees', 'Dijkstra Algorithm', 'DP on Trees'],
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
    schoolOrCollege: 'Adarsh Kanya Senior Secondary',
    dreamCareer: 'Civil & Architectural Engineer',
    trackTitle: 'Senior Mathematics & Engineering Entrance Prep',
    attendanceRate: 81,
    academicScore: 68,
    learningInterests: ['Coordinate Geometry', 'Calculus', 'Physics Mechanics'],
    skillsMastered: ['Vectors', '3D Geometry Basics'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000004',
    assignedMentorName: 'Elena Rostova',
    assignedMentorEmail: 'elena.rostova@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    doubtsCount: 4,
    unresolvedDoubtsCount: 2,
    urgentFlag: true,
    specialNotes: 'Ritu has 2 open math questions waiting for 7 days without response due to mentor doubt resolution SLA breach.',
    homeVisits: [],
    recentDoubts: [
      {
        id: 'd-011',
        studentId: 'stu-011',
        studentName: 'Ritu Desai',
        title: '3D Lines and Planes shortest distance between skew lines formula derivation',
        description: 'Need step-by-step vector method explanation. Waiting for mentor review.',
        category: 'Mathematics',
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
    dreamCareer: 'Database Administrator',
    trackTitle: 'Secondary Boards & Relational Databases',
    attendanceRate: 85,
    academicScore: 78,
    learningInterests: ['SQL Basics', 'Information Technology', 'Science'],
    skillsMastered: ['SQL Queries', 'Algebraic Identities'],
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

  // --- Mentor 5: Alex Rivera (stu-013, stu-014, stu-015) [FLAGGED: No Offline Visit in 42d] ---
  {
    id: 'stu-013',
    name: 'Sunita Devi',
    email: 'sunita.d@student.shiftingorbits.org',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    cradleStage: 'Grade 11 (Senior Secondary)',
    age: 16,
    schoolOrCollege: 'Gramin Kanya Vidyalaya',
    dreamCareer: 'Healthcare Nurse & Paramedic',
    trackTitle: 'Nursing Sciences & Vocational Healthcare',
    attendanceRate: 62, // Severe attendance risk
    academicScore: 59, // Risk score
    learningInterests: ['Anatomy', 'Physiology', 'First Aid', 'English Communication'],
    skillsMastered: ['Vital Signs Assessment', 'Basic Biology'],
    financialAidStatus: 'Full NGO Scholarship',
    assignedMentorId: '00000000-0000-0000-0000-000000000005',
    assignedMentorName: 'Alex Rivera',
    assignedMentorEmail: 'alex.rivera@shiftingorbits.org',
    lastHomeVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(), // 42 DAYS AGO! Overdue SLA!
    doubtsCount: 5,
    unresolvedDoubtsCount: 2,
    urgentFlag: true,
    specialNotes: 'CRITICAL PRIORITY: 42 days since last offline home visit (SLA breach). Sunita’s attendance dropped to 62% due to family financial distress. Field visit is urgently required.',
    homeVisits: [
      {
        id: 'visit-013-old',
        studentId: 'stu-013',
        studentName: 'Sunita Devi',
        mentorId: '00000000-0000-0000-0000-000000000005',
        mentorName: 'Alex Rivera',
        visitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
        rawSpeechTranscript: 'Visited Sunita in village cluster. Family relies on seasonal agriculture. Sunita expressed keen interest in nursing program. Needs regular encouragement.',
        summary: 'Initial home visit 6 weeks ago confirmed strong vocational nursing aspiration. Follow-up visit is severely overdue.',
        livingEnvironment: 'Rural village, seasonal connectivity.',
        academicObservations: 'Committed learner but at high risk of dropping out without frequent field check-ins.',
        riskLevel: 'Critical',
        actionItems: ['Schedule urgent in-person home visit', 'Engage parents on college scholarship commitment'],
        tags: ['Overdue Visit', 'Dropout Risk', 'Vocational Nursing'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
      }
    ],
    recentDoubts: [
      {
        id: 'd-013',
        studentId: 'stu-013',
        studentName: 'Sunita Devi',
        title: 'Need guidance for state nursing college entrance application requirements',
        description: 'Form deadline is in 15 days. Need mentor help to verify required documents.',
        category: 'Career & Technical Interviews',
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
    dreamCareer: 'Digital Marketing & Content Creator',
    trackTitle: 'Digital Literacy & English Communication',
    attendanceRate: 77,
    academicScore: 71,
    learningInterests: ['Digital Media', 'English', 'Graphic Design'],
    skillsMastered: ['Canva Basics', 'Social Media Literacy'],
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
    cradleStage: 'College 1st Year (Freshman)',
    age: 18,
    schoolOrCollege: 'State College of Commerce & Economics',
    dreamCareer: 'Chartered Financial Analyst (CFA)',
    trackTitle: 'Accounting & Applied Financial Modeling',
    attendanceRate: 88,
    academicScore: 82,
    learningInterests: ['Financial Accounting', 'Excel Financial Modeling', 'Economics'],
    skillsMastered: ['Balance Sheets', 'Advanced Excel Formulas', 'Microeconomics'],
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
// 3. Initial 1-on-1 Mentorship Requests
// -----------------------------------------------------------------------------

export const INITIAL_MENTORSHIP_REQUESTS: MentorshipRequest[] = [
  {
    id: 'req-001',
    studentId: 'stu-001',
    studentName: 'Rahul Kumar',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    mentorId: '00000000-0000-0000-0000-000000000001',
    mentorName: 'Dr. Sarah Jenkins',
    topic: 'Board Exam Anxiety & Evening Study Schedule',
    description: 'I am getting very stressed about Grade 10 math board exams and need help organizing my study time with home chores.',
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
    topic: 'Calculus Tutoring & Broken Tablet Replacement',
    description: 'Need urgent guidance on where to collect replacement NGO tablet and review derivatives for Monday exam.',
    urgency: 'Urgent',
    preferredMode: 'In-Person Home Visit',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'req-003',
    studentId: 'stu-013',
    studentName: 'Sunita Devi',
    studentAvatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    mentorId: '00000000-0000-0000-0000-000000000005',
    mentorName: 'Alex Rivera',
    topic: 'Nursing College Entrance Application Review',
    description: 'Need urgent counseling for nursing admission form and scholarship certificates before deadline.',
    urgency: 'Urgent',
    preferredMode: 'In-Person Home Visit',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

// -----------------------------------------------------------------------------
// 4. Persistence & Local Storage Service Helpers
// -----------------------------------------------------------------------------

const STORAGE_KEY_STUDENTS = 'shifting_orbits_students';
const STORAGE_KEY_MENTORS = 'shifting_orbits_mentors';
const STORAGE_KEY_VISITS = 'shifting_orbits_visits';
const STORAGE_KEY_REQUESTS = 'shifting_orbits_requests';

/**
 * Load all students enriched with evaluated priority scores
 */
export function getPersistedStudents(): StudentDossier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    let students: StudentDossier[] = raw ? JSON.parse(raw) : INITIAL_STUDENTS;

    // Enrich each student with current priority evaluation
    return students.map((s) => ({
      ...s,
      priorityEvaluation: evaluateStudentPriority(s),
    }));
  } catch (err) {
    console.error('Failed to parse persisted students:', err);
    return INITIAL_STUDENTS.map((s) => ({
      ...s,
      priorityEvaluation: evaluateStudentPriority(s),
    }));
  }
}

/**
 * Save updated student list
 */
export function savePersistedStudents(students: StudentDossier[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent('shifting_orbits_data_updated'));
  } catch (err) {
    console.error('Failed to save students:', err);
  }
}

/**
 * Load all 5 mentors with live computed SLA flags
 */
export function getPersistedMentors(): MentorProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENTORS);
    const mentors: MentorProfile[] = raw ? JSON.parse(raw) : INITIAL_MENTORS;
    const students = getPersistedStudents();

    // Recompute SLA metrics dynamically
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
    console.error('Failed to parse mentors:', err);
    return INITIAL_MENTORS;
  }
}

/**
 * Load all offline home visits logged by mentors
 */
export function getPersistedHomeVisits(): OfflineHomeVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISITS);
    if (raw) return JSON.parse(raw);

    // Collect all visits from initial students
    const allVisits: OfflineHomeVisit[] = [];
    INITIAL_STUDENTS.forEach((s) => {
      if (s.homeVisits) allVisits.push(...s.homeVisits);
    });
    return allVisits;
  } catch (err) {
    console.error('Failed to load home visits:', err);
    return [];
  }
}

/**
 * Add a new offline home visit (recorded via Speech-to-Text)
 */
export function recordOfflineHomeVisit(newVisit: OfflineHomeVisit): void {
  try {
    // 1. Update Visits List
    const existingVisits = getPersistedHomeVisits();
    const updatedVisits = [newVisit, ...existingVisits];
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(updatedVisits));

    // 2. Update Student Record
    const students = getPersistedStudents();
    const studentIndex = students.findIndex((s) => s.id === newVisit.studentId);
    if (studentIndex >= 0) {
      const student = students[studentIndex];
      student.lastHomeVisitDate = newVisit.visitDate;
      student.homeVisits = [newVisit, ...(student.homeVisits || [])];
      students[studentIndex] = student;
      savePersistedStudents(students);
    }

    // 3. Update Mentor's Last Visit Date
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

/**
 * Load all mentorship requests
 */
export function getPersistedMentorshipRequests(): MentorshipRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    return raw ? JSON.parse(raw) : INITIAL_MENTORSHIP_REQUESTS;
  } catch (err) {
    return INITIAL_MENTORSHIP_REQUESTS;
  }
}

/**
 * Submit a new 1-on-1 mentorship request
 */
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

/**
 * Update request status (e.g. accepted, completed)
 */
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
