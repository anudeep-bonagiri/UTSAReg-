const catalog = [
    {
        "code": "CS 1063",
        "title": "Introduction to Computer Programming I",
        "creditHours": 3,
        "description": "Prerequisite: Completion of or concurrent enrollment in MAT 1073 or the equivalent. An introduction to computer programming using a modern object-oriented computer language. Topics include assignment, decisions, loops, methods, and arrays using objects. Generally offered: Fall, Spring, Summer."
    },
    {
        "code": "CS 1083",
        "title": "Programming I for Computer Scientists",
        "creditHours": 3,
        "description": "Prerequisite: Completion of or concurrent enrollment in MAT 1073 or the equivalent. An introduction to computer programming emphasizing structured programming, problem-solving, and algorithmic thinking. Topics include assignments, decisions, loops, methods, and arrays. Students intending to major or minor in Computer Science should take this course instead of CS 1063. Generally offered: Fall, Spring, Summer."
    },
    {
        "code": "CS 1153",
        "title": "Game Programming",
        "creditHours": 3,
        "description": "Prerequisite: Computer literacy. Introduction to game design and programming. Common practices used in the video game industry today will also be introduced. Students will learn the basics of creating a PC game through lecture material, hands-on laboratories, and a final project in which the students will build a simple game. Generally offered: Fall."
    },
    {
        "code": "CS 1173",
        "title": "Data Analysis and Visualization",
        "creditHours": 3,
        "description": "Prerequisite: MAT 1023. Introduction to computation for data analysis and visualization in a programming language such as MATLAB or R. Programming concepts including functions, scripting, loops and logic, handling of vectors, and structured data are explored in the context of working with and plotting real data. May be applied toward the Mathematics Core Curriculum requirement."
    },
    {
        "code": "CS 2073",
        "title": "Computer Programming with Engineering Applications",
        "creditHours": 3,
        "description": "Prerequisite: MAT 1213 and completion of or concurrent enrollment in MAT 1223. Algorithmic approaches to problem solving and computer program design for engineers. Engineering and mathematically-oriented problem sets will be emphasized, including nonnumeric applications. Searching, sorting, linked lists, and data typing will be introduced."
    },
    {
        "code": "CS 2113",
        "title": "Fundamentals of Object-Oriented Programming",
        "creditHours": 3,
        "description": "Prerequisite: CS 1083. Extended programming concepts, including multidimensional arrays, file input/output, and recursion. Applies the object-oriented programming paradigm, focusing on the definition and use of classes along with the fundamentals of object-oriented design. Includes basic analysis of algorithms, searching and sorting techniques, and an introduction to software engineering."
    },
    {
        "code": "CS 2123",
        "title": "Data Structures",
        "creditHours": 3,
        "description": "Prerequisite: CS 2113. Abstract data structures (stacks, queues, lists, trees), recursion, sorting, and searching. Implementation of data structures using explicit memory management and introduction to abstract data type design and encapsulation. Generally offered: Fall, Spring, Summer."
    },
    {
        "code": "CS 2233",
        "title": "Discrete Mathematical Structures",
        "creditHours": 3,
        "description": "Prerequisites: MAT 1093 and one of the following: CS 1083, CS 1063, CS 2073, CPE 2073. Survey and development of theoretical tools suitable for describing algorithmic applications. Propositional and predicate calculus, proofs, induction, order notation, recurrences, and discrete structures."
    },
    {
        "code": "CS 2713",
        "title": "Computer Programming in C",
        "creditHours": 3,
        "description": "Prerequisite: CS 2113. Extended programming concepts, including multidimensional arrays, pointers, dynamic memory allocation/deallocation, and recursion. Problem-solving methods, algorithm development, and implementation. Generally offered: Fall, Spring, Summer."
    },
    {
        "code": "CS 3113",
        "title": "Principles of Cybersecurity",
        "creditHours": 3,
        "description": "Prerequisite: CS 2713 and completion of or concurrent enrollment in CS 2123. An introductory course in Cybersecurity, including an examination of the fundamental principles underlying cybersecurity, how these principles interrelate, and how they are typically employed to secure computer systems and networks."
    },
    {
        "code": "CS 3333",
        "title": "Mathematical Foundations of Computer Science",
        "creditHours": 3,
        "description": "Prerequisite: CS 2233 and MAT 1213. Survey and development of mathematical and statistical tools suitable for describing algorithmic applications. Probability, statistical models, number theory, and combinatorics. Generally offered: Fall, Spring, Summer."
    },
    {
        "code": "CS 3343",
        "title": "Design and Analysis of Algorithms",
        "creditHours": 3,
        "description": "Prerequisite: CS 2123, CS 2233, and CS 3333. Analysis of the performance of algorithms; discussion of programming techniques and data structures used in the writing of effective algorithms. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3423",
        "title": "Systems Programming",
        "creditHours": 3,
        "description": "Prerequisite: CS 2123 and CS 2713. A study of systems-level programming in a specific system (at present, Unix). Focus on concepts and tools to support the construction of systems programs. Generally offered: Fall, Spring, Summer."
    },
    {
        "code": "CS 3433",
        "title": "Computer and Information Security",
        "creditHours": 3,
        "description": "Prerequisite: CS 3423 and consent of instructor. An introduction to the protection of computer systems and networks. Topics will include authentication, access controls, malicious software, formal security methods, firewalls, intrusion detection, cryptography and information hiding, risk management, computer forensics, and ethics. Generally offered: Fall."
    },
    {
        "code": "CS 3443",
        "title": "Application Programming",
        "creditHours": 3,
        "description": "Prerequisite: CS 2123. Advanced application development in a current object-oriented language. Introduction to the software life cycle, best programming practices, and modern development tools. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3523",
        "title": "Windows Systems Programming",
        "creditHours": 3,
        "description": "Prerequisite: CS 2123 and CS 2713. A study of systems-level programming in the Windows Operating System. Focus on concepts and tools to support the construction of Windows systems programs."
    },
    {
        "code": "CS 3723",
        "title": "Programming Languages",
        "creditHours": 3,
        "description": "Prerequisite: CS 2713, CS 2233, and CS 3443. An introduction to high-level procedural, functional, and object-oriented programming languages, their theoretical foundations, organization, and implementation. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3733",
        "title": "Operating Systems",
        "creditHours": 3,
        "description": "Prerequisite: CS 3423, CS 3443, and CS 3843. An introduction to the functions and major techniques of a modern multiprogramming operating system. Includes exposure to the fundamentals of processor management, process synchronization, memory management, and peripheral management. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3743",
        "title": "Database Systems",
        "creditHours": 3,
        "description": "Prerequisite: CS 2123 and CS 2233. Study of fundamentals of database systems. Topics include basic concepts, various data models, database design, storage systems, indexing and hashing, database application design and implementation, and commercially available database systems. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3753",
        "title": "Data Science",
        "creditHours": 3,
        "description": "Prerequisite: CS 2123 and CS 3333. Study of fundamental methods and models of data science. Topics include data management, Extract-Transform-Loading methods, machine learning models, and data visualization."
    },
    {
        "code": "CS 3773",
        "title": "Software Engineering",
        "creditHours": 3,
        "description": "Prerequisite: CS 3443. Introduction to different aspects of software engineering with the concentration on processes, methods, and tools for developing reliable software-centered systems. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3783",
        "title": "Software Requirements Engineering",
        "creditHours": 3,
        "description": "Prerequisite: CS 3443. This course covers the process of eliciting, analyzing, specifying, validating, and managing software requirements. It introduces techniques to capture user stories, requirements traceability, and requirements process management."
    },
    {
        "code": "CS 3793",
        "title": "Artificial Intelligence",
        "creditHours": 3,
        "description": "Prerequisite: CS 3753 and MAT 2253. This course covers the construction of programs that use knowledge representation and reasoning to solve problems. Major topics include informed search, logical and probabilistic inference, machine learning, planning, and natural language processing. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3843",
        "title": "Computer Organization",
        "creditHours": 3,
        "description": "Prerequisite: CS 2713 or equivalent. Organization of a computer system is introduced at block diagram level. Programming in assembly language and understanding the macroarchitecture of a computer is emphasized. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3853",
        "title": "Computer Architecture",
        "creditHours": 3,
        "description": "Prerequisite: CS 3843 and CS 2123. Instruction set architecture, datapath and control unit design, advanced computer arithmetic, pipelining, memory hierarchy and I/O subsystem, performance issues. Generally offered: Fall, Spring."
    },
    {
        "code": "CS 3873",
        "title": "Computer Networks",
        "creditHours": 3,
        "description": "Prerequisite: CS 3423 and CS 3443. Network architecture, TCP/IP protocol suite, routing, data-link layer protocols, medium access control protocols, error detection and recovery, local area networks, wireless and mobile networks. Generally offered: Spring."
    }
];

const sections = [
    {
        "CRN": "19697",
        "Subject": "CS",
        "Course Number": "1063",
        "Section": "001",
        "Title": "Intro to Comp Programming I",
        "Instructor": "Rutherford, L.",
        "Days": "Internet",
        "Time": "Internet",
        "Status": "Open"
    },
    {
        "CRN": "14753",
        "Subject": "CS",
        "Course Number": "1083",
        "Section": "001",
        "Title": "Prog I for Computer Scientists",
        "Instructor": "Gomez Morales, M.",
        "Days": "MWF",
        "Time": "9:00-9:50am",
        "Status": "Open"
    },
    {
        "CRN": "26011",
        "Subject": "CS",
        "Course Number": "2123",
        "Section": "002",
        "Title": "Data Structures",
        "Instructor": "Sherette, J.",
        "Days": "MWF",
        "Time": "12:00-12:50pm",
        "Status": "Open"
    },
    {
        "CRN": "10184",
        "Subject": "CS",
        "Course Number": "3343",
        "Section": "001",
        "Title": "Design Analysis of Algorithms",
        "Instructor": "Najem, Z.",
        "Days": "MWF",
        "Time": "12:00-12:50pm",
        "Status": "Open"
    },
    {
        "CRN": "13402",
        "Subject": "CS",
        "Course Number": "3443",
        "Section": "001",
        "Title": "Application Programming",
        "Instructor": "Alkittawi, H.",
        "Days": "MWF",
        "Time": "10:00-10:50am",
        "Status": "Open"
    }
];

// Simplified mapping for the first batch
const merged = sections.map(sec => {
    const courseCode = `${sec.Subject} ${sec["Course Number"]}`;
    const courseInfo = catalog.find(c => c.code === courseCode);
    return {
        ...sec,
        description: courseInfo?.description || "No description available.",
        creditHours: courseInfo?.creditHours || 3
    };
});

console.log(JSON.stringify(merged, null, 2));
