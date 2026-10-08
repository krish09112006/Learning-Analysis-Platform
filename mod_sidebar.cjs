const fs = require('fs');
let data = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

const newMenuItems = `  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'available_courses', label: 'Available Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'planner', label: 'Study Planner', icon: Layers },
    { id: 'analytics', label: 'Analytics & Advisor', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Sparkles },
    { id: 'discussions', label: 'Discussions & Doubts', icon: HelpCircle },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'profile', label: 'My Profile', icon: User },
  ];`;

data = data.replace(/const studentMenuItems = \[[^\]]*\];/, newMenuItems);
fs.writeFileSync('src/components/Sidebar.jsx', data);
console.log("Modified Sidebar");
