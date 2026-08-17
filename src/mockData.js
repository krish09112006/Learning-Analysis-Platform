// Relational database mock structure for Python Programming Course

export const COURSES_DB = [
  {
    course_id: "py-101",
    course_name: "Python Programming",
    category: "Programming",
    level: "Beginner to Intermediate",
    status: "Active",
    description: "A complete, comprehensive pathway to master Python programming from basics to advanced libraries."
  }
];

export const MODULES_DB = [
  { module_id: 1, course_id: "py-101", module_name: "Introduction to Python", module_order: 1 },
  { module_id: 2, course_id: "py-101", module_name: "Python Basics", module_order: 2 },
  { module_id: 3, course_id: "py-101", module_name: "Conditional Statements", module_order: 3 },
  { module_id: 4, course_id: "py-101", module_name: "Loops", module_order: 4 },
  { module_id: 5, course_id: "py-101", module_name: "Strings", module_order: 5 },
  { module_id: 6, course_id: "py-101", module_name: "Lists", module_order: 6 },
  { module_id: 7, course_id: "py-101", module_name: "Tuples", module_order: 7 },
  { module_id: 8, course_id: "py-101", module_name: "Sets", module_order: 8 },
  { module_id: 9, course_id: "py-101", module_name: "Dictionaries", module_order: 9 },
  { module_id: 10, course_id: "py-101", module_name: "Functions", module_order: 10 },
  { module_id: 11, course_id: "py-101", module_name: "OOP", module_order: 11 },
  { module_id: 12, course_id: "py-101", module_name: "Exception Handling", module_order: 12 },
  { module_id: 13, course_id: "py-101", module_name: "File Handling", module_order: 13 },
  { module_id: 14, course_id: "py-101", module_name: "Modules & Packages", module_order: 14 },
  { module_id: 15, course_id: "py-101", module_name: "Advanced Python", module_order: 15 },
  { module_id: 16, course_id: "py-101", module_name: "Python Libraries", module_order: 16 },
  { module_id: 17, course_id: "py-101", module_name: "Practice", module_order: 17 }
];

export const SYLLABUS_CATEGORIES = MODULES_DB.map(m => m.module_name);

export const TOPICS_STRUCT_RAW = [
  // Module 1: Introduction to Python
  { id: 1, module_id: 1, name: "Introduction" },

  // Module 2: Python Basics
  { id: 14, module_id: 2, name: "Variables" },
  { id: 15, module_id: 2, name: "Constants" },
  { id: 16, module_id: 2, name: "Data Types" },
  { id: 17, module_id: 2, name: "Numbers" },
  { id: 18, module_id: 2, name: "Integers" },
  { id: 19, module_id: 2, name: "Floating Point Numbers" },
  { id: 20, module_id: 2, name: "Complex Numbers" },
  { id: 21, module_id: 2, name: "Strings" },
  { id: 22, module_id: 2, name: "Boolean Data Type" },
  { id: 23, module_id: 2, name: "Type Conversion" },
  { id: 24, module_id: 2, name: "Type Checking" },
  { id: 25, module_id: 2, name: "Input and Output" },
  { id: 26, module_id: 2, name: "print()" },
  { id: 27, module_id: 2, name: "input()" },
  { id: 28, module_id: 2, name: "Operators" },
  { id: 29, module_id: 2, name: "Arithmetic Operators" },
  { id: 30, module_id: 2, name: "Comparison Operators" },
  { id: 31, module_id: 2, name: "Logical Operators" },
  { id: 32, module_id: 2, name: "Assignment Operators" },
  { id: 33, module_id: 2, name: "Bitwise Operators" },
  { id: 34, module_id: 2, name: "Membership Operators" },
  { id: 35, module_id: 2, name: "Identity Operators" },
  { id: 36, module_id: 2, name: "Operator Precedence" },

  // Module 3: Conditional Statements
  { id: 37, module_id: 3, name: "Introduction to Conditional Statements" },
  { id: 38, module_id: 3, name: "if Statement" },
  { id: 39, module_id: 3, name: "if-else Statement" },
  { id: 40, module_id: 3, name: "if-elif-else" },
  { id: 41, module_id: 3, name: "Nested if" },
  { id: 42, module_id: 3, name: "Short-hand if" },
  { id: 43, module_id: 3, name: "Conditional Expressions" },
  { id: 44, module_id: 3, name: "match-case Statement" },

  // Module 4: Loops
  { id: 45, module_id: 4, name: "Introduction to Loops" },
  { id: 46, module_id: 4, name: "for Loop" },
  { id: 47, module_id: 4, name: "while Loop" },
  { id: 48, module_id: 4, name: "Nested Loops" },
  { id: 49, module_id: 4, name: "range()" },
  { id: 50, module_id: 4, name: "break" },
  { id: 51, module_id: 4, name: "continue" },
  { id: 52, module_id: 4, name: "pass" },
  { id: 53, module_id: 4, name: "Loop with else" },
  { id: 54, module_id: 4, name: "Iterating Through Strings" },
  { id: 55, module_id: 4, name: "Iterating Through Lists" },
  { id: 56, module_id: 4, name: "Iterating Through Dictionaries" },

  // Module 5: Strings
  { id: 57, module_id: 5, name: "Introduction to Strings" },
  { id: 58, module_id: 5, name: "Creating Strings" },
  { id: 59, module_id: 5, name: "String Indexing" },
  { id: 60, module_id: 5, name: "String Slicing" },
  { id: 61, module_id: 5, name: "String Concatenation" },
  { id: 62, module_id: 5, name: "String Formatting" },
  { id: 63, module_id: 5, name: "f-Strings" },
  { id: 64, module_id: 5, name: "Escape Characters" },
  { id: 65, module_id: 5, name: "String Methods" },
  { id: 66, module_id: 5, name: "upper()" },
  { id: 67, module_id: 5, name: "lower()" },
  { id: 68, module_id: 5, name: "strip()" },
  { id: 69, module_id: 5, name: "replace()" },
  { id: 70, module_id: 5, name: "split()" },
  { id: 71, module_id: 5, name: "join()" },
  { id: 72, module_id: 5, name: "find()" },
  { id: 73, module_id: 5, name: "count()" },
  { id: 74, module_id: 5, name: "startswith()" },
  { id: 75, module_id: 5, name: "endswith()" },
  { id: 76, module_id: 5, name: "String Comparison" },

  // Module 6: Lists
  { id: 77, module_id: 6, name: "Introduction to Lists" },
  { id: 78, module_id: 6, name: "Creating Lists" },
  { id: 79, module_id: 6, name: "List Indexing" },
  { id: 80, module_id: 6, name: "List Slicing" },
  { id: 81, module_id: 6, name: "Updating Lists" },
  { id: 82, module_id: 6, name: "Adding Elements" },
  { id: 83, module_id: 6, name: "Removing Elements" },
  { id: 84, module_id: 6, name: "List Methods" },
  { id: 85, module_id: 6, name: "append()" },
  { id: 86, module_id: 6, name: "extend()" },
  { id: 87, module_id: 6, name: "insert()" },
  { id: 88, module_id: 6, name: "remove()" },
  { id: 89, module_id: 6, name: "pop()" },
  { id: 90, module_id: 6, name: "clear()" },
  { id: 91, module_id: 6, name: "sort()" },
  { id: 92, module_id: 6, name: "reverse()" },
  { id: 93, module_id: 6, name: "List Traversal" },
  { id: 94, module_id: 6, name: "Nested Lists" },
  { id: 95, module_id: 6, name: "List Comprehension" },

  // Module 7: Tuples
  { id: 96, module_id: 7, name: "Introduction to Tuples" },
  { id: 97, module_id: 7, name: "Creating Tuples" },
  { id: 98, module_id: 7, name: "Tuple Indexing" },
  { id: 99, module_id: 7, name: "Tuple Slicing" },
  { id: 100, module_id: 7, name: "Tuple Packing" },
  { id: 101, module_id: 7, name: "Tuple Unpacking" },
  { id: 102, module_id: 7, name: "Tuple Methods" },
  { id: 103, module_id: 7, name: "Tuple vs List" },
  { id: 104, module_id: 7, name: "Nested Tuples" },

  // Module 8: Sets
  { id: 105, module_id: 8, name: "Introduction to Sets" },
  { id: 106, module_id: 8, name: "Creating Sets" },
  { id: 107, module_id: 8, name: "Adding Elements" },
  { id: 108, module_id: 8, name: "Removing Elements" },
  { id: 109, module_id: 8, name: "Set Operations" },
  { id: 110, module_id: 8, name: "Union" },
  { id: 111, module_id: 8, name: "Intersection" },
  { id: 112, module_id: 8, name: "Difference" },
  { id: 113, module_id: 8, name: "Symmetric Difference" },
  { id: 114, module_id: 8, name: "Set Methods" },
  { id: 115, module_id: 8, name: "Frozen Sets" },
  { id: 116, module_id: 8, name: "Set Comprehension" },

  // Module 9: Dictionaries
  { id: 117, module_id: 9, name: "Introduction to Dictionaries" },
  { id: 118, module_id: 9, name: "Creating Dictionaries" },
  { id: 119, module_id: 9, name: "Accessing Values" },
  { id: 120, module_id: 9, name: "Adding Key-Value Pairs" },
  { id: 121, module_id: 9, name: "Updating Dictionary" },
  { id: 122, module_id: 9, name: "Removing Elements" },
  { id: 123, module_id: 9, name: "Dictionary Methods" },
  { id: 124, module_id: 9, name: "keys()" },
  { id: 125, module_id: 9, name: "values()" },
  { id: 126, module_id: 9, name: "items()" },
  { id: 127, module_id: 9, name: "get()" },
  { id: 128, module_id: 9, name: "update()" },
  { id: 129, module_id: 9, name: "pop()" },
  { id: 130, module_id: 9, name: "Nested Dictionaries" },
  { id: 131, module_id: 9, name: "Dictionary Comprehension" },

  // Module 10: Functions
  { id: 132, module_id: 10, name: "Introduction to Functions" },
  { id: 133, module_id: 10, name: "Defining Functions" },
  { id: 134, module_id: 10, name: "Calling Functions" },
  { id: 135, module_id: 10, name: "Parameters" },
  { id: 136, module_id: 10, name: "Arguments" },
  { id: 137, module_id: 10, name: "Default Arguments" },
  { id: 138, module_id: 10, name: "Keyword Arguments" },
  { id: 139, module_id: 10, name: "Positional Arguments" },
  { id: 140, module_id: 10, name: "*args" },
  { id: 141, module_id: 10, name: "**kwargs" },
  { id: 142, module_id: 10, name: "Return Statement" },
  { id: 143, module_id: 10, name: "Multiple Return Values" },
  { id: 144, module_id: 10, name: "Scope of Variables" },
  { id: 145, module_id: 10, name: "Local Variables" },
  { id: 146, module_id: 10, name: "Global Variables" },
  { id: 147, module_id: 10, name: "Lambda Functions" },
  { id: 148, module_id: 10, name: "Recursive Functions" },
  { id: 149, module_id: 10, name: "Function Documentation" },

  // Module 11: Object-Oriented Programming (OOP)
  { id: 150, module_id: 11, name: "Introduction to OOP" },
  { id: 151, module_id: 11, name: "Classes" },
  { id: 152, module_id: 11, name: "Objects" },
  { id: 153, module_id: 11, name: "Constructors" },
  { id: 154, module_id: 11, name: "self Keyword" },
  { id: 155, module_id: 11, name: "Instance Variables" },
  { id: 156, module_id: 11, name: "Class Variables" },
  { id: 157, module_id: 11, name: "Instance Methods" },
  { id: 158, module_id: 11, name: "Class Methods" },
  { id: 159, module_id: 11, name: "Static Methods" },
  { id: 160, module_id: 11, name: "Encapsulation" },
  { id: 161, module_id: 11, name: "Inheritance" },
  { id: 162, module_id: 11, name: "Single Inheritance" },
  { id: 163, module_id: 11, name: "Multiple Inheritance" },
  { id: 164, module_id: 11, name: "Multilevel Inheritance" },
  { id: 165, module_id: 11, name: "Hierarchical Inheritance" },
  { id: 166, module_id: 11, name: "Method Overriding" },
  { id: 167, module_id: 11, name: "Polymorphism" },
  { id: 168, module_id: 11, name: "Abstraction" },

  // Module 12: Exception Handling
  { id: 169, module_id: 12, name: "Introduction to Exceptions" },
  { id: 170, module_id: 12, name: "Errors vs Exceptions" },
  { id: 171, module_id: 12, name: "try" },
  { id: 172, module_id: 12, name: "except" },
  { id: 173, module_id: 12, name: "else" },
  { id: 174, module_id: 12, name: "finally" },
  { id: 175, module_id: 12, name: "Multiple Exceptions" },
  { id: 176, module_id: 12, name: "Raising Exceptions" },
  { id: 177, module_id: 12, name: "Custom Exceptions" },

  // Module 13: File Handling
  { id: 178, module_id: 13, name: "Introduction to File Handling" },
  { id: 179, module_id: 13, name: "Opening Files" },
  { id: 180, module_id: 13, name: "Reading Files" },
  { id: 181, module_id: 13, name: "Writing Files" },
  { id: 182, module_id: 13, name: "Appending Files" },
  { id: 183, module_id: 13, name: "File Modes" },
  { id: 184, module_id: 13, name: "with Statement" },
  { id: 185, module_id: 13, name: "read()" },
  { id: 186, module_id: 13, name: "readline()" },
  { id: 187, module_id: 13, name: "readlines()" },
  { id: 188, module_id: 13, name: "write()" },
  { id: 189, module_id: 13, name: "writelines()" },
  { id: 190, module_id: 13, name: "Working with Text Files" },
  { id: 191, module_id: 13, name: "Working with CSV Files" },
  { id: 192, module_id: 13, name: "Working with JSON Files" },

  // Module 14: Modules & Packages
  { id: 193, module_id: 14, name: "Introduction to Modules" },
  { id: 194, module_id: 14, name: "Creating Modules" },
  { id: 195, module_id: 14, name: "import" },
  { id: 196, module_id: 14, name: "from...import" },
  { id: 197, module_id: 14, name: "Built-in Modules" },
  { id: 198, module_id: 14, name: "math Module" },
  { id: 199, module_id: 14, name: "random Module" },
  { id: 200, module_id: 14, name: "datetime Module" },
  { id: 201, module_id: 14, name: "os Module" },
  { id: 202, module_id: 14, name: "sys Module" },
  { id: 203, module_id: 14, name: "Creating Packages" },
  { id: 204, module_id: 14, name: "Installing External Packages" },
  { id: 205, module_id: 14, name: "pip" },

  // Module 15: Advanced Python
  { id: 206, module_id: 15, name: "Iterators" },
  { id: 207, module_id: 15, name: "Iterables" },
  { id: 208, module_id: 15, name: "Generators" },
  { id: 209, module_id: 15, name: "yield" },
  { id: 210, module_id: 15, name: "Decorators" },
  { id: 211, module_id: 15, name: "Map" },
  { id: 212, module_id: 15, name: "Filter" },
  { id: 213, module_id: 15, name: "Reduce" },
  { id: 214, module_id: 15, name: "Regular Expressions" },
  { id: 215, module_id: 15, name: "Date and Time" },
  { id: 216, module_id: 15, name: "Enumerate" },
  { id: 217, module_id: 15, name: "Zip" },
  { id: 218, module_id: 15, name: "Any and All" },
  { id: 219, module_id: 15, name: "Mutable vs Immutable Objects" },
  { id: 220, module_id: 15, name: "Shallow Copy" },
  { id: 221, module_id: 15, name: "Deep Copy" },

  // Module 16: Python Libraries
  { id: 222, module_id: 16, name: "NumPy Introduction" },
  { id: 223, module_id: 16, name: "NumPy Arrays" },
  { id: 224, module_id: 16, name: "NumPy Array Operations" },
  { id: 225, module_id: 16, name: "NumPy Indexing" },
  { id: 226, module_id: 16, name: "NumPy Slicing" },
  { id: 227, module_id: 16, name: "NumPy Basic Mathematical Operations" },
  { id: 228, module_id: 16, name: "Pandas Introduction" },
  { id: 229, module_id: 16, name: "Pandas Series" },
  { id: 230, module_id: 16, name: "Pandas DataFrame" },
  { id: 231, module_id: 16, name: "Pandas Reading CSV" },
  { id: 232, module_id: 16, name: "Pandas Data Selection" },
  { id: 233, module_id: 16, name: "Pandas Filtering" },
  { id: 234, module_id: 16, name: "Pandas Basic Data Cleaning" },
  { id: 235, module_id: 16, name: "Matplotlib Introduction" },
  { id: 236, module_id: 16, name: "Matplotlib Line Chart" },
  { id: 237, module_id: 16, name: "Matplotlib Bar Chart" },
  { id: 238, module_id: 16, name: "Matplotlib Pie Chart" },
  { id: 239, module_id: 16, name: "Matplotlib Scatter Plot" },

  // Module 17: Practice
  { id: 240, module_id: 17, name: "Basic Python problems" },
  { id: 241, module_id: 17, name: "Variables problems" },
  { id: 242, module_id: 17, name: "Conditional problems" },
  { id: 243, module_id: 17, name: "Loop problems" },
  { id: 244, module_id: 17, name: "String problems" },
  { id: 245, module_id: 17, name: "List problems" },
  { id: 246, module_id: 17, name: "Dictionary problems" },
  { id: 247, module_id: 17, name: "Function problems" },
  { id: 248, module_id: 17, name: "OOP problems" },
  { id: 249, module_id: 17, name: "File handling problems" }
];

// Content compiler for all topics
function compileTopicContent(name, id, module_name) {
  // Practice section configuration
  if (module_name === "Practice") {
    const topicType = name.replace(" problems", "");
    return {
      description: `Hands-on programming assignments focusing on ${topicType} calculations.`,
      learningObjectives: [
        `Write custom code modules applying ${topicType}`,
        "Debug syntax error states independently",
        "Deliver verified console print values"
      ],
      conceptExplanation: `This practice section provides mock problems evaluating ${topicType}. Verify conditions, syntax constraints, and construct scripts solving logic blocks.`,
      syntax: `# Practical exercise guidelines for ${topicType}\n# Implement solution below`,
      example: `# Sample validation outline\ndef solve_${topicType.toLowerCase()}(value):\n    # Complete code here\n    pass`,
      output: `Ready for submission. Click Mark as Completed and upload code.`,
      keyPoints: [
        `Difficulty ranges from Easy to Hard.`,
        `Submit script files ending in .py to update student metrics.`,
        `Points earned count towards your dashboard learning streak.`
      ],
      practiceExercise: `Exercise: Write a program that evaluates a standard input stream and solves a simple calculation for ${topicType}.`
    };
  }

  // Key python topics customizations
  switch (name) {
    case "Introduction":
      return {
        description: "What is Python, what can it do, why use it, and basic syntax comparisons.",
        learningObjectives: [
          "Understand Python history and release timeline",
          "Identify typical use cases and system scripts capabilities",
          "Contrast Python syntax constraints with curly brace languages"
        ],
        conceptExplanation: `### What is Python?
Python is a popular programming language. It was created by Guido van Rossum, and released in 1991.
It is used for:
* Web development (server-side)
* Software development
* Mathematics
* System scripting

### What can Python do?
* Python can be used on a server to create web applications.
* Python can be used alongside software to create workflows.
* Python can connect to database systems. It can also read and modify files.
* Python can be used to handle big data and perform complex mathematics.
* Python can be used for rapid prototyping, or for production-ready software development.

### Why Python?
* Python works on different platforms (Windows, Mac, Linux, Raspberry Pi, etc).
* Python has a simple syntax similar to the English language.
* Python has syntax that allows developers to write programs with fewer lines than some other programming languages.
* Python runs on an interpreter system, meaning that code can be executed as soon as it is written. This means that prototyping can be very quick.
* Python can be treated in a procedural way, an object-oriented way or a functional way.

### Good to know
* The most recent major version of Python is Python 3, which we shall be using in this tutorial.
* In this tutorial Python will be written in a text editor. It is possible to write Python in an Integrated Development Environment, such as Thonny, Pycharm, Netbeans or Eclipse which are particularly useful when managing larger collections of Python files.

### Python Syntax compared to other programming languages
* Python was designed for readability, and has some similarities to the English language with influence from mathematics.
* Python uses new lines to complete a command, as opposed to other programming languages which often use semicolons or parentheses.
* Python relies on indentation, using whitespace, to define scope; such as the scope of loops, functions and classes. Other programming languages often use curly-brackets for this purpose.`,
        syntax: 'print("Hello, World!")',
        example: 'print("Hello, World!")',
        output: "Hello, World!",
        keyPoints: [
          "Python is dynamically typed and interpreted.",
          "Indentation (spaces/tabs) is syntactically enforced to declare code blocks.",
          "Semicolons are not required to terminate statements."
        ]
      };
    case "Variables":
      return {
        description: "Declare identifiers dynamically using Python's implicit variable assignment.",
        learningObjectives: [
          "Understand identifiers naming constraints",
          "Declare variables dynamically",
          "Differentiate global vs local scope bindings"
        ],
        conceptExplanation: "In Python, variables do not require explicit type definition. The memory allocations are resolved dynamically upon initial value assignation.",
        syntax: "variable_name = value",
        example: 'x = 100\nname = "Student"\nprint(x)\nprint(name)',
        output: "100\nStudent",
        keyPoints: [
          "Variable names must start with a letter or an underscore.",
          "Variables are case-sensitive (e.g. `val` and `Val` are different).",
          "No need to declare variable types (dynamic typing)."
        ],
        practiceExercise: "Exercise: Create a variable named 'score' and assign it the integer value 95. Print the score."
      };
    case "Conditional Statements":
    case "Introduction to Conditional Statements":
      return {
        description: "Understand branching decision logic using if, elif, and else statements.",
        learningObjectives: [
          "Understand if, elif and else",
          "Write conditional expressions",
          "Use nested conditions"
        ],
        conceptExplanation: "Conditional statements allow you to execute different blocks of code based on whether a condition evaluates to True or False.",
        syntax: "if condition:\n    statement\nelse:\n    statement",
        example: 'age = 20\n\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
        output: "Adult",
        keyPoints: [
          "Python uses standard comparison operators like ==, !=, >, <, >=, <= for conditional evaluation.",
          "Each conditional block starts with a colon (:) and must be indented.",
          "The elif keyword is short for 'else if'."
        ],
        practiceExercise: "Exercise: Write an if-else statement that checks if a variable 'num' is positive or negative. Print 'Positive' or 'Negative'."
      };
    case "for Loop":
      return {
        description: "Iterate over iterable sequences using the range() function and control flows.",
        learningObjectives: [
          "Deploy index iterators with range()",
          "Iterate over standard collections",
          "Avoid common index out of bounds syntax errors"
        ],
        conceptExplanation: "A for loop in Python is used for iterating over a sequence (such as a list, a tuple, a dictionary, a set, or a string).",
        syntax: "for item in sequence:\n    statement",
        example: "for i in range(3):\n    print(i)",
        output: "0\n1\n2",
        keyPoints: [
          "The range(n) function generates integers from 0 up to n-1.",
          "For loops execute a block of code a set number of times.",
          "You can nesting for loops inside other loops."
        ],
        practiceExercise: "Exercise: Write a for loop that iterates through numbers 1 to 5 and prints them."
      };
    case "OOP":
    case "Introduction to OOP":
      return {
        description: "Model real world structures using classes, object constructs, and polymorphism.",
        learningObjectives: [
          "Define custom user classes",
          "Configure constructors with __init__",
          "Implement class variables and self attributes"
        ],
        conceptExplanation: "Object-Oriented Programming (OOP) is a programming paradigm that uses classes and objects to structure code. It aims to implement real-world entities like inheritance, polymorphism, encapsulation, etc., in programming.",
        syntax: "class ClassName:\n    def __init__(self):\n        self.attribute = value",
        example: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog("Buddy")\nprint(d.name)',
        output: "Buddy",
        keyPoints: [
          "Classes act as blueprints to create objects.",
          "The `__init__` constructor method initializes new object instances.",
          "The `self` parameter represents the specific object instance being created."
        ],
        practiceExercise: "Exercise: Write a class named 'Car' with a constructor that takes and assigns a 'model' attribute. Create an instance of 'Car' and print the model."
      };
    default:
      return {
        description: `Reference lesson content and tutorials evaluating ${name} properties.`,
        learningObjectives: [
          `Master syntax configurations of ${name}`,
          `Explore common exceptions raised during ${name} implementations`,
          `Deploy reusable algorithms applying ${name}`
        ],
        conceptExplanation: `This module details conceptual guidelines regarding ${name}. Study syntax rules, verify sample outputs, and complete evaluations.`,
        syntax: `# Standard setup for ${name}\nx = "${name}"`,
        example: `print("Module evaluation: ${name}")`,
        output: `Module evaluation: ${name}`,
        keyPoints: [
          `Ensure proper indentation rules are followed.`,
          `Avoid masking built-in namespaces when naming elements.`,
          `Review topic reference PDFs for advanced concept sheets.`
        ],
        practiceExercise: `Exercise: Write a statement that demonstrates basic declarations of ${name}.`
      };
  }
}

// 10-Question Quiz Generator containing difficulty, marks, explanation, and relatedTopic
function generate10QuizQuestions(topicName, topicId) {
  if (topicId === 1 || topicName === "Introduction to Python") {
    return [
      {
        id: `q${topicId}-1`,
        question: `Who created Python, and when was it first released?`,
        options: [
          "James Gosling, 1995",
          "Guido van Rossum, 1991",
          "Dennis Ritchie, 1972",
          "Bjarne Stroustrup, 1985"
        ],
        correctAnswer: 1,
        explanation: "Python was created by Guido van Rossum and first released in 1991.",
        difficulty: "Easy",
        marks: 1,
        relatedTopic: "Introduction"
      },
      {
        id: `q${topicId}-2`,
        question: `Which of the following is NOT a common use of Python?`,
        options: [
          "Web development",
          "Data and mathematical calculations",
          "System scripting",
          "Designing computer hardware circuits directly"
        ],
        correctAnswer: 3,
        explanation: "Python is a software programming and scripting language; it cannot be used to design physical silicon hardware circuits directly.",
        difficulty: "Easy",
        marks: 1,
        relatedTopic: "Introduction"
      },
      {
        id: `q${topicId}-3`,
        question: `Why is Python considered easy to learn?`,
        options: [
          "It requires complex syntax",
          "It uses only mathematical symbols",
          "It has simple and readable syntax similar to the English language",
          "It requires curly brackets for every statement"
        ],
        correctAnswer: 2,
        explanation: "Python's design emphasizes clean, simple syntax that resembles the English language.",
        difficulty: "Easy",
        marks: 1,
        relatedTopic: "Introduction"
      },
      {
        id: `q${topicId}-4`,
        question: `What does Python use to define the scope of loops, functions, and classes?`,
        options: [
          "Curly brackets { }",
          "Semicolons ;",
          "Indentation/whitespace",
          "Square brackets [ ]"
        ],
        correctAnswer: 2,
        explanation: "Python enforces whitespace indentation to define code blocks instead of using curly brackets.",
        difficulty: "Easy",
        marks: 1,
        relatedTopic: "Introduction"
      },
      {
        id: `q${topicId}-5`,
        question: `What is the output of the following Python program?\nprint("Hello, World!")`,
        options: [
          "Hello",
          "World!",
          "Hello, World!",
          "\"Hello, World!\""
        ],
        correctAnswer: 2,
        explanation: "The print() function prints the string value passed inside it ('Hello, World!') directly to the console.",
        difficulty: "Easy",
        marks: 1,
        relatedTopic: "Introduction"
      }
    ];
  }

  // Fallback for other modules
  return [
    {
      id: `q${topicId}-1`,
      question: `What is the expected output of the following evaluation expression? \n\nprint(2 + 3 * 4)`,
      options: ["20", "14", "24", "10"],
      correctAnswer: 1,
      explanation: "Multiplication is performed before addition because of standard arithmetic operator precedence in Python.",
      difficulty: "Easy",
      marks: 1,
      relatedTopic: "Operator Precedence"
    },
    {
      id: `q${topicId}-2`,
      question: `True or False: Identifiers or variable names in Python are case-sensitive.`,
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "Yes, Python is case-sensitive. Identifiers like 'age' and 'Age' represent two distinct variable bindings.",
      difficulty: "Easy",
      marks: 1,
      relatedTopic: "Python Identifiers"
    },
    {
      id: `q${topicId}-3`,
      question: `Which validation rule is syntactically enforced to denote code blocks in Python?`,
      options: [
        "Curly braces enclosing statements",
        "Semicolons ending every line",
        "Whitespace indentation",
        "Double spaces between characters"
      ],
      correctAnswer: 2,
      explanation: "Python uses indentation to define code blocks (functions, loops, conditionals) instead of curly braces.",
      difficulty: "Easy",
      marks: 1,
      relatedTopic: "Python Syntax"
    },
    {
      id: `q${topicId}-4`,
      question: `What error is raised if a variable is accessed before it has been declared or initialized?`,
      options: [
        "NameError",
        "ValueError",
        "TypeError",
        "IndexError"
      ],
      correctAnswer: 0,
      explanation: "Accessing an undefined variable name triggers a NameError at runtime.",
      difficulty: "Medium",
      marks: 2,
      relatedTopic: "Variables"
    },
    {
      id: `q${topicId}-5`,
      question: `Which data type is categorized as mutable in Python?`,
      options: [
        "String",
        "Tuple",
        "List",
        "Integer"
      ],
      correctAnswer: 2,
      explanation: "Lists are mutable; their elements can be modified, appended, or sorted in-place. Strings and tuples are immutable.",
      difficulty: "Medium",
      marks: 2,
      relatedTopic: "Data Types"
    },
    {
      id: `q${topicId}-6`,
      question: `What keyword is used to skip the current iteration in a loop and proceed to the next cycle?`,
      options: [
        "break",
        "continue",
        "pass",
        "exit"
      ],
      correctAnswer: 1,
      explanation: "The continue statement stops the current loop block iteration and skips to the next cycle check.",
      difficulty: "Easy",
      marks: 1,
      relatedTopic: "Loops"
    },
    {
      id: `q${topicId}-7`,
      question: `What is the default return value of a function that does not contain an explicit return statement?`,
      options: [
        "0",
        "False",
        "None",
        "Void"
      ],
      correctAnswer: 2,
      explanation: "In Python, functions return None by default if no return expression is executed.",
      difficulty: "Medium",
      marks: 1,
      relatedTopic: "Functions"
    },
    {
      id: `q${topicId}-8`,
      question: `In Object-Oriented Python, what parameter must every instance method take as its first argument?`,
      options: [
        "this",
        "self",
        "class",
        "instance"
      ],
      correctAnswer: 1,
      explanation: "The first argument of instance methods is conventionally named 'self', referring to the specific object instance.",
      difficulty: "Easy",
      marks: 1,
      relatedTopic: "self Keyword"
    },
    {
      id: `q${topicId}-9`,
      question: `Which statement block compiles clean operations that must execute regardless of whether an exception was raised or handled?`,
      options: [
        "try",
        "except",
        "finally",
        "else"
      ],
      correctAnswer: 2,
      explanation: "The finally block executes unconditionally, making it ideal for clean-up tasks like closing file streams.",
      difficulty: "Medium",
      marks: 2,
      relatedTopic: "Exception Handling"
    },
    {
      id: `q${topicId}-10`,
      question: `Which symbol represents the modulo division operator to find arithmetic remainders?`,
      options: [
        "/",
        "%",
        "//",
        "&"
      ],
      correctAnswer: 1,
      explanation: "The % operator calculates the remainder after integer division (e.g. 5 % 2 yields 1).",
      difficulty: "Easy",
      marks: 1,
      relatedTopic: "Operators"
    }
  ];
}

// Compile all topics database table
export const TOPICS_DB = TOPICS_STRUCT_RAW.map(t => {
  const mod = MODULES_DB.find(m => m.module_id === t.module_id);
  const details = compileTopicContent(t.name, t.id, mod.module_name);
  
  // Dynamic metadata assignment
  let difficulty = "Easy";
  let estimatedTime = "15 mins";
  let prerequisites = "None";
  
  if (t.module_id > 4 && t.module_id <= 10) {
    difficulty = "Medium";
    estimatedTime = "20 mins";
    prerequisites = "Variables & Operators";
  } else if (t.module_id > 10) {
    difficulty = "Hard";
    estimatedTime = "30 mins";
    prerequisites = "Functions & OOP";
  }

  // Prepopulate standard common mistakes based on modules or topics
  let commonMistakes = [
    "Syntax error: forgetting the colons (:) at the end of declaration lines.",
    "Indentation error: mixing tabs and spaces in code blocks."
  ];

  if (mod.module_name.includes("String")) {
    commonMistakes = [
      "Forgetting that strings are immutable and trying to modify index values directly (e.g. s[0] = 'a').",
      "Off-by-one errors when slicing strings."
    ];
  } else if (mod.module_name.includes("List")) {
    commonMistakes = [
      "Accessing list index indices out of bounds (IndexError).",
      "Confusing append() (adds element) with extend() (unpacks iterable)."
    ];
  } else if (mod.module_name.includes("Dict")) {
    commonMistakes = [
      "KeyError: accessing keys that do not exist in the dictionary without using get().",
      "Confusing keys() and values() iteration outputs."
    ];
  } else if (mod.module_name.includes("Function")) {
    commonMistakes = [
      "Forgetting return statements when a function is expected to return values.",
      "Accessing local variables outside their defined function scope."
    ];
  } else if (mod.module_name.includes("OOP")) {
    commonMistakes = [
      "Forgetting to pass self as the first parameter to constructor and instance methods.",
      "Confusing class variables with instance variables."
    ];
  } else if (mod.module_name.includes("Exception")) {
    commonMistakes = [
      "Catching too broad exceptions (like except Exception) which hides programming bugs.",
      "Forgetting that finally block will execute even if return statement is called in try."
    ];
  } else if (mod.module_name.includes("File")) {
    commonMistakes = [
      "Forgetting to close open file handlers (always use the 'with' statement instead!).",
      "Incorrect directory path formats on different Operating Systems."
    ];
  }

  // PDF file names matching Section 26: 01_Introduction_to_Python.pdf formats
  const cleanPdfName = `${String(t.id).padStart(2, '0')}_${t.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  return {
    id: t.id,
    module_id: t.module_id,
    category: mod.module_name,
    name: t.name,
    description: details.description,
    learningObjectives: details.learningObjectives,
    conceptExplanation: details.conceptExplanation,
    syntax: details.syntax,
    example: details.example,
    output: details.output,
    keyPoints: details.keyPoints,
    practiceExercise: details.practiceExercise,
    commonMistakes,
    difficulty,
    estimatedTime,
    prerequisites,
    videoStatus: "Coming Soon", 
    materials: [
      { id: `m${t.id}-1`, type: "pdf", title: cleanPdfName, size: "1.2 MB" },
      { id: `m${t.id}-2`, type: "video", title: `${t.name} Video Lesson` } 
    ],
    assignment: {
      id: `a${t.id}`,
      title: `Assignment: Practice on ${t.name}`,
      description: `Complete the practical exercises evaluating ${t.name}. Submit your python code file (.py) below.`,
      dueDate: "2026-12-31"
    }
  };
});

// Compile quizzes associated with modules
export const QUIZZES_DB = MODULES_DB.map(m => {
  return {
    id: `q-mod-${m.module_id}`,
    module_id: m.module_id,
    title: `Quiz: ${m.module_name} Mastery`,
    questions: generate10QuizQuestions(m.module_name, m.module_id)
  };
});

// Update initial course syllabus to start preloaded with all 200+ topics and module-level quizzes
export const INITIAL_COURSE = {
  id: "py-101",
  title: "Python Programming",
  instructor: "Dr. Alok Verma",
  duration: "8 Weeks",
  description: "A complete, comprehensive pathway to master Python programming from basics to advanced libraries.",
  topics: TOPICS_DB,
  quizzes: QUIZZES_DB
};

// INITIAL STUDENT STATE (Mocked Database)
export const INITIAL_STUDENT_STATE = {
  profile: {
    name: "Krish Patel",
    email: "krish.patel@college.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
  },
  completedTopics: [], 
  quizAttempts: [], 
  assignmentSubmissions: [], 
  studySessions: [
    { date: "Mon", hours: 0 },
    { date: "Tue", hours: 0 },
    { date: "Wed", hours: 0 },
    { date: "Thu", hours: 0 },
    { date: "Fri", hours: 0 },
    { date: "Sat", hours: 0 },
    { date: "Sun", hours: 0 }
  ],
  totalStudySeconds: 0
};

// RULE-BASED ANALYTICS LOGIC (Pure Math/Stat/Threshold Rules)
export function analyzePerformance(state, course) {
  const topics = course.topics || [];
  const attempts = state.quizAttempts || [];
  
  // 1. Course Progress Calculation (Handles division by zero)
  const progressPercent = topics.length > 0
    ? Math.round((state.completedTopics.length / topics.length) * 100)
    : 0;
  
  // 2. Quiz Performance Summary
  const totalQuizzesAttempted = attempts.length;
  const avgQuizScore = totalQuizzesAttempted > 0
    ? Math.round(attempts.reduce((sum, item) => sum + item.percent, 0) / totalQuizzesAttempted)
    : 0;

  // 3. Assignment Performance
  const submittedAssignmentsCount = state.assignmentSubmissions.length;
  
  // 4. Topic-wise classification (Rules engine)
  const topicAnalysis = topics.map(topic => {
    const attempt = attempts.find(a => a.quizId === 'q-mod-' + topic.module_id);
    const isCompleted = state.completedTopics.includes(topic.id);
    
    let status = "Not Started";
    let score = null;
    let recommendations = [];
    
    if (attempt) {
      score = attempt.percent;
      // Rule-based classification
      if (score < 60) {
        status = "Needs Practice";
        recommendations = [
          "Re-read the topic note sheet carefully.",
          "Review syntax rules and console example structures.",
          "Re-attempt Module Quiz to score above 60%.",
          "Attempt Assignment " + topic.id + " (" + topic.assignment.title + ") for hands-on practice."
        ];
      } else if (score >= 60 && score < 80) {
        status = "Good";
        recommendations = [
          "Complete code exercise challenges related to " + topic.name + ".",
          "Verify your Assignment " + topic.id + " submissions match constraints.",
          "Read intermediate concepts for " + topic.name + " to push score to 80%."
        ];
      } else {
        status = "Strong";
        recommendations = [
          "Perfect! Move on to the next topic module.",
          "Help fellow students in class who have 'Needs Practice' on " + topic.name + ".",
          "Try implementing a mini-project applying these concepts."
        ];
      }
    } else if (isCompleted) {
      status = "Completed (No Quiz)";
      recommendations = ["Take Module Quiz to evaluate your learning performance."];
    } else {
      recommendations = [
        "Read notes: '" + topic.materials.find(m => m.type === 'pdf').title + "'.",
        "Mark topic as completed after study.",
        "Take Module Quiz to verify your understanding."
      ];
    }
    
    return {
      topicId: topic.id,
      name: topic.name,
      status,
      score,
      recommendations
    };
  });
  
  // Categorize lists based on status
  const weakTopics = topicAnalysis.filter(t => t.status === "Needs Practice" || (t.score !== null && t.score < 60));
  const goodTopics = topicAnalysis.filter(t => t.status === "Good");
  const strongTopics = topicAnalysis.filter(t => t.status === "Strong");
  const pendingWork = topics.filter(topic => {
    const isSubmitted = state.assignmentSubmissions.some(s => s.assignmentId === topic.assignment.id);
    const isQuizAttempted = attempts.some(a => a.quizId === 'q-mod-' + topic.module_id);
    return !isSubmitted || !isQuizAttempted;
  });

  return {
    progressPercent,
    avgQuizScore,
    totalQuizzesAttempted,
    submittedAssignmentsCount,
    topicAnalysis,
    weakTopics,
    goodTopics,
    strongTopics,
    pendingWork
  };
}
