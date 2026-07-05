import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getComprehensiveProblems } from './server-problems.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'database.json');

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  targetCompany: string;
  collegeName?: string;
  daysRemaining: number;
  solvedCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  streak: number;
  accuracy: number;
  globalRank: number;
  weakTopics: string[];
  strongTopics: string[];
  achievements: { id: string; name: string; icon: string; date: string }[];
  bookmarks?: string[];
  favorites?: string[];
  recentlyViewed?: string[];
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  companyTags: string[];
  topicTags: string[];
  description: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
  templates: { [key: string]: string };
  bruteForce?: string;
  optimized?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface CodeSubmission {
  id: string;
  userId: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Compile Error';
  runtime: string;
  memory: string;
  submittedAt: string;
  testCasesPassed: number;
  totalTestCases: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  companyName: string;
  interviewType: string;
  rounds: string[];
  difficulty: string;
  currentRoundIndex: number;
  chatHistory: { role: 'interviewer' | 'candidate'; text: string; timestamp: string }[];
  status: 'in_progress' | 'completed';
  report?: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    confidenceScore: number;
    problemSolvingScore: number;
    suggestions: string[];
    weakAreas: string[];
    strongAreas: string[];
    recommendedCodingTopics: string[];
    recommendedInterviewQuestions: string[];
    studyPlan: { day: string; task: string }[];
  };
  createdAt: string;
}

export interface DiscussionPost {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: 'Question' | 'Solution';
  likes: number;
  likedBy: string[];
  createdAt: string;
  replies: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
  }[];
}

export interface Company {
  id: string;
  name: string;
  type: 'Product' | 'Service';
  hiringStatus: 'Hiring Now' | 'Closed' | 'Upcoming';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  roundsCount: number;
  topics: string[];
  codingQuestionsCount: number;
  logo: string;
  overview: string;
  eligibility: string;
  selectionProcess: string;
  oaPattern: string;
  codingRoundPattern: string;
  technicalPattern: string;
  hrPattern: string;
  systemDesignRound: string;
  faqsCoding: { question: string; answer: string }[];
  faqsHR: { question: string; answer: string }[];
  faqsTechnical: { question: string; answer: string }[];
  interviewExperiences: { role: string; text: string; author: string }[];
  prepRoadmap: string[];
  salaryRange: string;
  internshipOpportunity: boolean;
  fullTimeOpportunity: boolean;
}

interface DatabaseSchema {
  users: User[];
  problems: CodingProblem[];
  submissions: CodeSubmission[];
  interviews: InterviewSession[];
  discussions?: DiscussionPost[];
  companies?: Company[];
}

const SEED_PROBLEMS: CodingProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    topicTags: ['Arrays', 'HashMap', 'Two Pointer'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    inputFormat: '`nums` = array of integers, `target` = integer',
    outputFormat: 'Array of two integers representing indices',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    hints: [
      'A brute force way would be to check all pairs of numbers, which takes O(N^2) time. Can we do better?',
      'Try using a Hash Map to store the complement of each element as you iterate. Can you solve this in O(N) time?'
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
    ],
    templates: {
      python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your Python code here\n    pass',
      javascript: 'function twoSum(nums, target) {\n    // Write your JavaScript code here\n    return [];\n}',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};',
      java: 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}'
    },
    bruteForce: 'Iterate through all pairs (i, j) where i < j. If nums[i] + nums[j] == target, return [i, j].',
    optimized: 'Use a Hash Map to store numbers we have seen so far mapping from their value to their index. For each number x, check if (target - x) is in the Hash Map. If it is, return its index and the current index.',
    timeComplexity: 'O(N) - single pass hash table lookup',
    spaceComplexity: 'O(N) - stores up to N elements in the hash map'
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    companyTags: ['Microsoft', 'Amazon', 'Adobe', 'Apple'],
    topicTags: ['Linked List', 'Recursion'],
    description: 'Given the head of a singly linked list, reverse the list, and return its head.',
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    inputFormat: 'head of a Linked List',
    outputFormat: 'reversed head of the Linked List',
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'The linked list 1 -> 2 -> 3 -> 4 -> 5 is reversed to 5 -> 4 -> 3 -> 2 -> 1.'
      }
    ],
    hints: [
      'While traversing, you need to change the next pointer of each node to point to its predecessor.',
      'Since a node does not have a reference to its predecessor, you must store its predecessor beforehand.'
    ],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true }
    ],
    templates: {
      python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head: ListNode) -> ListNode:\n    # Write Python code\n    pass',
      javascript: '/*\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction reverseList(head) {\n    // Write JavaScript code\n    return null;\n}'
    },
    bruteForce: 'Extract all node values into an array, reverse the array, and reconstruct a new linked list. Takes O(N) time and O(N) extra space.',
    optimized: 'Keep three pointers: `prev` as null, `curr` as head, and `next` as null. Iterate through the list: save the next node `next = curr.next`, reverse the connection `curr.next = prev`, shift predecessors forward `prev = curr`, `curr = next`. Return `prev`.',
    timeComplexity: 'O(N) - single traversal of the linked list',
    spaceComplexity: 'O(1) - in-place pointer manipulation'
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    companyTags: ['Meta', 'Google', 'Microsoft', 'NVIDIA'],
    topicTags: ['Stack', 'Strings'],
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    inputFormat: 's = string of bracket characters',
    outputFormat: 'boolean (true or false)',
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    hints: [
      'Use a stack to store opening brackets.',
      'When you encounter a closing bracket, check if it matches the bracket on the top of the stack. If it does, pop it off, otherwise return false.'
    ],
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"]"', expectedOutput: 'false', isHidden: true }
    ],
    templates: {
      python: 'def isValid(s: str) -> bool:\n    # Write Python code\n    pass',
      javascript: 'function isValid(s) {\n    // Write JavaScript code\n    return false;\n}'
    },
    bruteForce: 'Keep replacing matching adjacent bracket pairs like "()", "[]", "{}" with empty strings iteratively. If the string becomes empty, it is valid.',
    optimized: 'Push opening brackets into a stack. For closing brackets, check if stack is empty (invalid) or top of stack matches. If so, pop. After traversal, if stack is empty, return true.',
    timeComplexity: 'O(N) - single traversal',
    spaceComplexity: 'O(N) - worst-case stack storing all opening brackets'
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Design',
    difficulty: 'Medium',
    category: 'HashMap',
    companyTags: ['Google', 'Apple', 'Uber', 'Amazon', 'Salesforce'],
    topicTags: ['HashMap', 'Linked List', 'Design'],
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n* `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n* `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n* `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.',
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    inputFormat: 'Initialization and method calls',
    outputFormat: 'Outputs for get operations',
    examples: [
      {
        input: 'LRUCache cache = new LRUCache(2);\ncache.put(1, 1);\ncache.put(2, 2);\ncache.get(1);       // returns 1\ncache.put(3, 3);    // evicts key 2\ncache.get(2);       // returns -1',
        output: '[null,null,null,1,null,-1]'
      }
    ],
    hints: [
      'To get O(1) fetch and O(1) insert/delete, combine a Hash Map with a Doubly Linked List.',
      'The Hash Map provides O(1) access to list nodes. The Doubly Linked List keeps track of the order of usage, allowing O(1) updates and evictions.'
    ],
    testCases: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', expectedOutput: '[null,null,null,1,null,-1,null,-1,3,4]', isHidden: false }
    ],
    templates: {
      python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass',
      javascript: 'class LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n    }\n    get(key) {\n        return -1;\n    }\n    put(key, value) {\n    }\n}'
    },
    bruteForce: 'Use a standard array or list to store items with timestamps. Getting or putting requires searching the list, taking O(N) time.',
    optimized: 'Combine a Doubly Linked List (maintaining insertion/read order) and a Hash Map (mapping key to list node). When an item is accessed or added, move its node to the head of the list. Evict from the tail if capacity is exceeded.',
    timeComplexity: 'O(1) average for both get and put',
    spaceComplexity: 'O(Capacity) to store elements'
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointer',
    companyTags: ['Google', 'Amazon', 'Goldman Sachs', 'Meta'],
    topicTags: ['Two Pointer', 'Arrays', 'Stack'],
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    inputFormat: 'height = array of integers',
    outputFormat: 'integer representing total water trapped',
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The elevation map traps 6 units of rain water.'
      }
    ],
    hints: [
      'At any bar, the amount of water trapped is limited by the maximum heights to its left and right.',
      'Water trapped at index i = min(max_left[i], max_right[i]) - height[i]. Can we solve this using two pointers in O(1) space?'
    ],
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false }
    ],
    templates: {
      python: 'def trap(height: list[int]) -> int:\n    # Write Python code\n    return 0',
      javascript: 'function trap(height) {\n    // Write JavaScript code\n    return 0;\n}'
    },
    bruteForce: 'For each element of the array, find the maximum level of water it can trap by searching for the maximum height to its left and right respectively, taking O(N^2) time.',
    optimized: 'Use two pointers `left` and `right` starting at ends of the elevation map. Keep track of `left_max` and `right_max`. If height[left] is smaller than height[right], process index `left`, compute trapped water, and increment `left`. Otherwise, process `right` and decrement. O(1) auxiliary space.',
    timeComplexity: 'O(N) - single pass traversing both ends',
    spaceComplexity: 'O(1) - two pointers'
  },
  {
    id: 'sql-managers',
    title: 'Employees Earning More Than Managers',
    difficulty: 'Easy',
    category: 'SQL Problems',
    companyTags: ['Amazon', 'Uber', 'Microsoft'],
    topicTags: ['SQL', 'Database'],
    description: 'Write an SQL query to find the employees who earn more than their managers.\n\nTable: `Employee`\n* `id` (int, Primary Key)\n* `name` (varchar)\n* `salary` (int)\n* `managerId` (int)',
    constraints: [
      'ManagerId refers to the ID of another Employee.'
    ],
    inputFormat: 'Employee database table',
    outputFormat: 'Table of Employee Names',
    examples: [
      {
        input: 'Employee table:\n+----+-------+--------+-----------+\n| id | name  | salary | managerId |\n+----+-------+--------+-----------+\n| 1  | Joe   | 70000  | 3         |\n| 2  | Henry | 80000  | 4         |\n| 3  | Sam   | 60000  | Null      |\n| 4  | Max   | 90000  | Null      |\n+----+-------+--------+-----------+',
        output: '+----------+\n| Employee |\n+----------+\n| Joe      |\n+----------+',
        explanation: 'Joe is the only employee who earns more than his manager Sam.'
      }
    ],
    hints: [
      'You can join the table with itself to associate employees with their managers.',
      'Check the condition where employee salary > manager salary.'
    ],
    testCases: [
      { input: 'JOINS', expectedOutput: 'SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary', isHidden: false }
    ],
    templates: {
      sql: 'SELECT name AS Employee\nFROM Employee\nWHERE ...'
    },
    bruteForce: 'Subquery lookup for each employee: query managers salary individually.',
    optimized: 'Perform an INNER JOIN on `Employee e` and `Employee m` on `e.managerId = m.id`. Filter where `e.salary > m.salary` and select `e.name`.',
    timeComplexity: 'O(N log N) with index on managerId',
    spaceComplexity: 'O(1) auxiliary'
  },
  {
    id: 'oop-parking-lot',
    title: 'Design a Parking Lot',
    difficulty: 'Medium',
    category: 'OOP Problems',
    companyTags: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs'],
    topicTags: ['Object Oriented Programming', 'System Design'],
    description: 'Design a Parking Lot system using Object Oriented Design principles.\n\nThe parking lot must support:\n1. Multiple floors containing different spot types (Compact, Large, Motorcycle).\n2. Different vehicle types (Car, Truck, Motorcycle) that fit into their respective spot sizes.\n3. Ticket issuing and parking fee computation at exit.\n4. Real-time slot occupancy tracking.',
    constraints: [
      'The parking lot should be modular and follow SOLID principles.'
    ],
    inputFormat: 'OOP Class structure requirements',
    outputFormat: 'Functional, clean, object-oriented design skeleton',
    examples: [
      {
        input: 'Define Vehicle, Spot, Floor, and ParkingLot classes.',
        output: 'Structured classes demonstrating polymorphism, encapsulation, and inheritance.'
      }
    ],
    hints: [
      'Use inheritance for Vehicles (Base class Vehicle -> Car, Truck, Motorcycle).',
      'Use an Enum for SpotType and VehicleType.'
    ],
    testCases: [
      { input: 'OOP', expectedOutput: 'SOLID', isHidden: false }
    ],
    templates: {
      python: 'from enum import Enum\nfrom abc import ABC, abstractmethod\n\nclass VehicleType(Enum):\n    CAR = 1\n    TRUCK = 2\n    MOTORCYCLE = 3\n\nclass Vehicle(ABC):\n    def __init__(self, license_plate: str, vehicle_type: VehicleType):\n        self.license_plate = license_plate\n        self.vehicle_type = vehicle_type\n\n# Extend classes below...',
      javascript: 'class Vehicle {\n    constructor(licensePlate, type) {\n        this.licensePlate = licensePlate;\n        this.type = type;\n    }\n}'
    }
  }
];

export function getSeedCompanies(): Company[] {
  const list = [
    { id: 'google', name: 'Google', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 5, topics: ['Graphs', 'Dynamic Programming', 'Heap', 'Tries'], salaryRange: '₹18 LPA - ₹45 LPA', eligibility: 'CGPA > 8.0, No active backlogs, CS/IT background preferred.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Google' },
    { id: 'microsoft', name: 'Microsoft', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Trees', 'HashMap', 'Strings', 'Linked Lists'], salaryRange: '₹16 LPA - ₹42 LPA', eligibility: 'CGPA > 7.5, B.Tech/M.Tech/MCA.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Microsoft' },
    { id: 'amazon', name: 'Amazon', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Arrays', 'Greedy', 'Dynamic Programming', 'Graphs'], salaryRange: '₹15 LPA - ₹38 LPA', eligibility: 'CGPA > 7.0, No active backlogs.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Amazon' },
    { id: 'meta', name: 'Meta', type: 'Product' as const, hiringStatus: 'Upcoming' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Arrays', 'Two Pointers', 'Binary Search', 'Sliding Window'], salaryRange: '₹25 LPA - ₹55 LPA', eligibility: 'CGPA > 8.0, strong problem solving skills.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Meta' },
    { id: 'apple', name: 'Apple', type: 'Product' as const, hiringStatus: 'Closed' as const, difficulty: 'Hard' as const, roundsCount: 5, topics: ['System Design', 'Arrays', 'Bit Manipulation', 'Operating Systems'], salaryRange: '₹20 LPA - ₹50 LPA', eligibility: 'B.Tech/M.Tech with exceptional coding track record.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Apple' },
    { id: 'netflix', name: 'Netflix', type: 'Product' as const, hiringStatus: 'Closed' as const, difficulty: 'Hard' as const, roundsCount: 5, topics: ['System Design', 'Concurrency', 'Distributed Systems', 'HashMap'], salaryRange: '₹30 LPA - ₹70 LPA', eligibility: 'Experienced professionals / Elite college graduates.', internshipOpportunity: false, fullTimeOpportunity: true, logo: 'Netflix' },
    { id: 'adobe', name: 'Adobe', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Trees', 'Recursion', 'Stack', 'Dynamic Programming'], salaryRange: '₹14 LPA - ₹35 LPA', eligibility: 'CGPA > 7.5, CS/IT/ECE branch.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Adobe' },
    { id: 'oracle', name: 'Oracle', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 4, topics: ['SQL', 'Databases', 'Trees', 'Sorting'], salaryRange: '₹12 LPA - ₹28 LPA', eligibility: 'CGPA > 7.0, B.Tech/M.Tech/MCA.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Oracle' },
    { id: 'ibm', name: 'IBM', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Sorting', 'Searching', 'HashMap', 'API Design'], salaryRange: '₹7 LPA - ₹15 LPA', eligibility: 'CGPA > 6.5, B.Tech/M.Tech/MCA/BSc.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'IBM' },
    { id: 'intel', name: 'Intel', type: 'Product' as const, hiringStatus: 'Upcoming' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Bit Manipulation', 'C Programming', 'Arrays', 'Computer Architecture'], salaryRange: '₹12 LPA - ₹25 LPA', eligibility: 'CS/ECE/EEE streams with sound fundamentals.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Intel' },
    { id: 'cisco', name: 'Cisco', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Computer Networks', 'Routing', 'Graphs', 'Linked Lists'], salaryRange: '₹12 LPA - ₹24 LPA', eligibility: 'CGPA > 7.0, CS/IT/ECE branches.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Cisco' },
    { id: 'salesforce', name: 'Salesforce', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Apex', 'HashMap', 'System Design', 'OOP Problems'], salaryRange: '₹15 LPA - ₹36 LPA', eligibility: 'CGPA > 7.5, excellent logic and communication.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Salesforce' },
    { id: 'servicenow', name: 'ServiceNow', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['JavaScript', 'HashMap', 'Linked Lists', 'Trees'], salaryRange: '₹14 LPA - ₹32 LPA', eligibility: 'CGPA > 7.5, CS/IT students.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'ServiceNow' },
    { id: 'atlassian', name: 'Atlassian', type: 'Product' as const, hiringStatus: 'Closed' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['System Design', 'Queue', 'HashMap', 'Concurrency'], salaryRange: '₹18 LPA - ₹45 LPA', eligibility: 'CGPA > 8.0, sound object-oriented concepts.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Atlassian' },
    { id: 'nvidia', name: 'NVIDIA', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['GPU Architecture', 'C++', 'Arrays', 'Recursion'], salaryRange: '₹18 LPA - ₹40 LPA', eligibility: 'B.Tech/M.Tech/PhD in CS/ECE/EE with strong systems background.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'NVIDIA' },
    { id: 'uber', name: 'Uber', type: 'Product' as const, hiringStatus: 'Upcoming' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['System Design', 'Graphs', 'Heap', 'Concurrency'], salaryRange: '₹22 LPA - ₹48 LPA', eligibility: 'CGPA > 8.0, strong coding and scale design.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Uber' },
    { id: 'linkedin', name: 'LinkedIn', type: 'Product' as const, hiringStatus: 'Closed' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['System Design', 'Tries', 'HashMap', 'Stack'], salaryRange: '₹20 LPA - ₹44 LPA', eligibility: 'CGPA > 8.0, CS/IT major.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'LinkedIn' },
    { id: 'zoho', name: 'Zoho', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 4, topics: ['OOPS', 'Matrix', 'Recursion', 'Strings'], salaryRange: '₹6 LPA - ₹12 LPA', eligibility: 'No degree constraints, strong programming fundamentals.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Zoho' },
    { id: 'freshworks', name: 'Freshworks', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['OOP Problems', 'Two Pointers', 'HashMap', 'Strings'], salaryRange: '₹8 LPA - ₹18 LPA', eligibility: 'CGPA > 7.0, B.Tech/BE/MCA.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Freshworks' },
    { id: 'tcs', name: 'TCS', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Aptitude', 'Basic Programming', 'Strings', 'Sorting'], salaryRange: '₹3.6 LPA - ₹9 LPA', eligibility: '60% throughout standard 10th, 12th, and UG.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'TCS' },
    { id: 'infosys', name: 'Infosys', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Aptitude', 'Data Structures', 'Sorting', 'Arrays'], salaryRange: '₹3.6 LPA - ₹8 LPA', eligibility: '60% throughout standard 10th, 12th, and UG.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Infosys' },
    { id: 'wipro', name: 'Wipro', type: 'Service' as const, hiringStatus: 'Upcoming' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Basic Math', 'Arrays', 'Strings', 'Sorting'], salaryRange: '₹3.5 LPA - ₹7.5 LPA', eligibility: '60% in UG/PG, no active backlogs.', internshipOpportunity: false, fullTimeOpportunity: true, logo: 'Wipro' },
    { id: 'hcl', name: 'HCL', type: 'Service' as const, hiringStatus: 'Closed' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Aptitude', 'Strings', 'Searching', 'Basic Programming'], salaryRange: '₹3.5 LPA - ₹7 LPA', eligibility: '60% average in academics.', internshipOpportunity: false, fullTimeOpportunity: true, logo: 'HCL' },
    { id: 'cognizant', name: 'Cognizant', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Aptitude', 'Searching', 'Sorting', 'Strings'], salaryRange: '₹4 LPA - ₹9 LPA', eligibility: '60% throughout, B.Tech/MCA/M.Tech.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Cognizant' },
    { id: 'accenture', name: 'Accenture', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Aptitude', 'Cognitive Abilities', 'Arrays', 'Strings'], salaryRange: '₹4.5 LPA - ₹11 LPA', eligibility: 'No active backlogs, any graduation stream.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Accenture' },
    { id: 'capgemini', name: 'Capgemini', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Game-based Aptitude', 'Pseudocode', 'Sorting', 'Strings'], salaryRange: '₹4 LPA - ₹8.5 LPA', eligibility: '60% throughout standard 10th, 12th, and UG.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Capgemini' },
    { id: 'tech-mahindra', name: 'Tech Mahindra', type: 'Service' as const, hiringStatus: 'Closed' as const, difficulty: 'Easy' as const, roundsCount: 3, topics: ['Aptitude', 'Basic Coding', 'Strings', 'Searching'], salaryRange: '₹3.5 LPA - ₹7.5 LPA', eligibility: '60% in UG/PG, CS/IT background preferred.', internshipOpportunity: false, fullTimeOpportunity: true, logo: 'Tech Mahindra' },
    { id: 'ltimindtree', name: 'LTIMindtree', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Aptitude', 'Arrays', 'Searching', 'DBMS'], salaryRange: '₹4 LPA - ₹10 LPA', eligibility: '60% or 6.0 CGPA throughout.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'LTIMindtree' },
    { id: 'deloitte', name: 'Deloitte', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Aptitude', 'Case Study', 'Sorting', 'DBMS'], salaryRange: '₹6 LPA - ₹13 LPA', eligibility: 'CGPA > 6.5, B.Tech/M.Tech/MCA.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Deloitte' },
    { id: 'ey', name: 'EY', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Excel', 'SQL', 'Aptitude', 'Sorting'], salaryRange: '₹5 LPA - ₹12 LPA', eligibility: 'CGPA > 6.0, open to all engineering graduates.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'EY' },
    { id: 'kpmg', name: 'KPMG', type: 'Service' as const, hiringStatus: 'Upcoming' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['MCQs', 'Database', 'SQL', 'Strings'], salaryRange: '₹5 LPA - ₹11 LPA', eligibility: 'CGPA > 6.0, B.Tech/MCA.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'KPMG' },
    { id: 'pwc', name: 'PwC', type: 'Service' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Aptitude', 'SQL', 'Arrays', 'Two Pointers'], salaryRange: '₹6 LPA - ₹14 LPA', eligibility: 'CGPA > 6.5, no active backlogs.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'PwC' },
    { id: 'goldman-sachs', name: 'Goldman Sachs', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Dynamic Programming', 'Math', 'Sorting', 'Trees'], salaryRange: '₹16 LPA - ₹35 LPA', eligibility: 'CGPA > 7.5, excellent math/logical skills.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Goldman Sachs' },
    { id: 'morgan-stanley', name: 'Morgan Stanley', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['HashMap', 'Trees', 'Sliding Window', 'Stack'], salaryRange: '₹14 LPA - ₹30 LPA', eligibility: 'CGPA > 7.5, solid computer science basics.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Morgan Stanley' },
    { id: 'jpmorgan-chase', name: 'JPMorgan Chase', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Medium' as const, roundsCount: 3, topics: ['Two Pointers', 'HashMap', 'Arrays', 'Sorting'], salaryRange: '₹12 LPA - ₹24 LPA', eligibility: 'CGPA > 7.0, open for Code For Good participants.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'JPMorgan Chase' },
    { id: 'qualcomm', name: 'Qualcomm', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['C Programming', 'Operating Systems', 'Bit Manipulation', 'Linked Lists'], salaryRange: '₹15 LPA - ₹32 LPA', eligibility: 'ECE/CS branches with high hardware affinity.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Qualcomm' },
    { id: 'samsung', name: 'Samsung', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Graphs', 'BFS', 'DFS', 'Backtracking'], salaryRange: '₹12 LPA - ₹26 LPA', eligibility: 'CGPA > 7.5, Samsung Global Software Test pass.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Samsung' },
    { id: 'tesla', name: 'Tesla', type: 'Product' as const, hiringStatus: 'Closed' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Embedded Systems', 'C++', 'System Design', 'Arrays'], salaryRange: '₹22 LPA - ₹46 LPA', eligibility: 'Elite hands-on hardware/software hackers.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Tesla' },
    { id: 'walmart-global-tech', name: 'Walmart Global Tech', type: 'Product' as const, hiringStatus: 'Hiring Now' as const, difficulty: 'Hard' as const, roundsCount: 4, topics: ['Dynamic Programming', 'Sorting', 'Two Pointers', 'System Design'], salaryRange: '₹14 LPA - ₹32 LPA', eligibility: 'CGPA > 7.5, B.Tech/M.Tech/MCA.', internshipOpportunity: true, fullTimeOpportunity: true, logo: 'Walmart Global Tech' }
  ];

  return list.map(c => {
    const isHardProduct = c.difficulty === 'Hard' && c.type === 'Product';
    const isMediumProduct = c.difficulty === 'Medium' && c.type === 'Product';
    const isService = c.type === 'Service';

    let selectionProcess = '';
    let oaPattern = '';
    let codingRoundPattern = '';
    let technicalPattern = '';
    let hrPattern = '';
    let systemDesignRound = '';

    if (isHardProduct) {
      selectionProcess = "1. Online Assessment (OA): 2 high-difficulty coding questions (60-90 mins)\n2. Technical Phone Screen: 1-2 coding and system design sanity checks\n3. Onsite Interview Loop: 3-4 intense technical rounds including deep DSA coding, System Design architecture, and Cultural Fitment/Leadership.";
      oaPattern = `2 algorithmic coding challenges from Topics like ${c.topics[0]} and ${c.topics[1] || 'Dynamic Programming'}. Time Limit: 90 mins. Proctored via HackerRank/CodeSignal with active plagiarism detection.`;
      codingRoundPattern = "Candidates are asked 2 core algorithmic problems. You are expected to code, explain dry-run on test cases, and analyze the optimal Time & Space complexity. Code correctness, edge-case coverage, and clean styling are strictly evaluated.";
      technicalPattern = `Conducted by Senior Architects. Focuses on writing optimal compilation-ready code under pressure. Deep dive into system-level operations and advanced topics like ${c.topics.join(', ')}.`;
      hrPattern = `Deep behavioral assessment. Focus on leadership principles, scalability vision, team collaboration, adaptability, and high-impact past achievements.`;
      systemDesignRound = "Architect high-scale distributed systems (e.g. rate limiters, tinyURL, WhatsApp chat, Uber routing). Evaluates horizontal scaling, CAP theorem, database selection, load balancing, caching, and failover design.";
    } else if (isMediumProduct) {
      selectionProcess = "1. Online Assessment (OA): 2 coding questions + 15 core CS MCQs (75 mins)\n2. Technical Rounds: 2 coding rounds covering core DS, logic, and OOP\n3. Hiring Manager Round: Project deep-dive, system-level design concepts, and cultural alignment.";
      oaPattern = "1-2 coding questions (medium difficulty) + 15 technical MCQs. Time Limit: 75 mins.";
      codingRoundPattern = `Focuses on core programming logic, data structures (${c.topics.join(', ')}), and Object-Oriented design implementation.`;
      technicalPattern = "In-depth testing on OOP principles, database schema design, and algorithmic problem solving with clean code.";
      hrPattern = `Discussion on career goals, projects, team situations, conflict resolution, and cultural fitment.`;
      systemDesignRound = "Low-level design (LLD) focusing on OOP Class structures, SOLID principles, design patterns (Singleton, Factory, Observer), and database schemas.";
    } else {
      selectionProcess = "1. National Qualifier Test / Aptitude OA: Quantitative, Logical, Verbal reasoning, and 1-2 basic programming questions\n2. Technical Interview Round: Discussion on resume projects, core computer science concepts (DBMS, OS, OOP, SQL), and simple coding\n3. HR Interview Round: Behavioral questions, location preferences, and communication checks.";
      oaPattern = "Part A: Cognitive & Aptitude MCQs (60 mins)\nPart B: Core Technical & Pseudocode MCQs (30 mins)\nPart C: 1-2 hands-on basic coding questions (30 mins) on arrays or strings.";
      codingRoundPattern = "Write functional code for simple patterns, mathematical series, string reversals, array sorting, or basic searching algorithms.";
      technicalPattern = "In-depth questioning on your final year projects, database schema normalization, SQL joins, basic sorting logic, and concepts of Object-Oriented Programming (OOP).";
      hrPattern = "Basic checks on communication skills, willingness to relocate, bond/commitment requirements, shift flexibility, and career alignment.";
      systemDesignRound = "Basic understanding of database schemas, client-server models, APIs, and cloud basics (SaaS, PaaS, IaaS).";
    }

    const codingQMap: Record<string, string[]> = {
      google: ["Merge K Sorted Lists (Hard)", "Cheapest Flights Within K Stops (Medium)", "Binary Tree Maximum Path Sum (Hard)"],
      microsoft: ["Reverse Nodes in k-Group (Hard)", "Binary Tree Zigzag Level Order Traversal (Medium)", "LRU Cache (Medium)"],
      amazon: ["LRU Cache (Medium)", "Course Schedule II (Medium)", "Top K Frequent Elements (Medium)"],
      meta: ["Subarray Sum Equals K (Medium)", "Valid Palindrome II (Easy)", "K Closest Points to Origin (Medium)"],
      apple: ["LRU Cache (Medium)", "Number of Islands (Medium)", "Implement Trie (Medium)"],
      netflix: ["Design Log Storage System (Medium)", "Search in Rotated Sorted Array (Medium)", "LRU Cache (Medium)"],
      adobe: ["Median of Two Sorted Arrays (Hard)", "Lowest Common Ancestor (Medium)", "Valid Parentheses (Easy)"],
      oracle: ["Number of Islands (Medium)", "Two Sum (Easy)", "Longest Palindromic Substring (Medium)"],
      zoho: ["Railway Reservation System (OOD/Hard)", "String Matrix Word Search (Medium)", "Spiral Matrix Generation (Easy)"],
      freshworks: ["Two Sum (Easy)", "Valid Anagram (Easy)", "Product of Array Except Self (Medium)"],
      tcs: ["Count Prime Numbers (Easy)", "String Reversal & Vowels (Easy)", "Fibonacci Series Generator (Easy)"],
      infosys: ["Find Duplicate in Array (Easy)", "Check Balanced Parentheses (Easy)", "Longest Common Subsequence (Medium)"],
      wipro: ["Reverse Words in a String (Easy)", "Merge Two Sorted Arrays (Easy)", "Bubble Sort Implementation (Easy)"],
      accenture: ["Binary Search Peak Element (Easy)", "String Palindrome Check (Easy)", "Array Subsequence sum (Medium)"],
      capgemini: ["Factorial Using Recursion (Easy)", "Count Occurrences of Substring (Easy)", "Matrix Diagonal Sum (Easy)"],
      cognizant: ["Find Missing Number (Easy)", "Check If Strings are Rotations (Easy)", "Linear Search vs Binary Search (Easy)"],
      'goldman-sachs': ["Fraction to Recurring Decimal (Medium)", "Group Anagrams (Medium)", "Trapping Rain Water (Hard)"],
      'morgan-stanley': ["Longest Substring Without Repeating Characters (Medium)", "Min Stack (Medium)", "Validate Binary Search Tree (Medium)"],
      'jpmorgan-chase': ["Two Sum (Easy)", "Merge Intervals (Medium)", "Meeting Rooms II (Medium)"],
      qualcomm: ["Bit Manipulation - Power of Two (Easy)", "Reverse Linked List (Easy)", "Implement Memcpy (Medium)"],
      samsung: ["Bipartite Graph Check (Medium)", "Word Ladder I (Hard)", "N-Queens Puzzle (Hard)"],
      tesla: ["Design Parking Lot (Medium)", "Implement Queue using Stacks (Easy)", "Merge Sort (Medium)"],
      'walmart-global-tech': ["Minimum Path Sum (Medium)", "Coin Change (Medium)", "Merge Intervals (Medium)"]
    };

    const companyKey = c.id;
    const faqsCoding = (codingQMap[companyKey] || ["Two Sum (Easy)", "Valid Parentheses (Easy)", "Longest Substring Without Repeating Characters (Medium)"]).map(q => ({
      question: `How frequently is "${q}" asked, and what is the optimal solution pattern?`,
      answer: `This is a highly popular interview question. The optimal approach uses a Hash Map or Two Pointers to achieve an O(N) runtime. Correctly addressing edge cases (such as null arrays, empty bounds, and integer overflow) is crucial for securing a 'Strong Hire' recommendation.`
    }));

    return {
      ...c,
      codingQuestionsCount: c.type === 'Product' ? (c.difficulty === 'Hard' ? 45 : 32) : 20,
      overview: `${c.name} is a global leader in ${c.type === 'Product' ? 'technology products, software innovation, and scalable platform architectures' : 'consulting, enterprise solutions, and software engineering services'}. As an SDE candidate, preparing for ${c.name} requires a strong mastery of ${c.topics.join(', ')} and solid computer science fundamentals (OOP, DBMS, OS, and computer networks).`,
      eligibility: c.eligibility,
      selectionProcess,
      oaPattern,
      codingRoundPattern,
      technicalPattern,
      hrPattern,
      systemDesignRound,
      faqsCoding,
      faqsHR: [
        { question: `Why do you want to join ${c.name} specifically?`, answer: `Focus your answer on ${c.name}'s technology engineering culture, scale of operations, and specific products or services. Connect this to your passion for building software that impacts millions of users.` },
        { question: "Tell me about a time you handled conflict in a team setting.", answer: "Use the STAR (Situation, Task, Action, Result) framework. Show empathy, focus on objective data (benchmarks, complexity analysis), and explain how you collaboratively arrived at the most logical, user-centric decision." }
      ],
      faqsTechnical: [
        { question: "Explain the difference between SQL and NoSQL databases, and when to use which.", answer: "SQL databases are relational, table-based, and scale vertically (great for ACID transactions like banking). NoSQL databases are non-relational, document/key-value/graph-based, and scale horizontally (excellent for unstructured, high-throughput data like social feeds or chats)." },
        { question: "What are SOLID design principles, and can you explain Dependency Inversion?", answer: "SOLID comprises Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. Dependency Inversion states that high-level modules should not depend on low-level modules; both should depend on abstractions." }
      ],
      interviewExperiences: [
        { role: 'Software Engineer (SDE-1)', text: `The interview process at ${c.name} was incredibly professional. Round 1 focused heavily on ${c.topics[0]} optimizations. Round 2 involved LLD and system integration. Be ready to dry-run your logic on diverse edge cases!`, author: 'Aman S.' },
        { role: 'SDE Intern', text: `Cracked ${c.name} through the campus placement drive! Focus heavily on your resume projects, understand every line of code you wrote, and master computer networks and database schemas.`, author: 'Pooja R.' }
      ],
      prepRoadmap: [
        `Phase 1: Deep dive into Data Structures & Algorithms (${c.topics[0]} & ${c.topics[1] || 'HashMap'})`,
        `Phase 2: Practice previous interview coding challenges and analyze time/space complexities`,
        `Phase 3: Deep dive into Computer Science Core (OOP, DBMS, OS, SQL, and System Design)`,
        `Phase 4: Behavioral round preparation using the STAR technique and company values review`
      ]
    };
  });
}

const INITIAL_DB: DatabaseSchema = {
  users: [

    {
      id: 'demo-user',
      email: 'demo@prepagent.ai',
      passwordHash: 'scrypt_or_bcrypt_mock', // demo pass
      fullName: 'Giri Kumar',
      targetCompany: 'Google',
      daysRemaining: 12,
      solvedCount: 139,
      easyCount: 82,
      mediumCount: 45,
      hardCount: 12,
      streak: 14,
      accuracy: 78.4,
      globalRank: 4210,
      weakTopics: ['Dynamic Programming', 'Graph', 'Trie'],
      strongTopics: ['Arrays', 'HashMap', 'Two Pointer', 'Linked List'],
      achievements: [
        { id: 'streak-10', name: '10 Days Hot Streak', icon: '🔥', date: '2026-06-28' },
        { id: 'first-hard', name: 'Hard Problem Slayer', icon: '⚔️', date: '2026-06-15' },
        { id: 'accuracy-pro', name: 'Accuracy Master', icon: '🎯', date: '2026-07-02' }
      ]
    }
  ],
  problems: getComprehensiveProblems(),
  submissions: [
    {
      id: 'sub-1',
      userId: 'demo-user',
      problemId: 'two-sum',
      problemTitle: 'Two Sum',
      language: 'python',
      code: 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
      status: 'Accepted',
      runtime: '32 ms',
      memory: '14.2 MB',
      submittedAt: '2026-07-03T18:24:00Z',
      testCasesPassed: 3,
      totalTestCases: 3
    },
    {
      id: 'sub-2',
      userId: 'demo-user',
      problemId: 'valid-parentheses',
      problemTitle: 'Valid Parentheses',
      language: 'javascript',
      code: 'function isValid(s) {\n    const stack = [];\n    const pairs = { ")": "(", "}": "{", "]": "[" };\n    for (let char of s) {\n        if (char === "(" || char === "{" || char === "[") {\n            stack.push(char);\n        } else {\n            if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {\n                return false;\n            }\n            stack.pop();\n        }\n    }\n    return stack.length === 0;\n}',
      status: 'Accepted',
      runtime: '68 ms',
      memory: '41.5 MB',
      submittedAt: '2026-07-04T12:05:00Z',
      testCasesPassed: 4,
      totalTestCases: 4
    }
  ],
  interviews: [],
  discussions: [],
  companies: getSeedCompanies()
};

class DatabaseService {
  private cache: DatabaseSchema | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      this.cache = INITIAL_DB;
    } else {
      try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        this.cache = JSON.parse(data);
        
        // Auto-initialize missing collections and fields gracefully
        if (this.cache) {
          let updated = false;
          if (!this.cache.problems || this.cache.problems.length < 105) {
            console.log(`Upgrading coding practice problems database to the latest ${getComprehensiveProblems().length} scenario-based challenges.`);
            this.cache.problems = getComprehensiveProblems();
            updated = true;
          }
          if (!this.cache.discussions) {
            this.cache.discussions = [];
            updated = true;
          }
          if (!this.cache.companies || this.cache.companies.length < 39) {
            console.log('Upgrading company tracks database with the 39 major software companies...');
            this.cache.companies = getSeedCompanies();
            updated = true;
          }
          this.cache.users.forEach(u => {
            if (!u.bookmarks) { u.bookmarks = []; updated = true; }
            if (!u.favorites) { u.favorites = []; updated = true; }
            if (!u.recentlyViewed) { u.recentlyViewed = []; updated = true; }
            if (!u.collegeName) { u.collegeName = 'VIT University'; updated = true; }
          });
          if (updated) {
            this.persist();
          }
        }
      } catch (err) {
        console.error('Failed to parse database.json, resetting cache...', err);
        this.cache = INITIAL_DB;
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      }
    }
  }

  private persist() {
    if (this.cache) {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    }
  }

  getUsers(): User[] {
    this.init();
    return this.cache?.users || [];
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    this.init();
    const user = this.cache?.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates);
      this.persist();
      return user;
    }
    return undefined;
  }

  addUser(user: User): void {
    this.init();
    this.cache?.users.push(user);
    this.persist();
  }

  getProblems(): CodingProblem[] {
    this.init();
    return this.cache?.problems || [];
  }

  getProblemById(id: string): CodingProblem | undefined {
    return this.getProblems().find(p => p.id === id);
  }

  addProblem(problem: CodingProblem): void {
    this.init();
    this.cache?.problems.push(problem);
    this.persist();
  }

  updateProblem(id: string, updates: Partial<CodingProblem>): CodingProblem | undefined {
    this.init();
    const problem = this.cache?.problems.find(p => p.id === id);
    if (problem) {
      Object.assign(problem, updates);
      this.persist();
      return problem;
    }
    return undefined;
  }

  deleteProblem(id: string): boolean {
    this.init();
    if (!this.cache) return false;
    const index = this.cache.problems.findIndex(p => p.id === id);
    if (index !== -1) {
      this.cache.problems.splice(index, 1);
      this.persist();
      return true;
    }
    return false;
  }

  getSubmissions(userId?: string): CodeSubmission[] {
    this.init();
    const list = this.cache?.submissions || [];
    if (userId) {
      return list.filter(s => s.userId === userId);
    }
    return list;
  }

  addSubmission(submission: CodeSubmission): void {
    this.init();
    this.cache?.submissions.push(submission);
    this.persist();
  }

  getInterviews(userId?: string): InterviewSession[] {
    this.init();
    const list = this.cache?.interviews || [];
    if (userId) {
      return list.filter(i => i.userId === userId);
    }
    return list;
  }

  getInterviewById(id: string): InterviewSession | undefined {
    this.init();
    return this.cache?.interviews.find(i => i.id === id);
  }

  addInterview(interview: InterviewSession): void {
    this.init();
    this.cache?.interviews.push(interview);
    this.persist();
  }

  updateInterview(id: string, updates: Partial<InterviewSession>): InterviewSession | undefined {
    this.init();
    const session = this.cache?.interviews.find(i => i.id === id);
    if (session) {
      Object.assign(session, updates);
      this.persist();
      return session;
    }
    return undefined;
  }

  // Bookmarks / Favorites / Recently Viewed
  toggleBookmark(userId: string, problemId: string): boolean {
    this.init();
    const user = this.cache?.users.find(u => u.id === userId);
    if (user) {
      if (!user.bookmarks) user.bookmarks = [];
      const index = user.bookmarks.indexOf(problemId);
      if (index === -1) {
        user.bookmarks.push(problemId);
      } else {
        user.bookmarks.splice(index, 1);
      }
      this.persist();
      return user.bookmarks.includes(problemId);
    }
    return false;
  }

  toggleFavorite(userId: string, problemId: string): boolean {
    this.init();
    const user = this.cache?.users.find(u => u.id === userId);
    if (user) {
      if (!user.favorites) user.favorites = [];
      const index = user.favorites.indexOf(problemId);
      if (index === -1) {
        user.favorites.push(problemId);
      } else {
        user.favorites.splice(index, 1);
      }
      this.persist();
      return user.favorites.includes(problemId);
    }
    return false;
  }

  addRecentlyViewed(userId: string, problemId: string): void {
    this.init();
    const user = this.cache?.users.find(u => u.id === userId);
    if (user) {
      if (!user.recentlyViewed) user.recentlyViewed = [];
      user.recentlyViewed = user.recentlyViewed.filter(id => id !== problemId);
      user.recentlyViewed.unshift(problemId);
      if (user.recentlyViewed.length > 10) {
        user.recentlyViewed.pop();
      }
      this.persist();
    }
  }

  // Discussions
  getDiscussions(problemId: string): DiscussionPost[] {
    this.init();
    return (this.cache?.discussions || []).filter(p => p.problemId === problemId);
  }

  addDiscussion(post: DiscussionPost): void {
    this.init();
    if (!this.cache) return;
    if (!this.cache.discussions) this.cache.discussions = [];
    this.cache.discussions.push(post);
    this.persist();
  }

  toggleLikeDiscussion(postId: string, userId: string): { likes: number; liked: boolean } {
    this.init();
    if (!this.cache || !this.cache.discussions) return { likes: 0, liked: false };
    const post = this.cache.discussions.find(p => p.id === postId);
    if (post) {
      if (!post.likedBy) post.likedBy = [];
      const index = post.likedBy.indexOf(userId);
      let liked = false;
      if (index === -1) {
        post.likedBy.push(userId);
        liked = true;
      } else {
        post.likedBy.splice(index, 1);
      }
      post.likes = post.likedBy.length;
      this.persist();
      return { likes: post.likes, liked };
    }
    return { likes: 0, liked: false };
  }

  replyDiscussion(postId: string, reply: { id: string; userId: string; userName: string; content: string; createdAt: string }): void {
    this.init();
    if (!this.cache || !this.cache.discussions) return;
    const post = this.cache.discussions.find(p => p.id === postId);
    if (post) {
      if (!post.replies) post.replies = [];
      post.replies.push(reply);
      this.persist();
    }
  }

  getCompanies(): Company[] {
    this.init();
    return this.cache?.companies || [];
  }

  getCompanyById(id: string): Company | undefined {
    return this.getCompanies().find(c => c.id === id);
  }
}

export const db = new DatabaseService();
