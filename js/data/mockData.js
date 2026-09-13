/**
 * AI Code Reviewer - Mock Data Store
 * Structured to represent future Spring Boot REST API entities.
 */

export const mockStats = {
  totalReviews: 48,
  criticalIssues: 3,
  securityIssues: 1,
  averageCodeQuality: 87,
  averageComplexity: "O(n log n)",
  codeHealth: 87,
  healthStatusText: "Your code is looking healthy. A few optimizations recommended.",
  reviewsThisMonth: 19,
  qualityTrend: "+4.2% from last month"
};

export const mockRepositories = [
  {
    id: "repo-101",
    name: "ecommerce-checkout-service",
    owner: "org-fintech",
    defaultBranch: "main",
    language: "Java",
    lastReviewed: "2026-09-12 14:30",
    healthScore: 89,
    openIssues: 3,
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    status: "Active"
  },
  {
    id: "repo-102",
    name: "auth-gateway-proxy",
    owner: "org-fintech",
    defaultBranch: "master",
    language: "Go",
    lastReviewed: "2026-09-11 09:15",
    healthScore: 78,
    openIssues: 5,
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    status: "Attention Needed"
  },
  {
    id: "repo-103",
    name: "dsa-algorithm-lab",
    owner: "rajesh-panwar",
    defaultBranch: "main",
    language: "Python",
    lastReviewed: "2026-09-10 18:40",
    healthScore: 94,
    openIssues: 1,
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    status: "Healthy"
  },
  {
    id: "repo-104",
    name: "order-processing-pipeline",
    owner: "org-fintech",
    defaultBranch: "main",
    language: "TypeScript",
    lastReviewed: "2026-09-09 11:20",
    healthScore: 84,
    openIssues: 4,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    status: "Active"
  },
  {
    id: "repo-105",
    name: "distributed-cache-client",
    owner: "org-infra",
    defaultBranch: "main",
    language: "Rust",
    lastReviewed: "2026-09-08 16:55",
    healthScore: 96,
    openIssues: 0,
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    status: "Healthy"
  },
  {
    id: "repo-106",
    name: "user-recommendation-engine",
    owner: "org-ai-labs",
    defaultBranch: "develop",
    language: "Python",
    lastReviewed: "2026-09-06 20:10",
    healthScore: 68,
    openIssues: 7,
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    status: "Attention Needed"
  }
];

export const mockReviews = [
  {
    id: "REV-2041",
    project: "Order Processing Engine",
    repository: "order-processing-pipeline",
    branch: "main",
    file: "src/services/OrderProcessor.ts",
    language: "TypeScript",
    date: "2026-09-12 10:45",
    overallScore: 87,
    status: "Completed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    counts: {
      bugs: 1,
      security: 0,
      quality: 2,
      performance: 1,
      suggestions: 1
    },
    complexityAnalysis: {
      timeComplexity: "O(n²)",
      timeBestCase: "O(n)",
      timeAverageCase: "O(n²)",
      timeWorstCase: "O(n²)",
      spaceComplexity: "O(1) auxiliary",
      summaryExplanation: "The nested loop iterates through the entire discount catalog for each line item in the customer order, resulting in quadratic O(n²) time complexity. Auxiliary memory usage remains O(1) as no supplementary data structures are allocated.",
      contributingParts: [
        { line: 42, label: "Outer Loop: Iterates over order.items (size n)" },
        { line: 45, label: "Inner Loop: Linear scan through applicableDiscounts array (size m)" }
      ],
      comparison: {
        current: {
          time: "O(n²)",
          space: "O(1)",
          description: "Brute-force iteration over discounts for every line item. Becomes a severe bottleneck when order volume or discount matrices scale."
        },
        optimized: {
          time: "O(n)",
          space: "O(n)",
          description: "Index the discount matrix into a Map<string, DiscountRule> beforehand. Item lookups then become O(1), bringing total time down to linear O(n)."
        },
        tradeoffExplanation: "Using a Map trades O(k) additional auxiliary memory (where k is unique discount rules) to replace repeated O(n) lookups with instantaneous O(1) key lookups, yielding a 94% execution latency improvement on realistic payloads."
      }
    },
    codeContent: `import { Order, OrderItem, DiscountRule, CalculationResult } from '../types';

export class OrderProcessor {
  private taxRate: number = 0.0825;

  /**
   * Processes cart items, verifies inventory, and applies best matching discounts.
   */
  public calculateTotal(order: Order, discounts: DiscountRule[]): CalculationResult {
    if (!order || !order.items || order.items.length === 0) {
      return { subtotal: 0, tax: 0, discount: 0, total: 0 };
    }

    let subtotal = 0;
    let totalDiscount = 0;

    // Calculate base item totals
    for (const item of order.items) {
      subtotal += item.price * item.quantity;
    }

    // LINE 24: Potential Null Pointer when accessing customer metadata
    const userTier = order.customer.tier.toLowerCase();
    
    // LINE 32: Inefficient repeated string concatenation in logging
    let debugLog = "";
    for (let i = 0; i < order.items.length; i++) {
      debugLog = debugLog + "Item #" + i + ": " + order.items[i].sku + "; ";
    }

    // LINE 42: O(n²) Nested Loop Bottleneck
    for (const item of order.items) {
      for (const discount of discounts) {
        if (discount.applicableSku === item.sku && discount.active) {
          totalDiscount += (item.price * discount.percentage) / 100;
        }
      }
    }

    // LINE 54: Floating-point precision error risk
    const rawTax = (subtotal - totalDiscount) * this.taxRate;
    const finalTotal = subtotal - totalDiscount + rawTax;

    return {
      subtotal,
      discount: totalDiscount,
      tax: Math.round(rawTax * 100) / 100,
      total: Math.round(finalTotal * 100) / 100
    };
  }
}`,
    issues: [
      {
        id: "ISSUE-1",
        severity: "CRITICAL",
        category: "Bug Detection",
        line: 24,
        title: "Unsafe Property Access on Customer Object",
        summary: "Direct property access on customer.tier without nullish verification.",
        mentorExplanation: {
          whatIsWrong: "The code assumes order.customer and order.customer.tier are always populated. If an anonymous or guest order is processed, order.customer is null or undefined, throwing an unhandled TypeError: Cannot read properties of undefined.",
          whyItMatters: "In e-commerce checkout flows, guest orders without populated user tiers account for over 35% of cart completions. This uncaught exception immediately crashes the checkout pipeline and drops valid customer purchases.",
          howToImprove: "Use optional chaining (order.customer?.tier?.toLowerCase()) with a safe fallback to 'guest'.",
          whatWillChange: "Guest checkouts succeed cleanly without runtime exceptions, preserving customer conversion.",
          expectedComplexity: "Time: O(1), Space: O(1) (No change in algorithmic complexity, prevents fatal runtime crash)."
        },
        codeFix: `- const userTier = order.customer.tier.toLowerCase();\n+ const userTier = order.customer?.tier?.toLowerCase() ?? 'standard';`
      },
      {
        id: "ISSUE-2",
        severity: "MEDIUM",
        category: "Complexity & Performance",
        line: 42,
        title: "Nested Loop Leads to Quadratic O(n²) Time Complexity",
        summary: "Inner loop scans discounts array for every individual order item.",
        mentorExplanation: {
          whatIsWrong: "For every single item in order.items (size n), the inner loop iterates over the discounts array (size m). This causes n * m comparisons, scaling quadratically O(n²).",
          whyItMatters: "As inventory catalogs and promotional discount lists expand, checkout response times degrade significantly from ~12ms to over 850ms, causing UI lag and timeout errors under peak flash-sale traffic.",
          howToImprove: "Pre-index the discounts array into a Map keyed by applicableSku before processing items. Then lookup each item's discount in O(1) constant time.",
          whatWillChange: "Replaces the inner search loop with an instant Map lookup, dropping execution time from O(n * m) to linear O(n + m).",
          expectedComplexity: "Time improves from O(n²) to O(n). Auxiliary space increases slightly from O(1) to O(m) for the Map hash index."
        },
        codeFix: `+ const discountMap = new Map(discounts.filter(d => d.active).map(d => [d.applicableSku, d]));\n+ for (const item of order.items) {\n+   const match = discountMap.get(item.sku);\n+   if (match) totalDiscount += (item.price * match.percentage) / 100;\n+ }`
      },
      {
        id: "ISSUE-3",
        severity: "LOW",
        category: "Code Quality",
        line: 32,
        title: "Repeated String Concatenation Inside Loop",
        summary: "Strings are immutable; concatenating in a loop causes unnecessary memory allocations.",
        mentorExplanation: {
          whatIsWrong: "Strings in JavaScript/TypeScript are immutable. Reassigning debugLog = debugLog + ... creates a new intermediate string buffer in the memory heap on every loop iteration.",
          whyItMatters: "For large orders with hundreds of line items, this produces high Garbage Collection (GC) churn and avoidable heap thrashing.",
          howToImprove: "Collect log tokens into an array and join them once with .join('; '), or use standard structured telemetry logging.",
          whatWillChange: "Reduces memory allocations from O(n) string copies to a single streamlined buffer join.",
          expectedComplexity: "Time: O(n), Space: O(n) with significantly lower GC pressure."
        },
        codeFix: `- let debugLog = "";\n- for (let i = 0; i < order.items.length; i++) {\n-   debugLog = debugLog + "Item #" + i + ": " + order.items[i].sku + "; ";\n- }\n+ const debugLog = order.items.map((it, i) => \`Item #\${i}: \${it.sku}\`).join('; ');`
      },
      {
        id: "ISSUE-4",
        severity: "SUGGESTION",
        category: "Best Practices",
        line: 54,
        title: "Floating-Point Currency Arithmetic",
        summary: "IEEE 754 floating-point numbers can accumulate rounding inaccuracies in financial calculations.",
        mentorExplanation: {
          whatIsWrong: "Standard JavaScript number types use double-precision float representation (64-bit IEEE 754). Multiplying decimals like 0.1 * 0.2 produces 0.020000000000000004.",
          whyItMatters: "In financial transactions and tax ledgers, sub-cent discrepancies cause audit mismatches, reconciliation errors, and Stripe/payment gateway validation rejections.",
          howToImprove: "Represent monetary values as integer cents (e.g. $19.99 = 1999 cents) or utilize a dedicated high-precision BigNumber library.",
          whatWillChange: "Guarantees 100% mathematical precision across all currency calculations.",
          expectedComplexity: "Time: O(1), Space: O(1)."
        },
        codeFix: `// Best Practice: Represent monetary balances in integer cents\nconst subtotalCents = Math.round(subtotal * 100);\nconst discountCents = Math.round(totalDiscount * 100);\nconst taxCents = Math.round((subtotalCents - discountCents) * this.taxRate);`
      }
    ]
  },
  {
    id: "REV-2040",
    project: "Auth Gateway",
    repository: "auth-gateway-proxy",
    branch: "master",
    file: "pkg/jwt/verifier.go",
    language: "Go",
    date: "2026-09-11 14:10",
    overallScore: 78,
    status: "Attention Needed",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    counts: { bugs: 0, security: 1, quality: 3, performance: 1, suggestions: 1 },
    complexityAnalysis: {
      timeComplexity: "O(1)",
      timeBestCase: "O(1)",
      timeAverageCase: "O(1)",
      timeWorstCase: "O(1)",
      spaceComplexity: "O(1)",
      summaryExplanation: "The JWT verification pipeline relies on constant-time cryptographic hash operations and constant-length signature validation.",
      contributingParts: [
        { line: 28, label: "HMAC-SHA256 signature verification" }
      ],
      comparison: {
        current: { time: "O(1)", space: "O(1)", description: "Cryptographic constant time" },
        optimized: { time: "O(1)", space: "O(1)", description: "Add in-memory token cache for verified public keys" },
        tradeoffExplanation: "Caching decoded public keys reduces JWKS endpoint fetching overhead while preserving O(1) runtime."
      }
    }
  },
  {
    id: "REV-2039",
    project: "DSA Algorithms",
    repository: "dsa-algorithm-lab",
    branch: "main",
    file: "src/algorithms/search/binary_search.py",
    language: "Python",
    date: "2026-09-10 11:25",
    overallScore: 94,
    status: "Completed",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    counts: { bugs: 0, security: 0, quality: 1, performance: 0, suggestions: 1 },
    complexityAnalysis: {
      timeComplexity: "O(log n)",
      timeBestCase: "O(1)",
      timeAverageCase: "O(log n)",
      timeWorstCase: "O(log n)",
      spaceComplexity: "O(1)",
      summaryExplanation: "Binary search halves the search range on every iteration, leading to logarithmic O(log n) time complexity with constant O(1) pointers.",
      contributingParts: [
        { line: 14, label: "Midpoint calculation and range halving while left <= right" }
      ],
      comparison: {
        current: { time: "O(log n)", space: "O(1)", description: "Optimal iterative binary search" },
        optimized: { time: "O(log n)", space: "O(1)", description: "Prevent integer overflow on mid calculation" },
        tradeoffExplanation: "Calculating mid as left + (right - left) // 2 prevents potential 32-bit integer overflow while maintaining O(log n)."
      }
    }
  },
  {
    id: "REV-2038",
    project: "User Recommendation Engine",
    repository: "user-recommendation-engine",
    branch: "develop",
    file: "src/recommender/collaborative_filter.py",
    language: "Python",
    date: "2026-09-08 17:30",
    overallScore: 68,
    status: "Attention Needed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    counts: { bugs: 2, security: 0, quality: 3, performance: 2, suggestions: 2 },
    complexityAnalysis: {
      timeComplexity: "O(n²)",
      timeBestCase: "O(n)",
      timeAverageCase: "O(n²)",
      timeWorstCase: "O(n²)",
      spaceComplexity: "O(n)",
      summaryExplanation: "Compares every user preference vector against all other user vectors pairwise without vectorization or indexing.",
      contributingParts: [
        { line: 36, label: "Double loop calculating cosine similarity across all pairs" }
      ],
      comparison: {
        current: { time: "O(n²)", space: "O(n)", description: "Pairwise brute force cosine comparisons" },
        optimized: { time: "O(n log n)", space: "O(n)", description: "Approximate Nearest Neighbors (ANN) via FAISS / HNSW index" },
        tradeoffExplanation: "Using an Approximate Nearest Neighbor index drops retrieval time from quadratic to sub-linear with negligible loss in recommendation accuracy."
      }
    }
  },
  {
    id: "REV-2037",
    project: "Distributed Cache Client",
    repository: "distributed-cache-client",
    branch: "main",
    file: "src/ring/consistent_hash.rs",
    language: "Rust",
    date: "2026-09-07 14:15",
    overallScore: 96,
    status: "Completed",
    timeComplexity: "O(log v)",
    spaceComplexity: "O(v)",
    counts: { bugs: 0, security: 0, quality: 0, performance: 0, suggestions: 1 },
    complexityAnalysis: {
      timeComplexity: "O(log v)",
      timeBestCase: "O(1)",
      timeAverageCase: "O(log v)",
      timeWorstCase: "O(log v)",
      spaceComplexity: "O(v) where v = virtual nodes",
      summaryExplanation: "Binary search along the consistent hash ring of virtual nodes achieves logarithmic O(log v) lookup time with O(v) memory.",
      contributingParts: [
        { line: 48, label: "BTreeMap range query to find node on hash ring" }
      ],
      comparison: {
        current: { time: "O(log v)", space: "O(v)", description: "Balanced tree lookup" },
        optimized: { time: "O(1)", space: "O(v)", description: "Jump consistent hash algorithm for bounded clusters" },
        tradeoffExplanation: "Jump hash eliminates the need to store a ring table at the cost of requiring sequential node ID indexing."
      }
    }
  }
];

export const mockComplexityLibrary = [
  {
    name: "Two Sum Problem",
    category: "Array & Hash Tables",
    difficulty: "Easy to Medium",
    currentApproach: {
      title: "Nested Loops (Brute Force)",
      time: "O(n²)",
      space: "O(1)",
      description: "For every number, scan the rest of the array to find its complement. Simple to reason about, but scales poorly on large inputs."
    },
    optimizedApproach: {
      title: "Hash Map Single-Pass",
      time: "O(n)",
      space: "O(n)",
      description: "Store previously visited elements and their indices in a hash map. Instant O(1) complement lookup reduces time complexity to linear O(n)."
    },
    explanation: "Trading auxiliary space O(n) for a hash table unlocks constant-time lookup, transforming an unscalable O(n²) quadratic runtime into clean linear O(n) performance.",
    codeExample: `// Brute Force: O(n²) Time, O(1) Space\nfor (let i = 0; i < nums.length; i++) {\n  for (let j = i + 1; j < nums.length; j++) {\n    if (nums[i] + nums[j] === target) return [i, j];\n  }\n}\n\n// Optimized: O(n) Time, O(n) Space\nconst seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (seen.has(complement)) return [seen.get(complement), i];\n  seen.set(nums[i], i);\n}`
  },
  {
    name: "Fibonacci Sequence",
    category: "Dynamic Programming",
    difficulty: "Easy",
    currentApproach: {
      title: "Naive Recursion",
      time: "O(2ⁿ)",
      space: "O(n) call stack",
      description: "Calls fib(n-1) + fib(n-2) recursively, recalculating the same sub-problems exponentially many times."
    },
    optimizedApproach: {
      title: "Bottom-Up Dynamic Programming",
      time: "O(n)",
      space: "O(1)",
      description: "Iterate from 2 to n keeping track of only the two most recent values. Eliminates redundant work completely."
    },
    explanation: "Naive recursion creates an exponential call tree with massive duplicate work. Memoization or constant-space iteration flattens execution into single linear O(n) passes.",
    codeExample: `// Naive Recursion: O(2ⁿ) Time, O(n) Stack Space\nfunction fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}\n\n// Iterative DP: O(n) Time, O(1) Auxiliary Space\nfunction fibOptimized(n) {\n  if (n <= 1) return n;\n  let prev = 0, curr = 1;\n  for (let i = 2; i <= n; i++) {\n    const next = prev + curr;\n    prev = curr;\n    curr = next;\n  }\n  return curr;\n}`
  },
  {
    name: "Search in Sorted Dataset",
    category: "Searching Algorithms",
    difficulty: "Fundamental",
    currentApproach: {
      title: "Linear Search",
      time: "O(n)",
      space: "O(1)",
      description: "Iterate through items sequentially from index 0 until target matches or end of array is reached."
    },
    optimizedApproach: {
      title: "Binary Search",
      time: "O(log n)",
      space: "O(1)",
      description: "Leverage sorted property by probing midpoint and discarding half the search space every step."
    },
    explanation: "For a list of 1,000,000 elements, linear search takes up to 1,000,000 checks. Binary search requires at most 20 comparisons (log₂ 1,000,000 ≈ 19.93).",
    codeExample: `// Binary Search: O(log n) Time, O(1) Space\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor(left + (right - left) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`
  },
  {
    name: "Longest Substring Without Repeating Characters",
    category: "Sliding Window & Hash Sets",
    difficulty: "Medium",
    currentApproach: {
      title: "All Substrings Check (Brute Force)",
      time: "O(n³)",
      space: "O(min(n, m))",
      description: "Generate all possible substrings (O(n²)) and verify distinct characters for each substring (O(n))."
    },
    optimizedApproach: {
      title: "Sliding Window with Hash Map",
      time: "O(n)",
      space: "O(min(n, m))",
      description: "Maintain a sliding window [start...end]. When a repeat character is seen, slide start pointer past its previous occurrence."
    },
    explanation: "The sliding window pattern processes each character at most twice (once entering the window, once exiting), turning a cubic O(n³) brute force into smooth linear O(n).",
    codeExample: `// Sliding Window: O(n) Time, O(k) Space\nfunction lengthOfLongestSubstring(s) {\n  const charMap = new Map();\n  let maxLen = 0, start = 0;\n  for (let end = 0; end < s.length; end++) {\n    const char = s[end];\n    if (charMap.has(char) && charMap.get(char) >= start) {\n      start = charMap.get(char) + 1;\n    }\n    charMap.set(char, end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}`
  }
];

export const mockSettings = {
  profile: {
    fullName: "Rajesh Panwar",
    email: "raj.panwar1608@gmail.com",
    role: "Staff Software Engineer",
    organization: "Fintech Platform Engineering",
    avatarInitials: "RP"
  },
  github: {
    connected: true,
    username: "rajesh-panwar",
    accountType: "Organization Member",
    linkedRepositories: 6,
    lastSynced: "Today, 10:20 AM"
  },
  preferences: {
    autoAnalyzeOnPush: true,
    complexityAlertThreshold: "O(n²)",
    minimumCodeQualityScore: 80,
    notifyOnCritical: true,
    notifyOnSecurity: true,
    weeklySummaryDigest: true,
    theme: "light",
    strictMentorMode: true
  }
};
