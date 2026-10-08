const fs = require('fs');
let data = fs.readFileSync('src/App.jsx', 'utf8');

const imports = `import StudyPlanner from './pages/StudyPlanner';
import Notifications from './pages/Notifications';
import Certificates from './pages/Certificates';
import Discussions from './pages/Discussions';`;

data = data.replace(/import CourseSelection from '\.\/pages\/CourseSelection';/, `import CourseSelection from './pages/CourseSelection';\n${imports}`);

const routing = `
          {activePage === 'available_courses' && <CourseSelection onSelectCourse={(id) => { setSelectedCourseId(id); setActivePage('courses'); }} />}
          {activePage === 'assignments' && <Courses student={studentState} course={courseState} activePage="assignments" />}
          {activePage === 'planner' && <StudyPlanner />}
          {activePage === 'notifications' && <Notifications />}
          {activePage === 'certificates' && <Certificates />}
          {activePage === 'discussions' && <Discussions />}
`;

// Insert into routing area. 
// Let's find: {activePage === 'courses' && <Courses ... />}
data = data.replace(
  /\{activePage === 'courses' && <Courses[^>]*>\}/,
  `$&${routing}`
);

fs.writeFileSync('src/App.jsx', data);
console.log("Modified App.jsx for new pages");
