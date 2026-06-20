require('dotenv').config();
const mongoose = require('mongoose');
const Skill = require('./models/Skill');
const Question = require('./models/Question');

const SKILLS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'Binary Search', 'Dynamic Programming',
];

const QUESTIONS = [
  // Arrays
  { skill: 'Arrays', difficulty: 'easy', text: 'What is the time complexity of accessing an element by index in an array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Array index access is O(1) due to contiguous memory.' },
  { skill: 'Arrays', difficulty: 'medium', text: 'Which algorithm finds a pair summing to target in a sorted array in O(n)?', options: ['Two pointers', 'Brute force', 'DFS', 'Dijkstra'], answer: 0, explanation: 'Two pointers move from both ends in a sorted array.' },
  { skill: 'Arrays', difficulty: 'hard', text: 'What is the space complexity of merge sort on an array?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Merge sort requires O(n) auxiliary space for merging.' },
  { skill: 'Arrays', difficulty: 'easy', text: 'What is the worst-case time complexity of insertion at the beginning of an array?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], answer: 0, explanation: 'All elements must shift when inserting at index 0.' },

  // Strings
  { skill: 'Strings', difficulty: 'easy', text: 'Which data structure is immutable in many languages like Java?', options: ['String', 'Array', 'Linked List', 'Stack'], answer: 0, explanation: 'Strings are often immutable for security and hashing.' },
  { skill: 'Strings', difficulty: 'medium', text: 'What is the time complexity of the KMP pattern matching algorithm?', options: ['O(n + m)', 'O(n × m)', 'O(n²)', 'O(m²)'], answer: 0, explanation: 'KMP preprocesses the pattern in O(m) and searches in O(n).' },
  { skill: 'Strings', difficulty: 'hard', text: 'Which technique finds the longest palindromic substring in O(n²)?', options: ['Expand around center', 'Binary search', 'BFS', 'Topological sort'], answer: 0, explanation: 'Expand around center checks each center in O(n²).' },
  { skill: 'Strings', difficulty: 'medium', text: 'What does an anagram check typically require?', options: ['Same character frequency', 'Same substring order', 'Same length only', 'Same first character'], answer: 0, explanation: 'Anagrams have identical character counts.' },

  // Linked Lists
  { skill: 'Linked Lists', difficulty: 'easy', text: 'What is the time complexity of inserting at the head of a singly linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Head insertion only updates pointers.' },
  { skill: 'Linked Lists', difficulty: 'medium', text: 'Which technique detects a cycle in a linked list using O(1) space?', options: ["Floyd's algorithm", 'Hash set', 'DFS', 'BFS'], answer: 0, explanation: 'Floyd uses slow and fast pointers.' },
  { skill: 'Linked Lists', difficulty: 'hard', text: 'How do you find the middle node of a linked list in one pass?', options: ['Slow and fast pointers', 'Count then traverse', 'Stack', 'Queue'], answer: 0, explanation: 'Fast pointer moves 2x speed of slow pointer.' },

  // Stacks
  { skill: 'Stacks', difficulty: 'easy', text: 'Which principle does a stack follow?', options: ['LIFO', 'FIFO', 'LILO', 'Random access'], answer: 0, explanation: 'Stack is Last In, First Out.' },
  { skill: 'Stacks', difficulty: 'medium', text: 'Which problem is classic stack application?', options: ['Valid parentheses', 'Shortest path', 'Merge intervals', 'Binary search'], answer: 0, explanation: 'Matching brackets uses stack for open symbols.' },
  { skill: 'Stacks', difficulty: 'hard', text: 'What is the amortized time per operation in a stack supporting getMin in O(1)?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Auxiliary min stack enables O(1) getMin.' },

  // Queues
  { skill: 'Queues', difficulty: 'easy', text: 'Which principle does a queue follow?', options: ['FIFO', 'LIFO', 'FILO', 'Priority only'], answer: 0, explanation: 'Queue is First In, First Out.' },
  { skill: 'Queues', difficulty: 'medium', text: 'Which traversal uses a queue?', options: ['BFS', 'DFS', 'Inorder', 'Postorder'], answer: 0, explanation: 'BFS explores level by level using a queue.' },
  { skill: 'Queues', difficulty: 'hard', text: 'What data structure implements a queue with O(1) enqueue and dequeue?', options: ['Circular buffer with two pointers', 'Single array only', 'Linked list with one pointer', 'Stack'], answer: 0, explanation: 'Circular buffer avoids shifting elements.' },

  // Trees
  { skill: 'Trees', difficulty: 'easy', text: 'What is the maximum number of nodes at level L in a binary tree (root at level 0)?', options: ['2^L', 'L²', '2L', 'L'], answer: 0, explanation: 'Each level doubles the maximum nodes.' },
  { skill: 'Trees', difficulty: 'medium', text: 'Which traversal visits root, left, then right?', options: ['Preorder', 'Inorder', 'Postorder', 'Level order'], answer: 0, explanation: 'Preorder: Root → Left → Right.' },
  { skill: 'Trees', difficulty: 'hard', text: 'What is the height of a balanced BST with n nodes?', options: ['O(log n)', 'O(n)', 'O(√n)', 'O(1)'], answer: 0, explanation: 'Balanced BST maintains O(log n) height.' },
  { skill: 'Trees', difficulty: 'medium', text: 'Which tree property ensures O(log n) search?', options: ['Balanced BST', 'Complete binary tree', 'Full binary tree', 'Any binary tree'], answer: 0, explanation: 'Balance keeps height logarithmic.' },

  // Graphs
  { skill: 'Graphs', difficulty: 'easy', text: 'Which structure represents adjacency for sparse graphs efficiently?', options: ['Adjacency list', 'Adjacency matrix', 'Array', 'Stack'], answer: 0, explanation: 'Adjacency list uses O(V + E) space.' },
  { skill: 'Graphs', difficulty: 'medium', text: 'Which algorithm finds shortest path in unweighted graphs?', options: ['BFS', 'DFS', 'Dijkstra on unweighted', 'Bellman-Ford only'], answer: 0, explanation: 'BFS finds shortest path in unweighted graphs.' },
  { skill: 'Graphs', difficulty: 'hard', text: 'What is the time complexity of Dijkstra with a min-heap?', options: ['O((V + E) log V)', 'O(V²)', 'O(E log E)', 'O(V + E)'], answer: 0, explanation: 'Heap operations add log V factor.' },
  { skill: 'Graphs', difficulty: 'medium', text: 'Which algorithm detects cycles in a directed graph?', options: ['DFS with recursion stack', 'BFS only', 'Binary search', 'Two pointers'], answer: 0, explanation: 'DFS tracks visiting/visited states for cycle detection.' },

  // Binary Search
  { skill: 'Binary Search', difficulty: 'easy', text: 'What precondition does binary search require?', options: ['Sorted array', 'Unsorted array', 'Linked list', 'Graph'], answer: 0, explanation: 'Binary search needs sorted data to halve search space.' },
  { skill: 'Binary Search', difficulty: 'medium', text: 'What is the time complexity of binary search?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], answer: 0, explanation: 'Each step halves the search interval.' },
  { skill: 'Binary Search', difficulty: 'hard', text: 'When finding first occurrence, how should mid be handled if arr[mid] == target?', options: ['Search left half including mid', 'Search right half', 'Stop immediately', 'Skip mid'], answer: 0, explanation: 'Continue searching left to find the first occurrence.' },
  { skill: 'Binary Search', difficulty: 'medium', text: 'What is a common bug in binary search loop bounds?', options: ['Incorrect mid boundary updates', 'Using unsorted data', 'Using queue', 'Using recursion only'], answer: 0, explanation: 'Off-by-one in lo/hi updates causes infinite loops or missed answers.' },

  // Dynamic Programming
  { skill: 'Dynamic Programming', difficulty: 'easy', text: 'What two properties define a DP problem?', options: ['Optimal substructure and overlapping subproblems', 'Greedy choice only', 'Sorted input only', 'Graph structure only'], answer: 0, explanation: 'DP requires substructure and overlapping subproblems.' },
  { skill: 'Dynamic Programming', difficulty: 'medium', text: 'Which approach builds DP table bottom-up?', options: ['Tabulation', 'Memoization', 'Divide and conquer', 'Backtracking'], answer: 0, explanation: 'Tabulation fills table iteratively from base cases.' },
  { skill: 'Dynamic Programming', difficulty: 'hard', text: 'What is the time complexity of 0/1 knapsack with tabulation?', options: ['O(n × W)', 'O(n)', 'O(W)', 'O(2^n)'], answer: 0, explanation: 'n items and capacity W give O(nW) states.' },
  { skill: 'Dynamic Programming', difficulty: 'medium', text: 'Fibonacci with memoization avoids what issue?', options: ['Redundant recomputation', 'Stack overflow only', 'Memory leaks', 'Sorting overhead'], answer: 0, explanation: 'Memoization caches subproblem results.' },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnsmart';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Skill.deleteMany({});
  await Question.deleteMany({});

  await Skill.insertMany(SKILLS.map((name) => ({ name, description: `${name} fundamentals for DSA` })));
  await Question.insertMany(QUESTIONS);

  console.log(`Seeded ${SKILLS.length} skills and ${QUESTIONS.length} questions`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
