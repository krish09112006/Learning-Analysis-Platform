const fs = require('fs');
let data = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

data = data.replace(
  /import React from 'react';/,
  `import React, { useState, useEffect } from 'react';\nimport studentDashboardService from '../services/studentDashboardService';`
);

data = data.replace(
  /export default function Dashboard\(\{([^}]+)\}\) \{/,
  `export default function Dashboard({$1}) {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    studentDashboardService.getDashboardStats().then(setDashboardData).catch(console.error);
  }, []);`
);

data = data.replace(
  /const totalTopics = course\.topics \? course\.topics\.length : 0;/,
  `// Dynamic status checks
  const totalTopics = course.topics ? course.topics.length : 0;`
);

data = data.replace(
  /const hasStudySessions = student\.totalStudySeconds > 0;/,
  `const totalStudySeconds = dashboardData ? dashboardData.totalStudySeconds : student.totalStudySeconds;
  const hasStudySessions = totalStudySeconds > 0;`
);

data = data.replace(
  /const studyTimeData = formatTotalTime\(student\.totalStudySeconds\);/,
  `const studyTimeData = formatTotalTime(totalStudySeconds);`
);

data = data.replace(
  /\{ id: 1, text: "Start Python Programming Course", type: "course" \}/,
  `{ id: 1, text: dashboardData && dashboardData.totalCourses === 0 ? "Enroll in a new course" : "Start Python Programming Course", type: "course" }`
);

fs.writeFileSync('src/pages/Dashboard.jsx', data);
console.log("Modified Dashboard.jsx");
