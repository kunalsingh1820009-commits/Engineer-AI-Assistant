import db from './db.js';

export function seedDatabase() {
  // 1. Seed Badges
  const badgeCount = db.prepare('SELECT count(*) as count FROM badges').get() as { count: number };
  if (badgeCount.count === 0) {
    const insertBadge = db.prepare('INSERT INTO badges (id, name, description, icon, category, xp_bonus) VALUES (?, ?, ?, ?, ?, ?)');
    const defaultBadges = [
      ['b1', 'First Bug Fixed', 'Successfully analyzed and debugged your first code snippet', '🐞', 'Debugging', 50],
      ['b2', 'DSA Novice', 'Solved 5 Data Structure & Algorithm practice problems', '🧠', 'DSA', 100],
      ['b3', 'DSA Champion', 'Solved 20 Data Structure & Algorithm practice problems', '🏆', 'DSA', 250],
      ['b4', 'Complexity Master', 'Analyzed Time and Space Complexity across 5 algorithms', '⚡', 'Algorithms', 75],
      ['b5', '7-Day Streak', 'Maintained consistent engineering practice for 7 days in a row', '🔥', 'Dedication', 150],
      ['b6', 'Mock Interview Ace', 'Completed an AI Technical Mock Interview with >80 score', '🎯', 'Interview', 200],
      ['b7', 'ATS Resume Polished', 'Achieved an ATS Resume Score of 85+ with quantifiable metrics', '📄', 'Career', 100],
      ['b8', 'System Architect', 'Generated a complete end-to-end full stack project blueprint', '🏗️', 'Architecture', 120]
    ];
    for (const b of defaultBadges) {
      insertBadge.run(...b);
    }
  }

  // 2. Seed Daily Challenges
  const challengeCount = db.prepare('SELECT count(*) as count FROM daily_challenges').get() as { count: number };
  if (challengeCount.count === 0) {
    const insertChallenge = db.prepare('INSERT INTO daily_challenges (id, title, description, task_type, xp_reward) VALUES (?, ?, ?, ?, ?)');
    const defaultChallenges = [
      ['c1', 'Solve 1 Medium DSA Problem', 'Complete and submit any medium-level DSA problem in the practice section.', 'dsa', 50],
      ['c2', 'Run Code Lab Complexity Analysis', 'Analyze time and space complexity on any custom algorithm.', 'complexity', 30],
      ['c3', 'Practice an Interview Question', 'Review and answer 2 technical interview questions in Computer Science fundamentals.', 'interview', 40]
    ];
    for (const c of defaultChallenges) {
      insertChallenge.run(...c);
    }
  }

  // 3. Seed DSA Problems
  const problemCount = db.prepare('SELECT count(*) as count FROM dsa_problems').get() as { count: number };
  if (problemCount.count === 0) {
    const insertProblem = db.prepare(`
      INSERT INTO dsa_problems (
        id, title, category, difficulty, description, examples_json, constraints_json, hints_json, approach_md, solution_code_json, time_complexity, space_complexity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const problems = [
      {
        id: 'two-sum',
        title: 'Two Sum',
        category: 'Arrays',
        difficulty: 'Easy',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
        hints: [
          'A brute force approach checks all pairs O(n²). Can we store complements in O(1) lookup time?',
          'Use a Hash Map / Hash Table where the key is the array value and the value is its index.',
          'As you iterate through the array, check if `target - nums[i]` exists in the hash map.'
        ],
        approach: `### Optimal Approach: Hash Map (Single Pass)
1. Initialize an empty hash map \`map\` to store \`value -> index\`.
2. Loop through the array with index \`i\`:
   - Calculate \`complement = target - nums[i]\`.
   - If \`complement\` is present in \`map\`, return \`[map[complement], i]\`.
   - Otherwise, store \`map[nums[i]] = i\`.
3. This guarantees finding the pair in a single pass.`,
        solutions: {
          cpp: `#include <vector>\n#include <unordered_map>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> numMap;\n    for (int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if (numMap.find(complement) != numMap.end()) {\n            return {numMap[complement], i};\n        }\n        numMap[nums[i]] = i;\n    }\n    return {};\n}`,
          python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
          java: `import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
          javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      {
        id: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        category: 'Strings',
        difficulty: 'Medium',
        description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        examples: [
          { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
          { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
          { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' }
        ],
        constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
        hints: [
          'Think of maintaining a sliding window `[left, right]`.',
          'Use a hash map or hash set to record the characters seen in the current window.',
          'When you encounter a duplicate character, shrink the window from the left until the duplicate is eliminated.'
        ],
        approach: `### Optimal Approach: Sliding Window + Hash Map
1. Maintain two pointers: \`left\` and \`right\` (start both at 0).
2. Maintain a hash map \`charIndexMap\` that maps each character to its most recent index.
3. For each character at \`right\`:
   - If \`s[right]\` was seen and its previous index >= \`left\`, move \`left\` to \`charIndexMap[s[right]] + 1\`.
   - Update \`charIndexMap[s[right]] = right\`.
   - Calculate \`maxLength = max(maxLength, right - left + 1)\`.
4. Return \`maxLength\`.`,
        solutions: {
          cpp: `#include <string>\n#include <vector>\n#include <algorithm>\n\nint lengthOfLongestSubstring(std::string s) {\n    std::vector<int> lastIndex(256, -1);\n    int maxLen = 0, left = 0;\n    for (int right = 0; right < s.length(); ++right) {\n        if (lastIndex[s[right]] >= left) {\n            left = lastIndex[s[right]] + 1;\n        }\n        lastIndex[s[right]] = right;\n        maxLen = std::max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`,
          python: `def lengthOfLongestSubstring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len`,
          java: `import java.util.HashMap;\nimport java.util.Map;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> map = new HashMap<>();\n        int maxLen = 0, left = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (map.containsKey(c) && map.get(c) >= left) {\n                left = map.get(c) + 1;\n            }\n            map.put(c, right);\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}`,
          javascript: `function lengthOfLongestSubstring(s) {\n    const map = new Map();\n    let maxLen = 0, left = 0;\n    for (let right = 0; right < s.length; right++) {\n        const char = s[right];\n        if (map.has(char) && map.get(char) >= left) {\n            left = map.get(char) + 1;\n        }\n        map.set(char, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(min(n, m)) where m is charset size'
      },
      {
        id: 'reverse-linked-list',
        title: 'Reverse Linked List',
        category: 'Linked Lists',
        difficulty: 'Easy',
        description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
        examples: [
          { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'The list is reversed iteratively or recursively.' },
          { input: 'head = [1,2]', output: '[2,1]', explanation: 'Reversed order.' }
        ],
        constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
        hints: [
          'Think of keeping track of three pointers: `prev`, `curr`, and `nextTemp`.',
          'At each step, point `curr.next` to `prev`, then advance `prev` and `curr`.'
        ],
        approach: `### Optimal Approach: 3 Pointers (Iterative)
1. Initialize \`prev = nullptr\` and \`curr = head\`.
2. While \`curr != nullptr\`:
   - Store next node: \`nextTemp = curr.next\`
   - Reverse link: \`curr.next = prev\`
   - Move \`prev = curr\`
   - Move \`curr = nextTemp\`
3. Return \`prev\` as the new head.`,
        solutions: {
          cpp: `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    ListNode* curr = head;\n    while (curr != nullptr) {\n        ListNode* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
          python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head: ListNode | None) -> ListNode | None:\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev`,
          java: `public class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}`,
          javascript: `function reverseList(head) {\n    let prev = null;\n    let curr = head;\n    while (curr !== null) {\n        const nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      },
      {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        category: 'Stack',
        difficulty: 'Easy',
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        examples: [
          { input: 's = "()"', output: 'true', explanation: 'Matches correctly.' },
          { input: 's = "()[]{}"', output: 'true', explanation: 'All matching in sequence.' },
          { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets.' }
        ],
        constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'."],
        hints: [
          'Use a Last-In First-Out (LIFO) data structure: a Stack.',
          'Whenever you see an opening bracket, push its expected closing bracket or the opening bracket onto the stack.',
          'When you see a closing bracket, check if the stack top matches.'
        ],
        approach: `### Optimal Approach: Stack
1. Initialize an empty stack.
2. For each character \`c\` in \`s\`:
   - If \`c\` is '(', push ')'
   - If \`c\` is '{', push '}'
   - If \`c\` is '[', push ']'
   - Otherwise, if the stack is empty or the popped element != \`c\`, return false.
3. At the end, return true if stack is empty, else false.`,
        solutions: {
          cpp: `#include <string>\n#include <stack>\n\nbool isValid(std::string s) {\n    std::stack<char> st;\n    for (char c : s) {\n        if (c == '(') st.push(')');\n        else if (c == '{') st.push('}');\n        else if (c == '[') st.push(']');\n        else if (st.empty() || st.top() != c) return false;\n        else st.pop();\n    }\n    return st.empty();\n}`,
          python: `def isValid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack`,
          java: `import java.util.Stack;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
          javascript: `function isValid(s) {\n    const stack = [];\n    for (let c of s) {\n        if (c === '(') stack.push(')');\n        else if (c === '{') stack.push('}');\n        else if (c === '[') stack.push(']');\n        else if (stack.pop() !== c) return false;\n    }\n    return stack.length === 0;\n}`
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      {
        id: 'binary-search',
        title: 'Binary Search',
        category: 'Searching',
        difficulty: 'Easy',
        description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`. You must write an algorithm with `O(log n)` runtime complexity.',
        examples: [
          { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
          { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1.' }
        ],
        constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique.', 'nums is sorted in ascending order.'],
        hints: [
          'Maintain search boundaries `low = 0` and `high = nums.length - 1`.',
          'Calculate `mid = low + (high - low) / 2` to prevent 32-bit integer overflow.',
          'Compare `nums[mid]` to `target` and halve the search space accordingly.'
        ],
        approach: `### Optimal Approach: Iterative Binary Search
1. \`low = 0\`, \`high = nums.length - 1\`
2. While \`low <= high\`:
   - \`mid = low + (high - low) // 2\`
   - If \`nums[mid] == target\`, return \`mid\`
   - If \`nums[mid] < target\`, set \`low = mid + 1\`
   - Else set \`high = mid - 1\`
3. If search bounds cross, return \`-1\`.`,
        solutions: {
          cpp: `#include <vector>\n\nint search(std::vector<int>& nums, int target) {\n    int low = 0, high = nums.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
          python: `def search(nums: list[int], target: int) -> int:\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
          java: `public class Solution {\n    public int search(int[] nums, int target) {\n        int low = 0, high = nums.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) low = mid + 1;\n            else high = mid - 1;\n        }\n        return -1;\n    }\n}`,
          javascript: `function search(nums, target) {\n    let low = 0, high = nums.length - 1;\n    while (low <= high) {\n        const mid = Math.floor((low + high) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`
        },
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)'
      },
      {
        id: 'maximum-subarray',
        title: 'Maximum Subarray (Kadane’s Algorithm)',
        category: 'Dynamic Programming',
        difficulty: 'Medium',
        description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
        examples: [
          { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
          { input: 'nums = [1]', output: '1', explanation: 'Single element is the largest.' },
          { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: 'The whole array sums to 23.' }
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        hints: [
          'At each index `i`, we can either extend the previous subarray sum or start fresh from `nums[i]`.',
          'Kadane\'s algorithm: `currentMax = max(nums[i], currentMax + nums[i])`.'
        ],
        approach: `### Optimal Approach: Kadane's Algorithm
1. Initialize \`maxSoFar = nums[0]\` and \`currentMax = nums[0]\`.
2. Loop from index 1 to end:
   - \`currentMax = max(nums[i], currentMax + nums[i])\`
   - \`maxSoFar = max(maxSoFar, currentMax)\`
3. Return \`maxSoFar\`.`,
        solutions: {
          cpp: `#include <vector>\n#include <algorithm>\n\nint maxSubArray(std::vector<int>& nums) {\n    int maxSoFar = nums[0], currentMax = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        currentMax = std::max(nums[i], currentMax + nums[i]);\n        maxSoFar = std::max(maxSoFar, currentMax);\n    }\n    return maxSoFar;\n}`,
          python: `def maxSubArray(nums: list[int]) -> int:\n    max_so_far = current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far`,
          java: `public class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], currentMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currentMax = Math.max(nums[i], currentMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currentMax);\n        }\n        return maxSoFar;\n    }\n}`,
          javascript: `function maxSubArray(nums) {\n    let maxSoFar = nums[0];\n    let currentMax = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        currentMax = Math.max(nums[i], currentMax + nums[i]);\n        maxSoFar = Math.max(maxSoFar, currentMax);\n    }\n    return maxSoFar;\n}`
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      },
      {
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        category: 'Trees',
        difficulty: 'Easy',
        description: 'Given the `root` of a binary tree, invert the tree, and return its root.',
        examples: [
          { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'All left and right subtrees are mirrored.' },
          { input: 'root = [2,1,3]', output: '[2,3,1]', explanation: 'Child nodes 1 and 3 swapped.' }
        ],
        constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
        hints: [
          'Recursively swap the left and right children for every node.',
          'Base case: if the node is null, return null.'
        ],
        approach: `### Optimal Approach: DFS Recursion
1. If \`root == nullptr\`, return \`nullptr\`.
2. Swap \`root->left\` and \`root->right\`.
3. Recursively call \`invertTree(root->left)\` and \`invertTree(root->right)\`.
4. Return \`root\`.`,
        solutions: {
          cpp: `struct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nTreeNode* invertTree(TreeNode* root) {\n    if (!root) return nullptr;\n    std::swap(root->left, root->right);\n    invertTree(root->left);\n    invertTree(root->right);\n    return root;\n}`,
          python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invertTree(root: TreeNode | None) -> TreeNode | None:\n    if not root:\n        return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root`,
          java: `public class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode left = invertTree(root.left);\n        TreeNode right = invertTree(root.right);\n        root.left = right;\n        root.right = left;\n        return root;\n    }\n}`,
          javascript: `function invertTree(root) {\n    if (!root) return null;\n    const left = invertTree(root.left);\n    const right = invertTree(root.right);\n    root.left = right;\n    root.right = left;\n    return root;\n}`
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h) where h is tree height'
      },
      {
        id: 'number-of-islands',
        title: 'Number of Islands',
        category: 'Graphs',
        difficulty: 'Medium',
        description: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
        examples: [
          {
            input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
            output: '1',
            explanation: 'All 1s are connected into 1 single island.'
          },
          {
            input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
            output: '3',
            explanation: 'There are 3 isolated islands.'
          }
        ],
        constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is "0" or "1".'],
        hints: [
          'Iterate through every cell in the grid.',
          'Whenever you see a \'1\', increment your island counter and trigger BFS/DFS to sink the entire island (turn connected \'1\'s to \'0\'s).'
        ],
        approach: `### Optimal Approach: DFS Flood Fill
1. Loop over every row \`r\` and col \`c\`.
2. If \`grid[r][c] == '1'\`:
   - \`islandsCount++\`
   - Run \`dfs(r, c)\` which marks current cell as \`'0'\` and recursively visits neighbors (up, down, left, right).
3. Return \`islandsCount\`.`,
        solutions: {
          cpp: `#include <vector>\n\nvoid dfs(std::vector<std::vector<char>>& grid, int r, int c) {\n    if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] != '1') return;\n    grid[r][c] = '0';\n    dfs(grid, r + 1, c);\n    dfs(grid, r - 1, c);\n    dfs(grid, r, c + 1);\n    dfs(grid, r, c - 1);\n}\n\nint numIslands(std::vector<std::vector<char>>& grid) {\n    int count = 0;\n    for (int r = 0; r < grid.size(); ++r) {\n        for (int c = 0; c < grid[0].size(); ++c) {\n            if (grid[r][c] == '1') {\n                count++;\n                dfs(grid, r, c);\n            }\n        }\n    }\n    return count;\n}`,
          python: `def numIslands(grid: list[list[str]]) -> int:\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    \n    def dfs(r, c):\n        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':\n            return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n        \n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count`,
          java: `public class Solution {\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int r = 0; r < grid.length; r++) {\n            for (int c = 0; c < grid[0].length; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] grid, int r, int c) {\n        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r + 1, c);\n        dfs(grid, r - 1, c);\n        dfs(grid, r, c + 1);\n        dfs(grid, r, c - 1);\n    }\n}`,
          javascript: `function numIslands(grid) {\n    let count = 0;\n    function dfs(r, c) {\n        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < grid.length; r++) {\n        for (let c = 0; c < grid[0].length; c++) {\n            if (grid[r][c] === '1') {\n                count++;\n                dfs(r, c);\n            }\n        }\n    }\n    return count;\n}`
        },
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n) worst case recursion stack'
      }
    ];

    for (const p of problems) {
      insertProblem.run(
        p.id,
        p.title,
        p.category,
        p.difficulty,
        p.description,
        JSON.stringify(p.examples),
        JSON.stringify(p.constraints),
        JSON.stringify(p.hints),
        p.approach,
        JSON.stringify(p.solutions),
        p.timeComplexity,
        p.spaceComplexity
      );
    }
  }

  // 4. Seed Keywords
  const kwCount = db.prepare('SELECT count(*) as count FROM keywords').get() as { count: number };
  if (kwCount.count === 0) {
    const insertKW = db.prepare(`
      INSERT INTO keywords (
        id, keyword, category, definition, simple_explanation, syntax, example_code, example_output, common_mistakes, interview_question
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const keywords = [
      {
        id: 'kw-vector',
        keyword: 'vector',
        category: 'C++ STL',
        definition: 'A dynamic array in C++ standard template library that can resize automatically when elements are added or deleted.',
        simple_explanation: 'Imagine a smart expandable list in memory. Unlike fixed arrays `int arr[10]`, a vector grows on demand whenever you call `.push_back()`.',
        syntax: 'std::vector<Type> name;',
        example_code: `#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3};\n    nums.push_back(4);\n    for (int n : nums) std::cout << n << " ";\n    return 0;\n}`,
        example_output: '1 2 3 4',
        common_mistakes: 'Accessing out of bounds elements using `nums[i]` without checking `nums.size()`, or assuming `.capacity()` equals `.size()`.',
        interview_question: 'What is the difference between vector size and capacity? How does vector growth factor work under the hood?'
      },
      {
        id: 'kw-pointer',
        keyword: 'pointer',
        category: 'Memory & C/C++',
        definition: 'A variable that stores the direct memory address of another variable.',
        simple_explanation: 'Think of a house having an address on an envelope. The variable is the house; the pointer is the envelope carrying the exact memory address.',
        syntax: 'Type* ptr = &variable;',
        example_code: `#include <iostream>\n\nint main() {\n    int score = 100;\n    int* p = &score;\n    std::cout << "Value: " << *p << "\\n";\n    std::cout << "Address: " << p << "\\n";\n    return 0;\n}`,
        example_output: 'Value: 100\nAddress: 0x7ffd9c...',
        common_mistakes: 'Dangling pointers (pointing to deallocated memory), dereferencing null pointers causing Segfaults, and memory leaks from forgotten `delete`.',
        interview_question: 'Explain the difference between a pointer and a reference in C++. Can a reference be null?'
      },
      {
        id: 'kw-recursion',
        keyword: 'recursion',
        category: 'Algorithms',
        definition: 'A programming technique where a function calls itself directly or indirectly to solve smaller instances of the same problem.',
        simple_explanation: 'Like looking into two parallel mirrors, or Russian nesting dolls where each doll opens to reveal a smaller one until you hit the smallest doll (the base case).',
        syntax: 'ReturnType func(params) { if (base_case) return res; return func(smaller_params); }',
        example_code: `int factorial(int n) {\n    if (n <= 1) return 1; // Base case\n    return n * factorial(n - 1); // Recursive step\n}`,
        example_output: 'factorial(5) -> 120',
        common_mistakes: 'Forgetting the base case or never reaching it, leading to infinite recursion and Stack Overflow crashes.',
        interview_question: 'What is tail-call optimization (TCO)? How does the call stack manage recursion variables?'
      },
      {
        id: 'kw-lambda',
        keyword: 'lambda',
        category: 'Modern C++ / Python / JS',
        definition: 'An anonymous inline function that can capture variables from its surrounding lexical scope.',
        simple_explanation: 'A quick, throwaway helper function you can write right where you need it, such as inside a custom sort comparator.',
        syntax: '[capture](parameters) -> return_type { body }',
        example_code: `auto add = [](int a, int b) { return a + b; };\nstd::cout << add(3, 4);`,
        example_output: '7',
        common_mistakes: 'Capturing variables by reference `[&]` when the lambda outlives the captured variable scope (causing undefined behavior).',
        interview_question: 'How do capture by value `[=]` and capture by reference `[&]` differ in terms of memory and concurrency?'
      },
      {
        id: 'kw-polymorphism',
        keyword: 'polymorphism',
        category: 'OOP',
        definition: 'The ability of different objects or functions to respond to the same message or interface in their own unique way.',
        simple_explanation: 'Think of a steering wheel. Whether you drive a truck, electric sedan, or race car, turning the wheel makes the vehicle turn, even though the internal engine mechanics differ.',
        syntax: 'class Base { virtual void speak() = 0; };',
        example_code: `class Shape {\npublic:\n    virtual void draw() { std::cout << "Drawing shape\\n"; }\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() override { std::cout << "Drawing circle\\n"; }\n};`,
        example_output: 'Drawing circle',
        common_mistakes: 'Forgetting `virtual` destructors in base classes, leading to partial object destruction and memory leaks when deleting via base pointers.',
        interview_question: 'How does the VTable (Virtual Method Table) and VPTR work under the hood to achieve runtime polymorphism?'
      },
      {
        id: 'kw-map',
        keyword: 'unordered_map (Hash Table)',
        category: 'Data Structures',
        definition: 'An associative container that stores key-value pairs with average O(1) time complexity for insertions and lookups.',
        simple_explanation: 'Like a dictionary where you look up a definition using a word (the key) in one instant step rather than reading the whole book.',
        syntax: 'std::unordered_map<KeyType, ValueType> map;',
        example_code: `#include <iostream>\n#include <unordered_map>\n\nint main() {\n    std::unordered_map<std::string, int> ages;\n    ages["Alice"] = 21;\n    ages["Bob"] = 23;\n    std::cout << "Alice is " << ages["Alice"] << "\\n";\n    return 0;\n}`,
        example_output: 'Alice is 21',
        common_mistakes: 'Using `map[key]` for read-only checks, which accidentally inserts a default-constructed value if the key does not exist. Use `.find()` or `.count()` instead.',
        interview_question: 'What happens when two keys hash to the same bucket (hash collision)? Compare chaining vs open addressing.'
      }
    ];

    for (const kw of keywords) {
      insertKW.run(
        kw.id,
        kw.keyword,
        kw.category,
        kw.definition,
        kw.simple_explanation,
        kw.syntax,
        kw.example_code,
        kw.example_output,
        kw.common_mistakes,
        kw.interview_question
      );
    }
  }

  // 5. Seed Roadmaps
  const rmCount = db.prepare('SELECT count(*) as count FROM roadmaps').get() as { count: number };
  if (rmCount.count === 0) {
    const insertRM = db.prepare('INSERT INTO roadmaps (id, title, category, description, topics_json) VALUES (?, ?, ?, ?, ?)');

    const roadmaps = [
      {
        id: 'cpp-roadmap',
        title: 'C++ Mastery & System Programming',
        category: 'Programming Languages',
        description: 'Complete zero-to-hero roadmap for C++ including modern C++20 features, memory management, STL, and performance.',
        topics: [
          { id: 'cpp-1', title: '1. Syntax, Data Types & I/O', hours: 4, description: 'Variables, primitive types, cin/cout, namespaces' },
          { id: 'cpp-2', title: '2. Control Flow & Loops', hours: 4, description: 'if/else, switch, while, for, range-based loops' },
          { id: 'cpp-3', title: '3. Functions & Pass-by-Value/Ref', hours: 5, description: 'Prototypes, default args, pass by reference, inline functions' },
          { id: 'cpp-4', title: '4. Pointers & Dynamic Memory', hours: 8, description: 'Stack vs Heap, new/delete, pointer arithmetic, memory leaks' },
          { id: 'cpp-5', title: '5. Object Oriented Programming (OOP)', hours: 10, description: 'Classes, encapsulation, inheritance, virtual functions, abstract classes' },
          { id: 'cpp-6', title: '6. C++ Standard Template Library (STL)', hours: 12, description: 'vector, string, unordered_map, set, priority_queue, algorithms' },
          { id: 'cpp-7', title: '7. Move Semantics & Smart Pointers', hours: 6, description: 'unique_ptr, shared_ptr, rvalue references, std::move' },
          { id: 'cpp-8', title: '8. Multithreading & Concurrency', hours: 8, description: 'std::thread, mutex, lock_guard, condition variables' }
        ]
      },
      {
        id: 'dsa-roadmap',
        title: 'Data Structures & Algorithms for Placements',
        category: 'DSA & Problem Solving',
        description: 'Structured path covering all fundamental and advanced patterns asked in Tier-1 product tech interviews.',
        topics: [
          { id: 'dsa-1', title: '1. Big-O Asymptotic Analysis', hours: 3, description: 'Time and space complexity calculation, best/avg/worst case' },
          { id: 'dsa-2', title: '2. Arrays, Two Pointers & Sliding Window', hours: 8, description: 'Prefix sums, 2-pointer techniques, variable/fixed sliding windows' },
          { id: 'dsa-3', title: '3. Strings & Hashing Techniques', hours: 6, description: 'Anagrams, frequency counting, rolling hash' },
          { id: 'dsa-4', title: '4. Linked Lists & Fast/Slow Pointers', hours: 7, description: 'Reversal, cycle detection, merge sorted lists' },
          { id: 'dsa-5', title: '5. Stacks & Queues (Monotonic Stack)', hours: 8, description: 'Parentheses validation, next greater element, min stack' },
          { id: 'dsa-6', title: '6. Binary Search on Arrays & Answer Space', hours: 8, description: 'Rotated sorted arrays, lower/upper bounds, capacity allocation' },
          { id: 'dsa-7', title: '7. Trees, BST & Tree Traversals', hours: 12, description: 'Inorder/Preorder/Postorder, LCA, diameter, BST validation' },
          { id: 'dsa-8', title: '8. Graph Algorithms (BFS, DFS, Dijkstra)', hours: 14, description: 'Topological sort, cycle detection, shortest paths, disjoint set union' },
          { id: 'dsa-9', title: '9. Dynamic Programming (1D & 2D)', hours: 18, description: 'Knapsack, LCS, LIS, grid paths, memoization vs tabulation' }
        ]
      },
      {
        id: 'fullstack-roadmap',
        title: 'Full Stack Web Engineering',
        category: 'Web Development',
        description: 'Modern full stack development with React, TypeScript, Node.js, Express, Databases, and RESTful API design.',
        topics: [
          { id: 'fs-1', title: '1. HTML5, Modern CSS & Responsive Layouts', hours: 6, description: 'Flexbox, CSS Grid, semantic tags, accessibility' },
          { id: 'fs-2', title: '2. JavaScript (ES6+) & Async/Await', hours: 10, description: 'Closures, promises, event loop, array methods' },
          { id: 'fs-3', title: '3. TypeScript Core & Type System', hours: 8, description: 'Interfaces, generics, union types, type guards' },
          { id: 'fs-4', title: '4. React, Hooks & State Management', hours: 15, description: 'useState, useEffect, useMemo, custom hooks, context API' },
          { id: 'fs-5', title: '5. Node.js, Express & REST API Architecture', hours: 12, description: 'Routing, middleware, error handling, MVC architecture' },
          { id: 'fs-6', title: '6. Databases (SQL & NoSQL) & Indexing', hours: 10, description: 'SQLite/PostgreSQL, normalization, joins, migrations' },
          { id: 'fs-7', title: '7. Authentication, JWT & Security (OWASP)', hours: 8, description: 'Password hashing, CORS, rate limiting, token expiration' }
        ]
      }
    ];

    for (const rm of roadmaps) {
      insertRM.run(rm.id, rm.title, rm.category, rm.description, JSON.stringify(rm.topics));
    }
  }

  console.log('Database seeded with rich engineering datasets.');
}
