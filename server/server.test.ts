import { AuthService } from './services/authService.js';
import { db } from './database/db.js';
import { ReviewProcessingService } from './services/reviewProcessingService.js';
import { GeminiService } from './services/geminiService.js';
import { GitHubService } from './services/githubService.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  // Test 1: Authentication Registration & Token
  console.log('\n[1] Authentication Service:');
  const regEmail = `test_${Date.now()}@test.io`;
  const regRes = AuthService.register({
    name: 'Test Engineer',
    email: regEmail,
    password: 'TestPassword123!',
    role: 'Staff Engineer',
    organization: 'Fintech Core'
  });
  assert(Boolean(regRes.token), 'Registration returns valid token');
  assert(regRes.user.email === regEmail, 'User record matches email');

  // Test 2: Authentication Login
  const loginRes = AuthService.login(regEmail, 'TestPassword123!');
  assert(Boolean(loginRes.token), 'Login returns JWT token');
  assert(loginRes.user.id === regRes.user.id, 'User ID preserved on login');

  // Test 3: Password verification & wrong credentials rejection
  let threwWrongPass = false;
  try {
    AuthService.login(regEmail, 'WrongPassword!');
  } catch {
    threwWrongPass = true;
  }
  assert(threwWrongPass, 'Rejects invalid password attempt');

  // Test 4: Database Layer & Review Persistence
  console.log('\n[2] Database & Review Processing Service:');
  const initialReviews = db.getAllReviews();
  assert(Array.isArray(initialReviews), 'Can retrieve stored reviews from DB');

  // Test 5: Review Processing with Code & Big-O evaluation
  const codeSubmission = {
    fileName: 'TwoSum.java',
    language: 'Java',
    code: `public class TwoSum {
      public int[] find(int[] arr, int target) {
        for(int i=0; i<arr.length; i++) {
          for(int j=i+1; j<arr.length; j++) {
            if(arr[i]+arr[j] == target) return new int[]{i,j};
          }
        }
        return new int[]{};
      }
    }`
  };
  const createdReview = await ReviewProcessingService.analyzeAndSaveReview(codeSubmission, regRes.user.id);
  assert(Boolean(createdReview.id), 'Review successfully created with unique ID');
  assert(createdReview.timeComplexity === 'O(n²)', 'Correctly detects quadratic O(n²) time complexity');
  assert(createdReview.issues.length > 0, 'Detects issues and potential bottlenecks');
  assert(Boolean(createdReview.optimizedCode), 'Generates optimized mentor code');

  // Test 6: Review Ownership & Retrieval
  const fetchedReview = db.getReviewById(createdReview.id, regRes.user.id);
  assert(Boolean(fetchedReview), 'Owner can retrieve review by ID');

  const otherUserReview = db.getReviewById(createdReview.id, 'other_random_user');
  assert(!otherUserReview, 'Unauthorized user cannot access review');

  // Test 7: Review Deletion
  const deleted = db.deleteReview(createdReview.id, regRes.user.id);
  assert(deleted, 'Owner can delete review');
  const postDelete = db.getReviewById(createdReview.id, regRes.user.id);
  assert(!postDelete, 'Deleted review no longer exists');

  // Test 8: Complexity Analysis
  console.log('\n[3] Standalone Complexity Analysis:');
  const compResult = await GeminiService.analyzeComplexityWithGemini(
    'function test(n) { for(let i=0; i<n; i++) { for(let j=0; j<n; j++) console.log(i,j); } }',
    'JavaScript'
  );
  assert(compResult.timeComplexity === 'O(n²)', 'Complexity evaluator accurately bounds nested loops to O(n²)');
  assert(compResult.bottlenecks.length > 0, 'Lists complexity bottlenecks');

  // Test 9: GitHub Repository Service
  console.log('\n[4] GitHub Repository Service:');
  const repos = await GitHubService.getRepositories();
  assert(repos.length > 0, 'Lists repositories');
  const singleRepo = await GitHubService.getRepositoryById(repos[0].id);
  assert(Boolean(singleRepo && singleRepo.id === repos[0].id), 'Fetches single repository by ID');
  const files = await GitHubService.getFiles(repos[0].id, 'main');
  assert(Array.isArray(files), 'Fetches repository files');

  // Test 10: Dashboard Metrics Aggregation
  console.log('\n[5] Dashboard Metrics:');
  const metrics = ReviewProcessingService.getDashboardMetrics();
  assert(typeof metrics.averageCodeQuality === 'number', 'Calculates average code quality score');
  assert(typeof metrics.totalReviews === 'number', 'Calculates total review count');

  console.log(`\n===========================================`);
  console.log(`All Backend Tests Completed: ${passed} passed, ${failed} failed`);
  console.log(`===========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
