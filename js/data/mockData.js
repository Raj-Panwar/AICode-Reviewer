/**
 * AI Code Reviewer - Mock Data Store
 * Realistic, enterprise-grade mock data for static code analysis,
 * Big-O algorithmic audits, repositories, and reviews across 9 languages:
 * Java, Python, C, C++, JavaScript, TypeScript, Go, Kotlin, Rust.
 */

export const mockDashboardMetrics = {
  totalReviews: 48,
  codeQualityScore: 88,
  criticalIssuesResolved: 32,
  avgTimeComplexity: "O(n log n)",
  monthlyImprovement: "+14%",
  openVulnerabilities: 3,
  activeRepositories: 8,
  linesReviewed: "142.8k"
};

export const mockStats = {
  totalReviews: 48,
  criticalIssues: 4,
  securityIssues: 1,
  averageCodeQuality: 88,
  averageComplexity: "O(n log n)",
  codeHealth: 87,
  healthStatusText: "Good Code Health",
  activeRepositories: 8,
  linesReviewed: "142.8k"
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
    status: "Active",
    branches: ["main", "develop", "feature/payment-v2"],
    files: [
      {
        name: "PaymentProcessor.java",
        path: "src/main/java/com/fintech/checkout/PaymentProcessor.java",
        language: "Java",
        size: "3.4 KB",
        code: `package com.fintech.checkout;

import java.math.BigDecimal;
import java.util.*;

public class PaymentProcessor {
    private final Map<String, BigDecimal> customerWallets = new HashMap<>();

    public boolean processTransaction(String customerId, BigDecimal amount, List<String> discountCodes) {
        // Warning: Missing null check on customerId
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        BigDecimal discount = BigDecimal.ZERO;
        // O(n²) nested discount search anti-pattern
        for (String code : discountCodes) {
            for (Map.Entry<String, BigDecimal> entry : customerWallets.entrySet()) {
                if (entry.getKey().contains(code)) {
                    discount = discount.add(entry.getValue().multiply(BigDecimal.valueOf(0.05)));
                }
            }
        }

        BigDecimal finalAmount = amount.subtract(discount);
        return customerWallets.containsKey(customerId);
    }
}`
      },
      {
        name: "DiscountEngine.java",
        path: "src/main/java/com/fintech/checkout/DiscountEngine.java",
        language: "Java",
        size: "2.1 KB",
        code: `package com.fintech.checkout;

import java.util.List;

public class DiscountEngine {
    public double calculateRebate(List<Double> cartAmounts) {
        double sum = 0.0;
        for (Double amt : cartAmounts) {
            sum += amt;
        }
        return sum > 100.0 ? sum * 0.1 : 0.0;
    }
}`
      }
    ]
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
    status: "Attention Needed",
    branches: ["master", "staging", "fix/jwt-expiry"],
    files: [
      {
        name: "verifier.go",
        path: "pkg/jwt/verifier.go",
        language: "Go",
        size: "2.8 KB",
        code: `package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"errors"
	"time"
)

type TokenClaims struct {
	Subject   string
	ExpiresAt int64
}

// VerifySignature performs constant-time HMAC check
func VerifySignature(token string, secret []byte, expectedSig []byte) (bool, error) {
	if len(token) == 0 {
		return false, errors.New("empty token header")
	}

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(token))
	calculatedSig := mac.Sum(nil)

	// Constant-time comparison defends against timing attacks
	if !hmac.Equal(calculatedSig, expectedSig) {
		return false, errors.New("signature mismatch")
	}

	return true, nil
}`
      }
    ]
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
    status: "Healthy",
    branches: ["main", "feat/graph-algos"],
    files: [
      {
        name: "binary_search.py",
        path: "src/algorithms/search/binary_search.py",
        language: "Python",
        size: "1.9 KB",
        code: `def binary_search(arr: list[int], target: int) -> int:
    """O(log n) Time, O(1) Space search in sorted array."""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1`
      },
      {
        name: "two_sum_solution.py",
        path: "src/algorithms/search/two_sum_solution.py",
        language: "Python",
        size: "1.4 KB",
        code: `def two_sum_quadratic(nums: list[int], target: int) -> list[int]:
    """Quadratic brute force O(n²) comparison."""
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`
      }
    ]
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
    status: "Active",
    branches: ["main", "develop", "feature/optimize-order-processing"],
    files: [
      {
        name: "OrderProcessor.ts",
        path: "src/services/OrderProcessor.ts",
        language: "TypeScript",
        size: "4.2 KB",
        code: `export interface OrderItem {
  id: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface CustomerOrder {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  currency: string;
}

export class OrderProcessor {
  private taxRateMap = new Map<string, number>([
    ['US-CA', 0.0925],
    ['US-NY', 0.0887],
    ['EU-DE', 0.19]
  ]);

  public calculateTotal(order: CustomerOrder, jurisdiction: string): number {
    let subtotal = 0;
    
    // Iterating items to compute subtotal
    for (const item of order.items) {
      if (item.price < 0 || item.quantity <= 0) {
        throw new Error(\`Invalid item params for SKU: \${item.sku}\`);
      }
      subtotal += item.price * item.quantity;
    }

    const rate = this.taxRateMap.get(jurisdiction) || 0;
    return subtotal * (1 + rate);
  }
}`
      }
    ]
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
    status: "Healthy",
    branches: ["main", "dev"],
    files: [
      {
        name: "consistent_hash.rs",
        path: "src/ring/consistent_hash.rs",
        language: "Rust",
        size: "3.1 KB",
        code: `use std::collections::BTreeMap;

pub struct ConsistentHashRing {
    nodes: BTreeMap<u64, String>,
    replicas: usize,
}

impl ConsistentHashRing {
    pub fn new(replicas: usize) -> Self {
        Self {
            nodes: BTreeMap::new(),
            replicas,
        }
    }

    pub fn get_node(&self, hash_key: u64) -> Option<&String> {
        if self.nodes.is_empty() {
            return None;
        }

        // Binary search log(n) on ordered BTreeMap ring
        match self.nodes.range(hash_key..).next() {
            Some((_, node)) => Some(node),
            None => self.nodes.iter().next().map(|(_, node)| node),
        }
    }
}`
      }
    ]
  },
  {
    id: "repo-106",
    name: "embedded-telemetry-driver",
    owner: "org-iot",
    defaultBranch: "main",
    language: "C",
    lastReviewed: "2026-09-07 14:10",
    healthScore: 82,
    openIssues: 3,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    status: "Active",
    branches: ["main", "v1.2-maint"],
    files: [
      {
        name: "buffer_pool.c",
        path: "src/driver/buffer_pool.c",
        language: "C",
        size: "2.4 KB",
        code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BUFFERS 64
#define BUFFER_SIZE 512

typedef struct {
    char data[BUFFER_SIZE];
    int in_use;
} MemoryBlock;

static MemoryBlock pool[MAX_BUFFERS];

int allocate_block(const char* payload, size_t len) {
    if (len >= BUFFER_SIZE) return -1; // Bounds protection

    // Linear O(n) search for first available block
    for (int i = 0; i < MAX_BUFFERS; i++) {
        if (!pool[i].in_use) {
            pool[i].in_use = 1;
            memcpy(pool[i].data, payload, len);
            pool[i].data[len] = '\\0';
            return i;
        }
    }
    return -2; // Out of memory
}`
      }
    ]
  },
  {
    id: "repo-107",
    name: "realtime-matching-engine",
    owner: "org-fintech",
    defaultBranch: "main",
    language: "C++",
    lastReviewed: "2026-09-06 18:20",
    healthScore: 76,
    openIssues: 4,
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    status: "Attention Needed",
    branches: ["main", "experimental"],
    files: [
      {
        name: "order_book.cpp",
        path: "src/engine/order_book.cpp",
        language: "C++",
        size: "3.7 KB",
        code: `#include <iostream>
#include <vector>
#include <algorithm>

struct Order {
    int id;
    double price;
    int quantity;
    bool is_buy;
};

class OrderBook {
private:
    std::vector<Order> buy_orders;
    std::vector<Order> sell_orders;

public:
    void cancel_order(int order_id) {
        // O(n) scan with vector erase causing O(n) shift
        for (auto it = buy_orders.begin(); it != buy_orders.end(); ++it) {
            if (it->id == order_id) {
                buy_orders.erase(it);
                return;
            }
        }
    }
};`
      }
    ]
  },
  {
    id: "repo-108",
    name: "mobile-android-client",
    owner: "org-mobile",
    defaultBranch: "main",
    language: "Kotlin",
    lastReviewed: "2026-09-05 12:45",
    healthScore: 91,
    openIssues: 2,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    status: "Healthy",
    branches: ["main", "release/2.4"],
    files: [
      {
        name: "AccountRepository.kt",
        path: "app/src/main/kotlin/com/fintech/app/AccountRepository.kt",
        language: "Kotlin",
        size: "2.6 KB",
        code: `package com.fintech.app

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class UserAccount(val id: String, val balance: Double, val tier: String)

class AccountRepository {
    private val accounts = mutableListOf<UserAccount>()

    suspend fun getAccountById(id: String): UserAccount? = withContext(Dispatchers.IO) {
        // Linear O(n) lookup across in-memory cache
        accounts.find { it.id == id }
    }

    fun addAccount(account: UserAccount) {
        accounts.add(account)
    }
}`
      }
    ]
  },
  {
    id: "repo-109",
    name: "web-dashboard-fe",
    owner: "org-web",
    defaultBranch: "main",
    language: "JavaScript",
    lastReviewed: "2026-09-04 16:30",
    healthScore: 85,
    openIssues: 3,
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    status: "Active",
    branches: ["main", "feat/charts"],
    files: [
      {
        name: "dataAggregator.js",
        path: "src/analytics/dataAggregator.js",
        language: "JavaScript",
        size: "2.3 KB",
        code: `// Analytics metrics aggregator
export function aggregateUserSessions(events, targetUserId) {
  // Quadratic O(n²) filter with inner array scan
  const userEvents = events.filter((ev) => {
    return ev.userId === targetUserId && events.indexOf(ev) >= 0;
  });

  const summary = {
    totalDuration: 0,
    pageViews: 0
  };

  userEvents.forEach(e => {
    summary.totalDuration += (e.duration || 0);
    summary.pageViews += 1;
  });

  return summary;
}`
      }
    ]
  }
];

export const mockReviews = [
  // 1. TypeScript Review
  {
    id: "REV-2041",
    project: "order-processing-pipeline",
    repository: "org-fintech/order-processing-pipeline",
    branch: "feature/optimize-order-processing",
    file: "src/services/OrderProcessor.ts",
    language: "TypeScript",
    date: "2026-09-13 10:14",
    overallScore: 84,
    status: "Attention Needed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    counts: {
      critical: 1,
      bugs: 2,
      security: 1,
      performance: 2,
      complexity: 1,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n²)",
      space: "O(n)",
      timeExplanation: "Nested iterations over order items and discount rules create quadratic time complexity O(n * m) where n is order items and m is discounts.",
      spaceExplanation: "Allocates auxiliary intermediate maps for discount verification.",
      bottleneckLine: 34,
      isOptimal: false,
      recommendedPattern: "Hash Map complement index for constant O(1) discount validation, reducing total runtime to clean linear O(n).",
      comparisonTable: [
        { metric: "Current Implementation", time: "O(n²)", space: "O(n)", throughput: "~420 ops/sec" },
        { metric: "Mentor Recommendation", time: "O(n)", space: "O(n)", throughput: "~12,500 ops/sec" }
      ]
    },
    codeContent: `import { Injectable, Logger } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { InventoryService } from './inventory.service';
import { OrderDto, ProcessedOrderResult, DiscountRule } from '../dto/order.dto';

@Injectable()
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  public async processOrder(order: OrderDto): Promise<ProcessedOrderResult> {
    const customer = await this.customerRepo.findById(order.customerId);
    
    // Issue 1: Missing null check on customer before accessing property
    this.logger.log(\`Processing order for customer status: \${customer.membershipTier}\`);

    // Issue 2: Hardcoded credentials fallback
    const apiKey = process.env.PAYMENT_GATEWAY_KEY || "test_sk_live_9941a8b72c";

    let finalTotal = 0;

    // Issue 3: Inefficient O(n * m) nested iteration
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      let itemDiscount = 0;

      // Nested scan across active promotional discounts
      for (let j = 0; j < order.activeDiscounts.length; j++) {
        const discount = order.activeDiscounts[j];
        if (discount.applicableCategory === item.category) {
          itemDiscount += discount.percentage;
        }
      }

      const discountedPrice = item.price * (1 - itemDiscount);
      finalTotal += discountedPrice * item.quantity;
    }

    return {
      orderId: order.id,
      finalAmount: finalTotal,
      processedAt: new Date().toISOString()
    };
  }
}`,
    issues: [
      {
        id: "ISSUE-101",
        line: 18,
        category: "Bugs",
        severity: "Critical",
        title: "Potential Null Pointer Dereference on Customer Entity",
        description: "customerRepo.findById can resolve to null when the customerId is invalid or soft-deleted. Accessing customer.membershipTier directly on line 18 throws an unhandled TypeError in production.",
        whyItMatters: "If an anonymous user or deleted customer submits a checkout, this causes a 500 Internal Server Error crash instead of a graceful 404/422 validation response.",
        suggestedFix: `if (!customer) {
  throw new NotFoundException(\`Customer with ID \${order.customerId} does not exist\`);
}`
      },
      {
        id: "ISSUE-102",
        line: 21,
        category: "Security",
        severity: "Critical",
        title: "Hardcoded Secret Fallback in Source Code",
        description: "Found fallback payment gateway key string in source code. Fallback secrets can easily leak into client bundles, log files, or public repositories.",
        whyItMatters: "Exposes critical payment processing privileges if the environment variable is unset during misconfigured deployment pipelines.",
        suggestedFix: `const apiKey = process.env.PAYMENT_GATEWAY_KEY;
if (!apiKey) {
  throw new InternalServerErrorException("PAYMENT_GATEWAY_KEY environment variable is mandatory.");
}`
      },
      {
        id: "ISSUE-103",
        line: 30,
        category: "Complexity",
        severity: "Medium",
        title: "Algorithmic Inefficiency: Quadratic O(n*m) Nested Discount Loop",
        description: "Looping through order.items with an inner loop over order.activeDiscounts results in quadratic O(n*m) time complexity. Pre-indexing discounts by category in a Map converts this to linear O(n).",
        whyItMatters: "Under high flash-sale cart loads with 50+ items and multiple bundled vouchers, this degrades CPU performance by 30x.",
        suggestedFix: `const discountMap = new Map<string, number>();
for (const d of order.activeDiscounts) {
  discountMap.set(d.applicableCategory, (discountMap.get(d.applicableCategory) || 0) + d.percentage);
}

for (const item of order.items) {
  const discountRate = discountMap.get(item.category) || 0;
  finalTotal += (item.price * (1 - discountRate)) * item.quantity;
}`
      }
    ]
  },

  // 2. Java Review
  {
    id: "REV-2042",
    project: "ecommerce-checkout-service",
    repository: "org-fintech/ecommerce-checkout-service",
    branch: "main",
    file: "src/main/java/com/fintech/checkout/PaymentProcessor.java",
    language: "Java",
    date: "2026-09-12 14:30",
    overallScore: 89,
    status: "Completed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    counts: {
      critical: 1,
      bugs: 1,
      security: 0,
      performance: 1,
      complexity: 1,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n²)",
      space: "O(1)",
      timeExplanation: "Nested iteration comparing discount codes against customer wallet keys causes quadratic comparisons on larger catalogs.",
      spaceExplanation: "In-place accumulation uses constant auxiliary stack space.",
      bottleneckLine: 18,
      isOptimal: false,
      recommendedPattern: "Pre-aggregate wallet discount prefixes in a HashSet for O(1) lookup.",
      comparisonTable: [
        { metric: "Current (Nested Scan)", time: "O(n²)", space: "O(1)", throughput: "~1,200 tx/sec" },
        { metric: "Optimized (HashSet)", time: "O(n)", space: "O(n)", throughput: "~18,000 tx/sec" }
      ]
    },
    codeContent: `package com.fintech.checkout;

import java.math.BigDecimal;
import java.util.*;

public class PaymentProcessor {
    private final Map<String, BigDecimal> customerWallets = new HashMap<>();

    public boolean processTransaction(String customerId, BigDecimal amount, List<String> discountCodes) {
        if (customerId == null || customerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer ID cannot be empty");
        }

        BigDecimal discount = BigDecimal.ZERO;

        // Quadratic nested scan across discount codes and wallet keys
        for (String code : discountCodes) {
            for (Map.Entry<String, BigDecimal> entry : customerWallets.entrySet()) {
                if (entry.getKey().contains(code)) {
                    discount = discount.add(entry.getValue().multiply(BigDecimal.valueOf(0.05)));
                }
            }
        }

        BigDecimal finalAmount = amount.subtract(discount);
        return customerWallets.containsKey(customerId);
    }
}`,
    issues: [
      {
        id: "ISSUE-201",
        line: 16,
        category: "Complexity",
        severity: "Medium",
        title: "Quadratic Complexity in Wallet Code Matching",
        description: "Nested loops compare every discount voucher code against the entire map of customer wallet entries, producing O(k * w) operations.",
        whyItMatters: "As wallet items grow, checkout response times degrade significantly from ~15ms to over 300ms during flash sales.",
        suggestedFix: `Set<String> applicableCodes = new HashSet<>(discountCodes);
for (Map.Entry<String, BigDecimal> entry : customerWallets.entrySet()) {
    if (applicableCodes.contains(entry.getKey())) {
        discount = discount.add(entry.getValue().multiply(BigDecimal.valueOf(0.05)));
    }
}`
      },
      {
        id: "ISSUE-202",
        line: 25,
        category: "Bugs",
        severity: "Critical",
        title: "BigDecimal Floating Point Rounding Inaccuracy",
        description: "BigDecimal.valueOf(0.05) creates subtle precision discrepancies in financial calculations compared to string-based initialization BigDecimal('0.05').",
        whyItMatters: "Can lead to multi-cent rounding drifts on large transaction volumes.",
        suggestedFix: `discount = discount.add(entry.getValue().multiply(new BigDecimal("0.05")));`
      }
    ]
  },

  // 3. Python Review
  {
    id: "REV-2039",
    project: "dsa-algorithm-lab",
    repository: "rajesh-panwar/dsa-algorithm-lab",
    branch: "main",
    file: "src/algorithms/search/two_sum_solution.py",
    language: "Python",
    date: "2026-09-10 18:40",
    overallScore: 92,
    status: "Completed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    counts: {
      critical: 0,
      bugs: 0,
      security: 0,
      performance: 1,
      complexity: 1,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n²)",
      space: "O(1)",
      timeExplanation: "Two nested loops iterate over the array, checking every pair of elements.",
      spaceExplanation: "No additional data structures allocated.",
      bottleneckLine: 6,
      isOptimal: false,
      recommendedPattern: "Hash Map Single-Pass O(n) Time, O(n) Space.",
      comparisonTable: [
        { metric: "Brute Force", time: "O(n²)", space: "O(1)", throughput: "~800 ops/sec" },
        { metric: "Hash Map Complement", time: "O(n)", space: "O(n)", throughput: "~35,000 ops/sec" }
      ]
    },
    codeContent: `def two_sum_quadratic(nums: list[int], target: int) -> list[int]:
    """Quadratic brute force O(n²) comparison."""
    n = len(nums)
    # Outer and inner loop checking every pair
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    issues: [
      {
        id: "ISSUE-301",
        line: 5,
        category: "Complexity",
        severity: "Medium",
        title: "Quadratic Time Complexity O(n²) in Pair Sum Lookup",
        description: "Brute-force nested loops inspect every pair of numbers in O(n²) time. A single-pass dictionary lookup achieves linear O(n) performance.",
        whyItMatters: "On an input of 50,000 elements, O(n²) performs 1.25 billion operations, freezing the thread.",
        suggestedFix: `seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
return []`
      }
    ]
  },

  // 4. Go Review
  {
    id: "REV-2040",
    project: "auth-gateway-proxy",
    repository: "org-fintech/auth-gateway-proxy",
    branch: "master",
    file: "pkg/jwt/verifier.go",
    language: "Go",
    date: "2026-09-11 09:15",
    overallScore: 95,
    status: "Completed",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    counts: {
      critical: 0,
      bugs: 0,
      security: 0,
      performance: 0,
      complexity: 0,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(1)",
      space: "O(1)",
      timeExplanation: "HMAC verification and constant-time string comparison execute in bounded O(1) time relative to the cryptographic signature size.",
      spaceExplanation: "Fixed-size 32-byte cryptographic buffer allocated on stack.",
      bottleneckLine: 24,
      isOptimal: true,
      recommendedPattern: "Architecture follows optimal cryptographic constant-time comparison standards.",
      comparisonTable: [
        { metric: "Current (hmac.Equal)", time: "O(1)", space: "O(1)", throughput: "~48,000 req/sec" }
      ]
    },
    codeContent: `package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"errors"
)

// VerifySignature performs constant-time HMAC check
func VerifySignature(token string, secret []byte, expectedSig []byte) (bool, error) {
	if len(token) == 0 {
		return false, errors.New("empty token header")
	}

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(token))
	calculatedSig := mac.Sum(nil)

	// Constant-time comparison defends against timing attacks
	if !hmac.Equal(calculatedSig, expectedSig) {
		return false, errors.New("signature mismatch")
	}

	return true, nil
}`,
    issues: [
      {
        id: "ISSUE-401",
        line: 12,
        category: "Quality",
        severity: "Low",
        title: "Missing Secret Key Length Assertion",
        description: "HMAC-SHA256 requires high-entropy keys. Secret slices under 32 bytes should fail validation during gateway startup.",
        whyItMatters: "Weak secrets undermine cryptographic guarantees against offline brute-force attacks.",
        suggestedFix: `if len(secret) < 32 {
    return false, errors.New("HMAC secret key must be at least 32 bytes")
}`
      }
    ]
  },

  // 5. Rust Review
  {
    id: "REV-2037",
    project: "distributed-cache-client",
    repository: "org-infra/distributed-cache-client",
    branch: "main",
    file: "src/ring/consistent_hash.rs",
    language: "Rust",
    date: "2026-09-08 16:55",
    overallScore: 96,
    status: "Completed",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(n)",
    counts: {
      critical: 0,
      bugs: 0,
      security: 0,
      performance: 0,
      complexity: 0,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(log n)",
      space: "O(n)",
      timeExplanation: "BTreeMap range query searches the balanced red-black ring in logarithmic O(log n) time.",
      spaceExplanation: "Stores virtual replica nodes in memory.",
      bottleneckLine: 18,
      isOptimal: true,
      recommendedPattern: "Logarithmic binary search in ordered ring is standard optimal consistent hashing.",
      comparisonTable: [
        { metric: "Current (BTreeMap Ring)", time: "O(log n)", space: "O(n)", throughput: "~95,000 lookups/sec" }
      ]
    },
    codeContent: `use std::collections::BTreeMap;

pub struct ConsistentHashRing {
    nodes: BTreeMap<u64, String>,
    replicas: usize,
}

impl ConsistentHashRing {
    pub fn new(replicas: usize) -> Self {
        Self {
            nodes: BTreeMap::new(),
            replicas,
        }
    }

    pub fn get_node(&self, hash_key: u64) -> Option<&String> {
        if self.nodes.is_empty() {
            return None;
        }

        // Binary search log(n) on ordered BTreeMap ring
        match self.nodes.range(hash_key..).next() {
            Some((_, node)) => Some(node),
            None => self.nodes.iter().next().map(|(_, node)| node),
        }
    }
}`,
    issues: [
      {
        id: "ISSUE-501",
        line: 16,
        category: "Quality",
        severity: "Low",
        title: "Consider Returning String Slice &str",
        description: "Returning Option<&str> instead of Option<&String> offers cleaner idiomatic Rust interoperability.",
        whyItMatters: "Allows callers to borrow slices without binding to the concrete String type.",
        suggestedFix: `pub fn get_node(&self, hash_key: u64) -> Option<&str> {
    // ...
    Some(node.as_str())
}`
      }
    ]
  },

  // 6. C Review
  {
    id: "REV-2043",
    project: "embedded-telemetry-driver",
    repository: "org-iot/embedded-telemetry-driver",
    branch: "main",
    file: "src/driver/buffer_pool.c",
    language: "C",
    date: "2026-09-07 14:10",
    overallScore: 82,
    status: "Attention Needed",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    counts: {
      critical: 1,
      bugs: 1,
      security: 1,
      performance: 1,
      complexity: 0,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n)",
      space: "O(1)",
      timeExplanation: "Linear search across 64 pool slots to locate free memory buffer.",
      spaceExplanation: "Static memory allocation with zero dynamic heap churn.",
      bottleneckLine: 18,
      isOptimal: false,
      recommendedPattern: "Bitmask index O(1) bit-scan (e.g. __builtin_ctzll) for instant allocation.",
      comparisonTable: [
        { metric: "Linear Scan", time: "O(n)", space: "O(1)", throughput: "~180k allocs/sec" },
        { metric: "Bitmask Scan", time: "O(1)", space: "O(1)", throughput: "~12M allocs/sec" }
      ]
    },
    codeContent: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BUFFERS 64
#define BUFFER_SIZE 512

typedef struct {
    char data[BUFFER_SIZE];
    int in_use;
} MemoryBlock;

static MemoryBlock pool[MAX_BUFFERS];

int allocate_block(const char* payload, size_t len) {
    // Potential buffer boundary issue if len >= BUFFER_SIZE
    if (len >= BUFFER_SIZE) return -1;

    // Linear O(n) search for first available block
    for (int i = 0; i < MAX_BUFFERS; i++) {
        if (!pool[i].in_use) {
            pool[i].in_use = 1;
            memcpy(pool[i].data, payload, len);
            pool[i].data[len] = '\\0';
            return i;
        }
    }
    return -2; // Out of memory
}`,
    issues: [
      {
        id: "ISSUE-601",
        line: 18,
        category: "Bugs",
        severity: "Critical",
        title: "Missing Null Pointer Check on Payload Buffer",
        description: "Function does not check if payload is NULL before calling memcpy, causing segmentation fault on invalid pointer input.",
        whyItMatters: "Direct kernel/driver crash in embedded devices upon receiving malformed telemetry packet.",
        suggestedFix: `if (payload == NULL) return -3;`
      },
      {
        id: "ISSUE-602",
        line: 20,
        category: "Performance",
        severity: "Medium",
        title: "O(n) Linear Scan for Memory Allocation",
        description: "Iterating through an array of structs incurs cache misses. A 64-bit integer bitmask allows O(1) allocation with bitwise instructions.",
        whyItMatters: "Reduces allocation jitter under high-throughput sensor telemetry ingestion.",
        suggestedFix: `static uint64_t free_mask = ~0ULL; // 1 = free, 0 = used`
      }
    ]
  },

  // 7. C++ Review
  {
    id: "REV-2044",
    project: "realtime-matching-engine",
    repository: "org-fintech/realtime-matching-engine",
    branch: "main",
    file: "src/engine/order_book.cpp",
    language: "C++",
    date: "2026-09-06 18:20",
    overallScore: 79,
    status: "Attention Needed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    counts: {
      critical: 1,
      bugs: 1,
      security: 0,
      performance: 2,
      complexity: 1,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n²)",
      space: "O(n)",
      timeExplanation: "Linear search followed by std::vector::erase shifts all subsequent elements, yielding O(n) per cancellation and O(n²) under batch cancel.",
      spaceExplanation: "Dynamic order book vectors scale linearly with active quotes.",
      bottleneckLine: 18,
      isOptimal: false,
      recommendedPattern: "std::unordered_map + std::list (L2 cache order book) for O(1) order cancellation.",
      comparisonTable: [
        { metric: "std::vector::erase", time: "O(n²)", space: "O(n)", throughput: "~2,400 cancels/sec" },
        { metric: "Map + Doubly-Linked List", time: "O(1)", space: "O(n)", throughput: "~180,000 cancels/sec" }
      ]
    },
    codeContent: `#include <iostream>
#include <vector>
#include <algorithm>

struct Order {
    int id;
    double price;
    int quantity;
    bool is_buy;
};

class OrderBook {
private:
    std::vector<Order> buy_orders;
    std::vector<Order> sell_orders;

public:
    void cancel_order(int order_id) {
        // Inefficient: O(n) scan + O(n) element shifting on erase
        for (auto it = buy_orders.begin(); it != buy_orders.end(); ++it) {
            if (it->id == order_id) {
                buy_orders.erase(it);
                return;
            }
        }
    }
};`,
    issues: [
      {
        id: "ISSUE-701",
        line: 18,
        category: "Complexity",
        severity: "Critical",
        title: "std::vector::erase Inefficiencies in High-Frequency Order Book",
        description: "Erasing from the middle of a std::vector requires shifting all subsequent elements down in memory, which is O(n). Under high cancellations, this degrades matching latency.",
        whyItMatters: "Breaches latency SLA during market volatility spikes.",
        suggestedFix: `// Use unordered_map<int, list<Order>::iterator> for O(1) direct node erasure`
      },
      {
        id: "ISSUE-702",
        line: 6,
        category: "Performance",
        severity: "Medium",
        title: "Floating Point Price Representation Risk",
        description: "Using double for financial order prices introduces binary floating-point representation rounding inaccuracies.",
        whyItMatters: "Fractional cent errors accumulate in matched volume fills.",
        suggestedFix: `using Price = std::int64_t; // Fixed-point micro-cents (e.g. 100.50 -> 100500000)`
      }
    ]
  },

  // 8. Kotlin Review
  {
    id: "REV-2046",
    project: "mobile-android-client",
    repository: "org-mobile/mobile-android-client",
    branch: "main",
    file: "app/src/main/kotlin/com/fintech/app/AccountRepository.kt",
    language: "Kotlin",
    date: "2026-09-05 12:45",
    overallScore: 90,
    status: "Completed",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    counts: {
      critical: 0,
      bugs: 1,
      security: 0,
      performance: 1,
      complexity: 0,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n)",
      space: "O(n)",
      timeExplanation: "Linear search across list of cached accounts.",
      spaceExplanation: "Keeps active user accounts in memory.",
      bottleneckLine: 12,
      isOptimal: true,
      recommendedPattern: "Maintain a concurrent HashMap index for O(1) direct lookup.",
      comparisonTable: [
        { metric: "List scan", time: "O(n)", space: "O(n)", throughput: "~14,000 lookups/sec" },
        { metric: "HashMap key", time: "O(1)", space: "O(n)", throughput: "~80,000 lookups/sec" }
      ]
    },
    codeContent: `package com.fintech.app

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class UserAccount(val id: String, val balance: Double, val tier: String)

class AccountRepository {
    private val accounts = mutableListOf<UserAccount>()

    suspend fun getAccountById(id: String): UserAccount? = withContext(Dispatchers.IO) {
        // Linear O(n) lookup across in-memory cache
        accounts.find { it.id == id }
    }

    fun addAccount(account: UserAccount) {
        accounts.add(account)
    }
}`,
    issues: [
      {
        id: "ISSUE-801",
        line: 9,
        category: "Bugs",
        severity: "Medium",
        title: "Thread Safety Hazard on MutableList",
        description: "mutableListOf is not synchronized. Accessing it concurrently across background coroutines can corrupt internal state or throw ConcurrentModificationException.",
        whyItMatters: "Produces random crashes when multiple background sync workers update accounts simultaneously.",
        suggestedFix: `private val accounts = java.util.concurrent.ConcurrentHashMap<String, UserAccount>()`
      }
    ]
  },

  // 9. JavaScript Review
  {
    id: "REV-2045",
    project: "web-dashboard-fe",
    repository: "org-web/web-dashboard-fe",
    branch: "main",
    file: "src/analytics/dataAggregator.js",
    language: "JavaScript",
    date: "2026-09-04 16:30",
    overallScore: 83,
    status: "Attention Needed",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
    counts: {
      critical: 0,
      bugs: 1,
      security: 0,
      performance: 2,
      complexity: 1,
      quality: 1
    },
    complexityAnalysis: {
      time: "O(n²)",
      space: "O(n)",
      timeExplanation: "events.filter with an inner events.indexOf(ev) check causes quadratic iterations over user analytics stream.",
      spaceExplanation: "Allocates a new filtered array in memory.",
      bottleneckLine: 5,
      isOptimal: false,
      recommendedPattern: "Remove redundant indexOf or use a Set for O(1) membership check.",
      comparisonTable: [
        { metric: "filter + indexOf", time: "O(n²)", space: "O(n)", throughput: "~650 ops/sec" },
        { metric: "Single filter", time: "O(n)", space: "O(n)", throughput: "~28,000 ops/sec" }
      ]
    },
    codeContent: `// Analytics metrics aggregator
export function aggregateUserSessions(events, targetUserId) {
  // Quadratic O(n²) filter with redundant inner array scan
  const userEvents = events.filter((ev) => {
    return ev.userId === targetUserId && events.indexOf(ev) >= 0;
  });

  const summary = {
    totalDuration: 0,
    pageViews: 0
  };

  userEvents.forEach(e => {
    summary.totalDuration += (e.duration || 0);
    summary.pageViews += 1;
  });

  return summary;
}`,
    issues: [
      {
        id: "ISSUE-901",
        line: 5,
        category: "Complexity",
        severity: "Medium",
        title: "Redundant Array.indexOf Inside Filter Predicate",
        description: "Calling events.indexOf(ev) inside events.filter turns linear scanning into a quadratic O(n²) performance trap.",
        whyItMatters: "On sessions with 20,000 telemetry events, this locks the main browser thread for 4.2 seconds.",
        suggestedFix: `const userEvents = events.filter((ev) => ev.userId === targetUserId);`
      }
    ]
  }
];

export const SAMPLE_PRESETS = [
  {
    id: "ts-order",
    name: "TypeScript: Order Processor (Nested Loop & Null Check)",
    language: "TypeScript",
    fileName: "OrderProcessor.ts",
    code: `import { Injectable, Logger } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { OrderDto, ProcessedOrderResult } from '../dto/order.dto';

@Injectable()
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private readonly customerRepo: CustomerRepository) {}

  public async processOrder(order: OrderDto): Promise<ProcessedOrderResult> {
    const customer = await this.customerRepo.findById(order.customerId);
    this.logger.log(\`Customer status: \${customer.membershipTier}\`);

    let finalTotal = 0;
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      let itemDiscount = 0;
      for (let j = 0; j < order.activeDiscounts.length; j++) {
        const discount = order.activeDiscounts[j];
        if (discount.applicableCategory === item.category) {
          itemDiscount += discount.percentage;
        }
      }
      finalTotal += item.price * (1 - itemDiscount) * item.quantity;
    }

    return { orderId: order.id, finalAmount: finalTotal };
  }
}`
  },
  {
    id: "java-payment",
    name: "Java: Payment Processor (Quadratic Match & BigDecimal)",
    language: "Java",
    fileName: "PaymentProcessor.java",
    code: `package com.fintech.checkout;

import java.math.BigDecimal;
import java.util.*;

public class PaymentProcessor {
    private final Map<String, BigDecimal> customerWallets = new HashMap<>();

    public boolean processTransaction(String customerId, BigDecimal amount, List<String> discountCodes) {
        BigDecimal discount = BigDecimal.ZERO;
        for (String code : discountCodes) {
            for (Map.Entry<String, BigDecimal> entry : customerWallets.entrySet()) {
                if (entry.getKey().contains(code)) {
                    discount = discount.add(entry.getValue().multiply(BigDecimal.valueOf(0.05)));
                }
            }
        }
        return customerWallets.containsKey(customerId);
    }
}`
  },
  {
    id: "python-twosum",
    name: "Python: Two Sum (Brute Force O(n²))",
    language: "Python",
    fileName: "two_sum.py",
    code: `def two_sum(nums: list[int], target: int) -> list[int]:
    """Brute force O(n²) quadratic pair scan."""
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`
  },
  {
    id: "c-buffer",
    name: "C: Memory Buffer Pool (Bounds & Pointer Safety)",
    language: "C",
    fileName: "buffer_pool.c",
    code: `#include <stdio.h>
#include <string.h>

#define MAX_BUFFERS 64
#define BUFFER_SIZE 512

typedef struct {
    char data[BUFFER_SIZE];
    int in_use;
} Block;

static Block pool[MAX_BUFFERS];

int allocate_block(const char* payload, size_t len) {
    for (int i = 0; i < MAX_BUFFERS; i++) {
        if (!pool[i].in_use) {
            pool[i].in_use = 1;
            memcpy(pool[i].data, payload, len);
            return i;
        }
    }
    return -1;
}`
  },
  {
    id: "cpp-orderbook",
    name: "C++: Order Book Matching (Vector Erase Latency)",
    language: "C++",
    fileName: "order_book.cpp",
    code: `#include <vector>

struct Order {
    int id;
    double price;
};

class OrderBook {
    std::vector<Order> bids;
public:
    void cancel(int id) {
        for (auto it = bids.begin(); it != bids.end(); ++it) {
            if (it->id == id) {
                bids.erase(it);
                return;
            }
        }
    }
};`
  },
  {
    id: "js-aggregator",
    name: "JavaScript: Data Aggregator (filter + indexOf Trap)",
    language: "JavaScript",
    fileName: "dataAggregator.js",
    code: `export function aggregateSessions(events, userId) {
  const userEvents = events.filter(e => {
    return e.userId === userId && events.indexOf(e) >= 0;
  });

  return userEvents.reduce((acc, curr) => acc + (curr.duration || 0), 0);
}`
  },
  {
    id: "go-verifier",
    name: "Go: HMAC Signature Verifier (Constant-Time)",
    language: "Go",
    fileName: "verifier.go",
    code: `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"errors"
)

func Verify(token string, secret, expectedSig []byte) (bool, error) {
	if len(token) == 0 {
		return false, errors.New("empty token")
	}
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(token))
	return hmac.Equal(mac.Sum(nil), expectedSig), nil
}`
  },
  {
    id: "kotlin-repo",
    name: "Kotlin: Coroutine Account Repository",
    language: "Kotlin",
    fileName: "AccountRepository.kt",
    code: `package com.fintech.app

data class Account(val id: String, val balance: Double)

class AccountRepository {
    private val accounts = mutableListOf<Account>()

    fun findAccount(id: String): Account? {
        return accounts.find { it.id == id }
    }
}`
  },
  {
    id: "rust-ring",
    name: "Rust: Consistent Hash Ring (BTreeMap)",
    language: "Rust",
    fileName: "consistent_hash.rs",
    code: `use std::collections::BTreeMap;

pub struct HashRing {
    nodes: BTreeMap<u64, String>,
}

impl HashRing {
    pub fn get_node(&self, key: u64) -> Option<&str> {
        match self.nodes.range(key..).next() {
            Some((_, node)) => Some(node.as_str()),
            None => self.nodes.iter().next().map(|(_, n)| n.as_str()),
        }
    }
}`
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
    linkedRepositories: 8,
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
