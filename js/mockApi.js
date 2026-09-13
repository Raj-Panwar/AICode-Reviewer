/**
 * AI Code Reviewer - Mock API Layer
 *
 * Simulates the future Spring Boot REST API for 100% standalone frontend testing.
 * Provides realistic responses for:
 *   - GET  /api/repositories
 *   - GET  /api/repositories/:id
 *   - GET  /api/repositories/:id/branches
 *   - GET  /api/repositories/:id/files
 *   - POST /api/reviews/analyze
 *   - GET  /api/reviews
 *   - GET  /api/reviews/:id
 *   - GET  /api/dashboard/stats
 *   - GET  /api/complexity
 *   - GET  /api/health
 *
 * Features:
 *   - Simulates realistic network latency (configurable, default 350ms)
 *   - Generates detailed, language-tailored mock reviews for ALL 9 supported languages:
 *     (Java, Python, C, C++, JavaScript, TypeScript, Go, Kotlin, Rust)
 *   - Supports dynamic code inspection (loops, complexity, null-safety, memory safety)
 *   - Zero requests to localhost:8080 in mock mode (no console errors)
 *   - Optional developer error simulation for testing UI error boundaries
 */

import {
  SUPPORTED_LANGUAGES,
  DEFAULT_FILENAMES,
  CODE_TEMPLATES
} from './languageState.js';

// Cached mock data loaded from /json/ or seeds
let cachedReviews = null;
let cachedRepositories = null;
let cachedStats = null;
let cachedComplexity = null;

// Developer simulation options
let simulatedDelayMs = 350;
let simulateError = false;

/**
 * Utility helper to fetch local JSON assets safely with in-memory fallbacks
 */
async function fetchLocalJson(path, fallbackData) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // If running in restricted local file origin or missing asset, use seed
    return fallbackData;
  }
}

/**
 * Sleep helper for simulating realistic network latency
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  /**
   * Configure simulated network delay
   */
  setDelay(ms) {
    simulatedDelayMs = Math.max(0, parseInt(ms, 10) || 0);
  },

  getDelay() {
    return simulatedDelayMs;
  },

  /**
   * Configure error simulation
   */
  setSimulateError(shouldError) {
    simulateError = Boolean(shouldError);
  },

  isSimulateError() {
    return simulateError;
  },

  /**
   * Main mock GET router
   */
  async get(endpoint, params = {}) {
    await delay(simulatedDelayMs);

    if (simulateError) {
      return {
        ok: false,
        status: 500,
        error: new Error('Simulated Mock API Error (500 Internal Server Error)'),
        isMock: true
      };
    }

    const cleanEndpoint = endpoint.split('?')[0].replace(/\/+$/, '');

    // Health check endpoint
    if (cleanEndpoint === '/api/health') {
      return {
        ok: true,
        status: 200,
        data: {
          status: 'UP',
          mode: 'mock',
          message: 'Mock API Active - Standalone Frontend Mode',
          timestamp: new Date().toISOString()
        },
        isMock: true
      };
    }

    // Dashboard statistics: GET /api/dashboard/stats
    if (cleanEndpoint === '/api/dashboard/stats') {
      const stats = await this.getDashboardStats();
      return { ok: true, status: 200, data: stats, isMock: true };
    }

    // Repositories listing: GET /api/repositories
    if (cleanEndpoint === '/api/repositories') {
      const repos = await this.getRepositories();
      return { ok: true, status: 200, data: repos, isMock: true };
    }

    // Single repository files: GET /api/repositories/:id/files
    const repoFilesMatch = cleanEndpoint.match(/^\/api\/repositories\/([^/]+)\/files$/);
    if (repoFilesMatch) {
      const repoId = repoFilesMatch[1];
      const files = await this.getRepositoryFiles(repoId, params.branch);
      return { ok: true, status: 200, data: files, isMock: true };
    }

    // Single repository branches: GET /api/repositories/:id/branches
    const repoBranchesMatch = cleanEndpoint.match(/^\/api\/repositories\/([^/]+)\/branches$/);
    if (repoBranchesMatch) {
      const repoId = repoBranchesMatch[1];
      const branches = await this.getRepositoryBranches(repoId);
      return { ok: true, status: 200, data: branches, isMock: true };
    }

    // Single repository: GET /api/repositories/:id
    const singleRepoMatch = cleanEndpoint.match(/^\/api\/repositories\/([^/]+)$/);
    if (singleRepoMatch) {
      const repoId = singleRepoMatch[1];
      const repo = await this.getRepositoryById(repoId);
      return repo
        ? { ok: true, status: 200, data: repo, isMock: true }
        : { ok: false, status: 404, error: new Error('Repository not found'), isMock: true };
    }

    // Reviews listing: GET /api/reviews
    if (cleanEndpoint === '/api/reviews') {
      const reviews = await this.getReviews(params);
      return { ok: true, status: 200, data: reviews, isMock: true };
    }

    // Single review: GET /api/reviews/:id
    const singleReviewMatch = cleanEndpoint.match(/^\/api\/reviews\/([^/]+)$/);
    if (singleReviewMatch) {
      const reviewId = singleReviewMatch[1];
      const review = await this.getReviewById(reviewId);
      return review
        ? { ok: true, status: 200, data: review, isMock: true }
        : { ok: false, status: 404, error: new Error('Review not found'), isMock: true };
    }

    // Complexity Library: GET /api/complexity
    if (cleanEndpoint === '/api/complexity') {
      const complexity = await this.getComplexityLibrary();
      return { ok: true, status: 200, data: complexity, isMock: true };
    }

    // Default 404
    return {
      ok: false,
      status: 404,
      error: new Error(`Mock endpoint not found: ${endpoint}`),
      isMock: true
    };
  },

  /**
   * Main mock POST router
   */
  async post(endpoint, body = {}) {
    await delay(simulatedDelayMs);

    if (simulateError) {
      return {
        ok: false,
        status: 500,
        error: new Error('Simulated Mock API Error during POST (500 Internal Server Error)'),
        isMock: true
      };
    }

    const cleanEndpoint = endpoint.replace(/\/+$/, '');

    // Analyze Code: POST /api/reviews/analyze
    if (cleanEndpoint === '/api/reviews/analyze') {
      const reviewResult = await this.analyzeCode(body);
      return { ok: true, status: 201, data: reviewResult, isMock: true };
    }

    return {
      ok: false,
      status: 404,
      error: new Error(`Mock POST endpoint not found: ${endpoint}`),
      isMock: true
    };
  },

  /**
   * Review Analysis Generator (Simulates Spring Boot + Gemini AI response)
   * Dynamically constructs complete, high-fidelity reviews tailored to the language and code.
   */
  async analyzeCode(submission) {
    const lang = submission.language || 'Java';
    const fileName = submission.fileName || DEFAULT_FILENAMES[lang] || 'Solution.java';
    const code = submission.code || CODE_TEMPLATES[lang] || '// Source code';

    const timestamp = Date.now();
    const newId = `mock-review-${Math.floor(100 + Math.random() * 900)}`;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    // Inspect code characteristics dynamically
    const codeLower = code.toLowerCase();
    const hasNestedLoops = /(for|while)[\s\S]*?(for|while)/i.test(code);
    const hasRecursion = /def\s+(\w+)[\s\S]*?\1\(|\b(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\b\2\(/i.test(code);
    const hasNullRisk = !/requireNonNull|if\s*\([^)]*null\)|option|unwrap_or|\?\./i.test(code);
    const hasUncheckedError = lang === 'Go' && /_\s*=/.test(code);
    const hasPointerLeak = (lang === 'C' || lang === 'C++') && /malloc\(|new\s+/.test(code) && !/free\(|delete\s+/.test(code);

    // Language-specific issues catalog
    const languageIssues = {
      Java: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 25,
          title: 'Nested iteration causing quadratic time complexity',
          description: 'A nested loop compares elements sequentially in O(n²) time complexity. Lookup cost grows exponentially as input sizes scale.',
          whyItMatters: 'This can become expensive for large inputs, causing thread starvation and latency spikes under concurrent traffic.',
          suggestedFix: 'Replace the nested iteration with a java.util.HashMap to reduce lookup time from O(n) to amortized O(1).'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'CRITICAL',
          category: 'BUGS',
          line: 14,
          title: 'Potential Null Pointer Dereference',
          description: 'Direct invocation on method parameter without defensive validation. Can trigger java.lang.NullPointerException if caller passes null.',
          whyItMatters: 'Triggers unhandled 500 server errors and interrupts transaction pipelines in production.',
          suggestedFix: 'Objects.requireNonNull(input, "Input cannot be null");\n// Or wrap return value in Optional<T>'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'MEDIUM',
          category: 'QUALITY',
          line: 32,
          title: 'Primitive Boxing Overhead in Collection',
          description: 'Autoboxing between int and Integer inside tight iterations triggers excessive GC pressure.',
          whyItMatters: 'Unnecessary heap allocations increase GC pauses and degrade cache locality.',
          suggestedFix: 'Use primitive arrays (int[]) or specialized primitive collections (e.g. IntArrayList).'
        }
      ],

      Python: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 18,
          title: 'Quadratic Membership Check in List',
          description: 'Using `in list` inside an active iteration requires sequential O(n) scanning for each element, leading to O(n²) total execution time.',
          whyItMatters: 'List lookups scale linearly; querying 10,000 items requires 100,000,000 checks.',
          suggestedFix: 'Convert the collection to a `set` before the loop (`lookup_set = set(items)`) to achieve O(1) average lookup speed.'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'HIGH',
          category: 'BUGS',
          line: 8,
          title: 'Mutable Default Argument Risk',
          description: 'Default argument `items=[]` is evaluated once when the function is defined, causing state bleed across subsequent invocations.',
          whyItMatters: 'Modifications to the collection persist across independent function calls, corrupting caller state unexpectedly.',
          suggestedFix: 'def process_records(items: list[str] | None = None):\n    if items is None:\n        items = []'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'LOW',
          category: 'QUALITY',
          line: 28,
          title: 'Missing Explicit Type Annotations',
          description: 'Function parameters and return values lack PEP 484 type hints.',
          whyItMatters: 'Impedes static type checkers like mypy and IDE autocomplete accuracy.',
          suggestedFix: 'def find_pairs(nums: list[int], target: int) -> tuple[int, int] | None:'
        }
      ],

      C: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'CRITICAL',
          category: 'SECURITY',
          line: 22,
          title: 'Potential Heap Memory Leak',
          description: 'Buffer allocated via `malloc()` is not freed in all early-return and error branches.',
          whyItMatters: 'Continuous memory leaks lead to eventual out-of-memory kernel panics and process termination.',
          suggestedFix: 'Ensure every call to `malloc()` has a corresponding `free()` call before each return point, or use a cleanup goto label.'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 34,
          title: 'Unbounded Quadratic Buffer Iteration',
          description: 'Nested pointer arithmetic scans the array twice without indexed caching: O(n²) time complexity.',
          whyItMatters: 'Causes severe cache thrashing and slow CPU throughput on large datasets.',
          suggestedFix: 'Sort the array in O(n log n) with `qsort()` and use two-pointer convergence, or use a lightweight hash bucket array.'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'HIGH',
          category: 'BUGS',
          line: 12,
          title: 'Missing Array Bounds Validation',
          description: 'Index access does not verify that `index < size`, exposing the process to buffer overflows.',
          whyItMatters: 'Buffer overflows enable memory corruption vulnerabilities and potential remote exploit payloads.',
          suggestedFix: 'if (size <= 0 || !nums) return NULL;\nif (i >= size) { /* bounds guard */ }'
        }
      ],

      'C++': [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 26,
          title: 'Inefficient O(n²) Nested Scan on std::vector',
          description: 'Nested loops perform sequential comparisons over `std::vector<int>` instead of indexed lookup.',
          whyItMatters: 'Massive CPU latency degradation on collections exceeding 1,000 elements.',
          suggestedFix: 'Use `std::unordered_map<int, int>` to store visited values and achieve O(n) total time with O(1) average lookups.'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'MEDIUM',
          category: 'PERFORMANCE',
          line: 9,
          title: 'Expensive Pass-by-Value on Container',
          description: 'Passing `std::vector` by value creates a deep heap copy of all elements upon function entry.',
          whyItMatters: 'Allocates heap memory and copies data unnecessarily on every single call.',
          suggestedFix: 'Pass by const reference: `const std::vector<int>& nums` or use `std::span<const int>` (C++20).'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'LOW',
          category: 'QUALITY',
          line: 40,
          title: 'Structured Binding Modernization',
          description: 'Accessing map pair via `.first` and `.second` is verbose.',
          whyItMatters: 'Reduces code clarity and readability.',
          suggestedFix: 'for (const auto& [num, index] : seenMap) { ... }'
        }
      ],

      JavaScript: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 20,
          title: 'Quadratic Nested Search with Array.prototype.find',
          description: 'Calling `.find()` or `.filter()` inside an outer `.map()` or loop produces an O(n * m) nested iteration anti-pattern.',
          whyItMatters: 'Freezes the browser event loop or Node.js thread on medium-to-large dataset processing.',
          suggestedFix: 'Pre-index the auxiliary dataset into a `new Map()` or plain object before the loop to reduce lookup time to O(1).'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'HIGH',
          category: 'BUGS',
          line: 11,
          title: 'Loose Equality Coercion Risk',
          description: 'Using `==` allows unintentional JavaScript type coercion (e.g. `0 == ""` is true).',
          whyItMatters: 'Can lead to subtle logical flaws and bypassed security authorization checks.',
          suggestedFix: 'Use strict equality `===` to ensure both type and value identity are verified.'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'MEDIUM',
          category: 'QUALITY',
          line: 35,
          title: 'Missing Optional Chaining on Nested Property',
          description: 'Accessing deep properties without optional chaining (`?.`) throws a runtime TypeError if parent is undefined.',
          whyItMatters: 'Crashes UI components or Node microservices on unexpected API payload shapes.',
          suggestedFix: 'const discount = order?.customer?.membershipTier ?? "DEFAULT";'
        }
      ],

      TypeScript: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 24,
          title: 'Nested Lookup Iteration Bottleneck',
          description: 'Nested iterations over items and rules cause quadratic time complexity O(n * m).',
          whyItMatters: 'High compute latency and thread blockages on large batch orders.',
          suggestedFix: 'Construct a `Map<string, DiscountRule>` index beforehand to achieve O(1) lookups and O(n) total processing.'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'CRITICAL',
          category: 'BUGS',
          line: 18,
          title: 'Potential Null / Undefined Dereference',
          description: 'Accessing property directly on repository query result without null verification.',
          whyItMatters: 'Throws unhandled `TypeError: Cannot read properties of undefined` in production.',
          suggestedFix: 'if (!entity) {\n  throw new NotFoundException(`Record not found`);\n}'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'LOW',
          category: 'QUALITY',
          line: 6,
          title: 'Use of `any` Disables Type Safety',
          description: 'Variable typed as `any` bypasses compiler static checks.',
          whyItMatters: 'Eliminates TypeScript safety guarantees and hides compile-time contract bugs.',
          suggestedFix: 'Declare a strict interface or use `unknown` with runtime type narrowing guards.'
        }
      ],

      Go: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'CRITICAL',
          category: 'BUGS',
          line: 16,
          title: 'Unchecked Error Return Value',
          description: 'The error returned by standard library I/O or decode function is ignored with blank identifier `_`.',
          whyItMatters: 'Silently ignores network partitions, malformed inputs, and database failure states.',
          suggestedFix: 'if err != nil {\n    return nil, fmt.Errorf("operation failed: %w", err)\n}'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 28,
          title: 'Nested Slices Search without Index',
          description: 'Iterating through slice elements in nested loops costs O(n²) time.',
          whyItMatters: 'Scales poorly as slice sizes increase, creating CPU profiling hotspots.',
          suggestedFix: 'Use `map[int]int` as an indexed lookup table to achieve constant O(1) time lookups.'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'MEDIUM',
          category: 'PERFORMANCE',
          line: 38,
          title: 'Unallocated Slice Append Overhead',
          description: 'Repeated `append()` to an uninitialized slice causes frequent underlying array reallocations and memcopies.',
          whyItMatters: 'Generates garbage collector pressure and slow slice copy operations.',
          suggestedFix: 'Preallocate slice capacity: `results := make([]int, 0, len(nums))`'
        }
      ],

      Kotlin: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'CRITICAL',
          category: 'BUGS',
          line: 14,
          title: 'Unsafe Non-Null Assertion Operator (!!)',
          description: 'Using `!!` bypasses Kotlin null-safety and will throw `NullPointerException` if the reference is null.',
          whyItMatters: 'Directly violates Kotlin safe idioms, causing crashes in production Android or backend services.',
          suggestedFix: 'Use safe call `?.` with elvis operator `?:` or `checkNotNull(value) { "Descriptive message" }`'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 22,
          title: 'Quadratic Nested Iteration Anti-Pattern',
          description: 'Nested loops over `IntArray` take O(n²) quadratic running time.',
          whyItMatters: 'High latency and battery drain on mobile devices for large collections.',
          suggestedFix: 'Use `HashMap<Int, Int>()` to store visited values and reduce execution time to linear O(n).'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'LOW',
          category: 'QUALITY',
          line: 30,
          title: 'Eager Collection Chaining Creates Intermediates',
          description: 'Multiple `.filter()` and `.map()` calls create intermediate list copies.',
          whyItMatters: 'Increases peak heap memory usage.',
          suggestedFix: 'Use `.asSequence()` for lazy, single-pass pipeline evaluation.'
        }
      ],

      Rust: [
        {
          id: `${newId}-ISSUE-1`,
          severity: 'HIGH',
          category: 'PERFORMANCE',
          line: 24,
          title: 'Quadratic Pair Search with Nested Iteration',
          description: 'Nested range loops `0..nums.len()` compare elements in O(n²) time complexity.',
          whyItMatters: 'Degrades CPU throughput and misses opportunities for vectorized SIMD or hash indexing.',
          suggestedFix: 'Use `std::collections::HashMap` or `HashSet` to achieve O(n) linear execution time.'
        },
        {
          id: `${newId}-ISSUE-2`,
          severity: 'HIGH',
          category: 'BUGS',
          line: 15,
          title: 'Unhandled Option / Result with .unwrap()',
          description: 'Directly calling `.unwrap()` causes panic on `None` or `Err` variants.',
          whyItMatters: 'Abruptly terminates the thread or worker process on unexpected input.',
          suggestedFix: 'Use pattern matching (`match` / `if let`), `?` error propagation, or `.unwrap_or_default()`'
        },
        {
          id: `${newId}-ISSUE-3`,
          severity: 'MEDIUM',
          category: 'PERFORMANCE',
          line: 32,
          title: 'Redundant .clone() on Borrowable Reference',
          description: 'Cloning data structure unnecessarily copies underlying heap allocations.',
          whyItMatters: 'Reduces memory efficiency and adds heap allocator overhead.',
          suggestedFix: 'Pass references `&str` or `&[T]` rather than taking ownership via clone.'
        }
      ]
    };

    // Select issues based on language, customized to code features
    let selectedIssues = languageIssues[lang] || languageIssues.Java;

    // Filter or adjust issues based on code characteristics
    if (!hasNestedLoops && selectedIssues.length > 0) {
      // If code doesn't have nested loops, make first issue about linear optimization or code style
      selectedIssues = selectedIssues.slice(1);
    }

    // Time & Space complexity calculation
    const timeComplexity = hasNestedLoops ? 'O(n²)' : hasRecursion ? 'O(2ⁿ)' : 'O(n)';
    const spaceComplexity = /map|hash|set|dict|alloc|make|vector/i.test(code) ? 'O(n)' : 'O(1)';
    const score = hasNestedLoops ? 82 : hasPointerLeak ? 74 : 88;

    // Optimized code generators per language
    const optimizedTemplates = {
      Java: `package com.example.algorithm;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Optimized implementation: O(n) Time, O(n) Space
 * Replaces O(n²) nested iteration with O(1) HashMap lookup.
 */
public class Solution {
    public int[] findPairs(int[] nums, int target) {
        Objects.requireNonNull(nums, "Input array cannot be null");
        
        // Lookup map stores: value -> index
        Map<Integer, Integer> seen = new HashMap<>(nums.length);
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,

      Python: `"""
Optimized implementation: O(n) Time, O(n) Space
Utilizes hash dictionary for O(1) complement lookup.
"""

def find_pairs(nums: list[int], target: int) -> tuple[int, int] | None:
    if not nums:
        return None
        
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return (seen[complement], i)
        seen[num] = i
        
    return None
`,

      C: `/**
 * Optimized implementation in ANSI C: O(n log n) or O(n) Time
 * Defends against buffer overflows and frees all allocated memory.
 */
#include <stdio.h>
#include <stdlib.h>

int* find_pairs_optimized(const int* nums, int size, int target, int* return_size) {
    if (!nums || size < 2 || !return_size) {
        if (return_size) *return_size = 0;
        return NULL;
    }

    // Allocate output tuple
    int* result = (int*)malloc(2 * sizeof(int));
    if (!result) {
        *return_size = 0;
        return NULL; // Allocation failure guard
    }

    // Linear two-pointer approach or auxiliary hash lookup
    *return_size = 2;
    result[0] = 0;
    result[1] = 1;
    return result;
}`,

      'C++': `#include <vector>
#include <unordered_map>
#include <optional>
#include <span>

/**
 * Optimized C++20 implementation: O(n) Time, O(n) Space
 * Replaces quadratic loops with std::unordered_map lookup.
 */
std::optional<std::pair<int, int>> findPairs(std::span<const int> nums, int target) {
    std::unordered_map<int, int> seen;
    seen.reserve(nums.size());

    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        int complement = target - nums[i];
        if (auto it = seen.find(complement); it != seen.end()) {
            return std::make_pair(it->second, i);
        }
        seen[nums[i]] = i;
    }
    return std::nullopt;
}`,

      JavaScript: `/**
 * Optimized ES6+ implementation: O(n) Time, O(n) Space
 * Replaces nested loops with a single-pass Map lookup.
 */
export function findPairs(nums = [], target = 0) {
  if (!Array.isArray(nums) || nums.length < 2) return [];

  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,

      TypeScript: `/**
 * Optimized TypeScript implementation: O(n) Time, O(n) Space
 * Type-safe single-pass map indexing with null-safety.
 */
export function findPairs(nums: readonly number[], target: number): [number, number] | null {
  if (!nums || nums.length < 2) return null;

  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    const match = seen.get(complement);
    if (match !== undefined) {
      return [match, i];
    }
    seen.set(nums[i], i);
  }
  return null;
}`,

      Go: `package algorithm

import "fmt"

// FindPairs achieves O(n) Time and O(n) Space using hash map
func FindPairs(nums []int, target int) ([]int, error) {
	if len(nums) < 2 {
		return nil, fmt.Errorf("insufficient slice length: %d", len(nums))
	}

	seen := make(map[int]int, len(nums))
	for i, num := range nums {
		complement := target - num
		if idx, found := seen[complement]; found {
			return []int{idx, i}, nil
		}
		seen[num] = i
	}
	return nil, nil
}`,

      Kotlin: `package com.example.algos

/**
 * Optimized Kotlin implementation: O(n) Time, O(n) Space
 * Idiomatic, null-safe hash indexing
 */
class Solution {
    fun findPairs(nums: IntArray, target: Int): IntArray? {
        val seen = HashMap<Int, Int>(nums.size)
        for (i in nums.indices) {
            val complement = target - nums[i]
            val prevIndex = seen[complement]
            if (prevIndex != null) {
                return intArrayOf(prevIndex, i)
            }
            seen[nums[i]] = i
        }
        return null
    }
}`,

      Rust: `use std::collections::HashMap;

/// Optimized Rust implementation: O(n) Time, O(n) Space
/// Zero unsafe blocks, idiomatic Option pattern
pub fn find_pairs(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    let mut seen = HashMap::with_capacity(nums.len());
    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&prev_idx) = seen.get(&complement) {
            return Some((prev_idx, i));
        }
        seen.insert(num, i);
    }
    None
}`
    };

    const optimizedCode = optimizedTemplates[lang] || optimizedTemplates.Java;

    const reviewResult = {
      reviewId: newId,
      id: newId,
      language: lang,
      fileName: fileName,
      file: fileName,
      project: submission.repository
        ? submission.repository.name || 'Repository'
        : 'Manual Code Review',
      repository: submission.repository
        ? `${submission.repository.owner || 'org'}/${submission.repository.name || 'repo'}`
        : 'Direct Input',
      branch: submission.branch || 'main',
      date: dateStr,
      score: score,
      overallScore: score,
      status: score >= 85 ? 'Passed' : 'Attention Needed',
      summary: `Analyzed ${fileName} (${lang}). Found ${selectedIssues.length} mentor observations. Algorithmic efficiency can be enhanced from ${timeComplexity} to O(n) linear execution.`,
      counts: {
        critical: selectedIssues.filter((i) => i.severity === 'CRITICAL' || i.severity === 'Critical').length,
        bugs: selectedIssues.filter((i) => i.category === 'BUGS' || i.category === 'Bugs').length,
        security: selectedIssues.filter((i) => i.category === 'SECURITY' || i.category === 'Security').length,
        performance: selectedIssues.filter((i) => i.category === 'PERFORMANCE' || i.category === 'Performance').length,
        complexity: 1,
        quality: selectedIssues.filter((i) => i.category === 'QUALITY' || i.category === 'Quality').length
      },
      timeComplexity: timeComplexity,
      spaceComplexity: spaceComplexity,
      complexity: {
        time: timeComplexity,
        space: spaceComplexity,
        explanation: `The analyzed implementation exhibits ${timeComplexity} time complexity due to iterative data lookups. Auxiliary space usage scales at ${spaceComplexity}.`,
        confidence: 'HIGH',
        optimizationAvailable: true,
        bottleneck: 'Sequential lookup loop over collection elements',
        suggestedApproach: 'Index inputs into an auxiliary hash map or dictionary to achieve O(1) lookups and O(n) total linear time.'
      },
      complexityAnalysis: {
        time: timeComplexity,
        space: spaceComplexity,
        timeExplanation: `Iterative lookups take ${timeComplexity} time complexity.`,
        spaceExplanation: `Auxiliary allocation scales at ${spaceComplexity}.`,
        bottleneckLine: selectedIssues[0]?.line || 18,
        isOptimal: timeComplexity === 'O(n)' || timeComplexity === 'O(1)',
        recommendedPattern: 'Replace nested loop iterations with a hash map complement index for O(1) amortized lookups.',
        comparisonTable: [
          {
            metric: 'Current Implementation',
            time: timeComplexity,
            space: spaceComplexity,
            throughput: '~390 ops/sec'
          },
          {
            metric: 'Mentor Recommendation',
            time: 'O(n)',
            space: 'O(n)',
            throughput: '~14,800 ops/sec'
          }
        ]
      },
      issues: selectedIssues,
      recommendations: [
        'Replace O(n²) nested loop lookups with a Hash Map to achieve O(1) average lookup speed.',
        `Enforce defensive validation on ${lang} inputs to prevent unexpected runtime panics.`,
        'Add comprehensive unit test coverage for edge cases, including empty and maximum-sized inputs.'
      ],
      optimizedCode: optimizedCode,
      codeContent: code,
      rawCode: code
    };

    // Cache review in memory and session storage
    if (!cachedReviews) {
      cachedReviews = (await fetchLocalJson('/json/mock-reviews.json', [])) || [];
    }
    cachedReviews.unshift(reviewResult);

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`review_${newId}`, JSON.stringify(reviewResult));
        const custom = JSON.parse(sessionStorage.getItem('custom_reviews') || '[]');
        custom.unshift(reviewResult);
        sessionStorage.setItem('custom_reviews', JSON.stringify(custom.slice(0, 30)));
      }
    } catch (e) {
      // Ignore storage errors in non-browser environments
    }

    return reviewResult;
  },

  /**
   * Retrieves all reviews with optional filtering
   */
  async getReviews(filters = {}) {
    if (!cachedReviews) {
      cachedReviews = (await fetchLocalJson('/json/mock-reviews.json', [])) || [];
    }

    let list = [...cachedReviews];

    // Include custom reviews from session storage
    try {
      if (typeof sessionStorage !== 'undefined') {
        const custom = JSON.parse(sessionStorage.getItem('custom_reviews') || '[]');
        custom.forEach((c) => {
          if (!list.some((r) => (r.id || r.reviewId) === (c.id || c.reviewId))) {
            list.unshift(c);
          }
        });
      }
    } catch (e) {
      // Ignore storage errors
    }

    // Apply filters
    if (filters.language && filters.language !== 'ALL') {
      list = list.filter(
        (r) => (r.language || '').toLowerCase() === filters.language.toLowerCase()
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.file || r.fileName || '').toLowerCase().includes(q) ||
          (r.project || '').toLowerCase().includes(q) ||
          (r.repository || '').toLowerCase().includes(q) ||
          (r.language || '').toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Retrieves a review by its ID
   */
  async getReviewById(id) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem(`review_${id}`);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore storage errors
    }

    const reviews = await this.getReviews();
    const found = reviews.find((r) => (r.id || r.reviewId) === id);
    if (found) return found;

    // Fallback to first review or a safe synthesized review
    return (
      reviews[0] ||
      (await this.analyzeCode({
        language: 'Java',
        fileName: 'Solution.java',
        code: CODE_TEMPLATES.Java
      }))
    );
  },

  /**
   * Retrieves all connected repositories
   */
  async getRepositories() {
    if (!cachedRepositories) {
      cachedRepositories = (await fetchLocalJson('/json/mock-repositories.json', [])) || [];
    }
    return cachedRepositories;
  },

  /**
   * Retrieves a single repository by ID
   */
  async getRepositoryById(id) {
    const repos = await this.getRepositories();
    return repos.find((r) => r.id === id) || repos[0] || null;
  },

  /**
   * Retrieves branches for a repository
   */
  async getRepositoryBranches(id) {
    const repo = await this.getRepositoryById(id);
    return repo?.branches || ['main', 'develop'];
  },

  /**
   * Retrieves files for a repository branch
   */
  async getRepositoryFiles(id, branch = 'main') {
    const repo = await this.getRepositoryById(id);
    return repo?.files || [];
  },

  /**
   * Retrieves dashboard statistics
   */
  async getDashboardStats() {
    if (!cachedStats) {
      cachedStats = (await fetchLocalJson('/json/mock-stats.json', {
        totalReviews: 48,
        averageCodeQuality: 88,
        bugsDetected: 14,
        securityIssues: 4,
        performanceIssues: 12,
        mostReviewedLanguage: 'Java',
        activeRepositories: 8,
        linesReviewed: '142.8k',
        codeHealth: 87,
        healthStatusText: 'Good Code Health',
        averageComplexity: 'O(n log n)'
      })) || {};
    }
    return cachedStats;
  },

  /**
   * Retrieves complexity case studies library
   */
  async getComplexityLibrary() {
    if (!cachedComplexity) {
      cachedComplexity = (await fetchLocalJson('/json/mock-complexity.json', [])) || [];
    }
    return cachedComplexity;
  }
};
