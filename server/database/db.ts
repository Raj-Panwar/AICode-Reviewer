import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  organization: string;
  githubUsername?: string;
  githubAccessToken?: string;
  createdAt: string;
}

export interface ReviewIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string;
  category: 'BUGS' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY' | 'COMPLEXITY' | string;
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
  confidence?: string;
  optimizationAvailable?: boolean;
  bottleneck?: string;
  suggestedApproach?: string;
}

export interface ReviewEntity {
  id: string;
  reviewId: string;
  userId: string;
  language: string;
  fileName: string;
  file: string;
  project: string;
  repository: string;
  branch: string;
  date: string;
  createdAt: string;
  score: number;
  overallScore: number;
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
  complexityAnalysis: {
    time: string;
    space: string;
    timeExplanation: string;
    spaceExplanation: string;
    bottleneckLine: number;
    isOptimal: boolean;
    recommendedPattern: string;
    comparisonTable: Array<{
      metric: string;
      time: string;
      space: string;
      throughput?: string;
    }>;
  };
  issues: ReviewIssue[];
  recommendations: string[];
  optimizedCode: string;
  codeContent: string;
  rawCode: string;
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

export interface DatabaseSchema {
  users: User[];
  reviews: ReviewEntity[];
  repositories: RepositoryEntity[];
  complexityLibrary: ComplexityCaseStudy[];
}

class JsonDatabase {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'database.json');
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.warn('[Database] Failed to read existing database.json, re-seeding:', err);
      }
    }

    // Load initial seeds from json/ folder if present
    const seedReviews: ReviewEntity[] = this.loadJsonFile('json/mock-reviews.json', []);
    const seedRepos: RepositoryEntity[] = this.loadJsonFile('json/mock-repositories.json', []);
    const seedComplexity: ComplexityCaseStudy[] = this.loadJsonFile('json/mock-complexity.json', []);

    // Create default user
    const defaultUser: User = {
      id: 'usr_default',
      name: 'Rajesh Panwar',
      email: 'rajesh.panwar@enterprise.io',
      // Hash for 'Password123!' with salt 'salt_seed'
      passwordHash: '8b9d5c317ff26b77243cbf463b72aa982c78e3fca4187f54c9a5840d2ab96939',
      role: 'Staff Software Engineer',
      organization: 'Fintech Core Infrastructure',
      githubUsername: 'rajesh-panwar',
      createdAt: new Date().toISOString()
    };

    const initialData: DatabaseSchema = {
      users: [defaultUser],
      reviews: seedReviews.map((r) => ({
        ...r,
        userId: r.userId || 'usr_default',
        createdAt: r.createdAt || new Date().toISOString()
      })),
      repositories: seedRepos,
      complexityLibrary: seedComplexity
    };

    this.saveData(initialData);
    return initialData;
  }

  private loadJsonFile<T>(relPath: string, fallback: T): T {
    try {
      const p = path.resolve(process.cwd(), relPath);
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.warn(`[Database] Error reading seed file ${relPath}:`, e);
    }
    return fallback;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[Database] Failed to write database.json:', err);
    }
  }

  public persist(): void {
    this.saveData(this.data);
  }

  // --- Users ---
  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.persist();
      return this.data.users[idx];
    }
    return undefined;
  }

  // --- Reviews ---
  public getAllReviews(userId?: string): ReviewEntity[] {
    if (userId) {
      return this.data.reviews.filter((r) => r.userId === userId || r.userId === 'usr_default');
    }
    return [...this.data.reviews];
  }

  public getReviewById(id: string, userId?: string): ReviewEntity | undefined {
    const rev = this.data.reviews.find((r) => r.id === id || r.reviewId === id);
    if (!rev) return undefined;
    if (userId && rev.userId && rev.userId !== userId && rev.userId !== 'usr_default') {
      return undefined; // Not owned by requesting user
    }
    return rev;
  }

  public createReview(review: ReviewEntity): ReviewEntity {
    this.data.reviews.unshift(review);
    this.persist();
    return review;
  }

  public deleteReview(id: string, userId?: string): boolean {
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => {
      const matches = r.id === id || r.reviewId === id;
      if (!matches) return true;
      if (userId && r.userId && r.userId !== userId && r.userId !== 'usr_default') {
        return true; // Not authorized to delete
      }
      return false;
    });
    if (this.data.reviews.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Repositories ---
  public getRepositories(): RepositoryEntity[] {
    return [...this.data.repositories];
  }

  public getRepositoryById(id: string): RepositoryEntity | undefined {
    return this.data.repositories.find((r) => r.id === id);
  }

  public createRepository(repo: RepositoryEntity): RepositoryEntity {
    this.data.repositories.unshift(repo);
    this.persist();
    return repo;
  }

  // --- Complexity Library ---
  public getComplexityLibrary(): ComplexityCaseStudy[] {
    return [...this.data.complexityLibrary];
  }
}

export const db = new JsonDatabase();
