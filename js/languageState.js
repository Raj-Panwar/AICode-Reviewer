/**
 * AI Code Reviewer - Centralized Language State
 *
 * Single source of truth for the active programming language.
 * Used uniformly across Editor, File Upload, Review Request, Review Result,
 * Complexity Page, Highlighting, and API Payloads.
 */

export const SUPPORTED_LANGUAGES = [
  'Java',
  'Python',
  'C',
  'C++',
  'JavaScript',
  'TypeScript',
  'Go',
  'Kotlin',
  'Rust'
];

export const LANGUAGE_EXTENSIONS = {
  java: 'Java',
  py: 'Python',
  c: 'C',
  h: 'C',
  cpp: 'C++',
  cc: 'C++',
  cxx: 'C++',
  hpp: 'C++',
  js: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  go: 'Go',
  kt: 'Kotlin',
  kts: 'Kotlin',
  rs: 'Rust'
};

export const DEFAULT_FILENAMES = {
  Java: 'Solution.java',
  Python: 'solution.py',
  C: 'solution.c',
  'C++': 'solution.cpp',
  JavaScript: 'solution.js',
  TypeScript: 'solution.ts',
  Go: 'main.go',
  Kotlin: 'Solution.kt',
  Rust: 'main.rs'
};

export const CODE_TEMPLATES = {
  Java: `package com.example.algorithm;

import java.util.*;

public class Solution {
    /**
     * Finds elements in an array meeting target criteria.
     * Potential quadratic bottleneck in nested loops.
     */
    public int[] findPairs(int[] nums, int target) {
        // Brute-force nested loop: O(n²) time complexity
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
}`,

  Python: `def find_pairs(nums: list[int], target: int) -> list[int]:
    """
    Brute-force pair search with nested loop: O(n²) time complexity.
    Can be optimized to O(n) using a hash table complement map.
    """
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
`,

  C: `#include <stdio.h>
#include <stdlib.h>

/**
 * Linear search through buffer.
 * Check for potential buffer bounds and memory leaks.
 */
int* find_pairs(int* nums, int size, int target, int* return_size) {
    *return_size = 0;
    for (int i = 0; i < size; i++) {
        for (int j = i + 1; j < size; j++) {
            if (nums[i] + nums[j] == target) {
                int* result = (int*)malloc(2 * sizeof(int));
                result[0] = i;
                result[1] = j;
                *return_size = 2;
                return result;
            }
        }
    }
    return NULL;
}
`,

  'C++': `#include <vector>
#include <iostream>

class Solution {
public:
    // Quadratic brute-force: O(n²) time, O(1) space
    std::vector<int> findPairs(const std::vector<int>& nums, int target) {
        for (size_t i = 0; i < nums.size(); ++i) {
            for (size_t j = i + 1; j < nums.size(); ++j) {
                if (nums[i] + nums[j] == target) {
                    return {static_cast<int>(i), static_cast<int>(j)};
                }
            }
        }
        return {};
    }
};
`,

  JavaScript: `/**
 * Calculates discount matches across catalog items.
 * Nested loops result in O(n²) time complexity.
 */
function calculateOrderDiscounts(items, discounts) {
  let totalSaved = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    for (let j = 0; j < discounts.length; j++) {
      const discount = discounts[j];
      if (item.category === discount.category) {
        totalSaved += item.price * (discount.rate / 100);
      }
    }
  }
  
  return totalSaved;
}
`,

  TypeScript: `export interface OrderItem {
  id: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface DiscountRule {
  sku: string;
  percentage: number;
  active: boolean;
}

export class OrderProcessor {
  /**
   * Quadratic lookup anti-pattern: O(n * m) complexity.
   */
  public calculateSavings(items: OrderItem[], discounts: DiscountRule[]): number {
    let total = 0;
    for (const item of items) {
      for (const rule of discounts) {
        if (rule.sku === item.sku && rule.active) {
          total += (item.price * item.quantity * rule.percentage) / 100;
        }
      }
    }
    return total;
  }
}
`,

  Go: `package main

import "fmt"

// FindPairs checks combinations with O(n²) quadratic scans.
func FindPairs(nums []int, target int) []int {
	for i := 0; i < len(nums); i++ {
		for j := i + 1; j < len(nums); j++ {
			if nums[i]+nums[j] == target {
				return []int{i, j}
			}
		}
	}
	return []int{}
}

func main() {
	result := FindPairs([]int{2, 7, 11, 15}, 9)
	fmt.Println(result)
}
`,

  Kotlin: `package com.example.algos

class Solution {
    // Nested search: O(n²) time complexity
    fun findPairs(nums: IntArray, target: Int): IntArray {
        for (i in nums.indices) {
            for (j in i + 1 until nums.size) {
                if (nums[i] + nums[j] == target) {
                    return intArrayOf(i, j)
                }
            }
        }
        return intArrayOf()
    }
}
`,

  Rust: `pub fn find_pairs(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    // Quadratic iteration: O(n²) time, O(1) space
    for i in 0..nums.len() {
        for j in (i + 1)..nums.len() {
            if nums[i] + nums[j] == target {
                return Some((i, j));
            }
        }
    }
    None
}
`
};

class CentralLanguageState {
  constructor() {
    this.currentLanguage = 'Java';
    this.listeners = new Set();
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setLanguage(newLang) {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) {
      console.warn(`[LanguageState] Unsupported language "${newLang}". Defaulting to Java.`);
      newLang = 'Java';
    }

    if (this.currentLanguage !== newLang) {
      const oldLang = this.currentLanguage;
      this.currentLanguage = newLang;
      this.notify(newLang, oldLang);
    }
  }

  detectFromFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return 'Java';
    const parts = fileName.split('.');
    if (parts.length < 2) return 'Java';
    const ext = parts.pop().toLowerCase();
    return LANGUAGE_EXTENSIONS[ext] || 'Java';
  }

  getDefaultFileName(lang) {
    return DEFAULT_FILENAMES[lang || this.currentLanguage] || 'Solution.java';
  }

  getCodeTemplate(lang) {
    return CODE_TEMPLATES[lang || this.currentLanguage] || CODE_TEMPLATES.Java;
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => this.listeners.delete(callback);
  }

  notify(newLang, oldLang) {
    this.listeners.forEach((callback) => {
      try {
        callback(newLang, oldLang);
      } catch (err) {
        console.error('[LanguageState] Listener error:', err);
      }
    });
  }
}

export const languageState = new CentralLanguageState();

export function detectLanguageFromFilename(fileName) {
  return languageState.detectFromFileName(fileName);
}
