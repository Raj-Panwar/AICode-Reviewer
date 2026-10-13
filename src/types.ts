/// <reference types="vite/client" />

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  githubUsername?: string;
  createdAt: string;
}

export interface ReviewIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: 'BUGS' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY' | 'COMPLEXITY';
  line: number;
  title: string;
  description: string;
  whyItMatters: string;
  suggestedFix: string;
}

export interface ComplexityData {
  time: string;
  space: string;
  explanation: string;
  bottleneck?: string;
  suggestedApproach?: string;
}

export interface ReviewEntity {
  id: string;
  reviewId: string;
  userId: string;
  language: string;
  fileName: string;
  file?: string;
  project?: string;
  repository?: string | { owner: string; name: string };
  branch?: string;
  date?: string;
  createdAt: string;
  overallScore: number;
  score?: number;
  status: string;
  summary: string;
  counts: {
    critical: number;
    bugs: number;
    security: number;
    performance: number;
    complexity: number;
    quality: number;
  };
  timeComplexity: string;
  spaceComplexity: string;
  complexity: ComplexityData;
  issues: ReviewIssue[];
  recommendations: string[];
  optimizedCode: string;
  rawCode?: string;
}

export interface RepositoryFile {
  name: string;
  path: string;
  language: string;
  size: string;
  code: string;
}

export interface RepositoryEntity {
  id: string;
  name: string;
  owner: string;
  defaultBranch: string;
  language: string;
  lastReviewed: string;
  healthScore: number;
  openIssues: number;
  timeComplexity: string;
  spaceComplexity: string;
  status: string;
  branches: string[];
  files: RepositoryFile[];
}

export interface ComplexityCaseStudy {
  name: string;
  category: string;
  difficulty: string;
  currentApproach: {
    title: string;
    time: string;
    space: string;
    description: string;
  };
  optimizedApproach: {
    title: string;
    time: string;
    space: string;
    description: string;
  };
  explanation: string;
  codeExample: string;
}

export interface DashboardStats {
  totalReviews: number;
  codeHealth: number;
  bugsDetected: number;
  securityIssues: number;
  averageCodeQuality: number;
  averageComplexity: string;
  repositoriesCount: number;
  healthStatusText: string;
}
