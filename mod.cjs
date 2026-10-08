const fs = require('fs');
let data = fs.readFileSync('src/pages/Profile.jsx', 'utf8');

data = data.replace(
  /import React, { useState } from 'react';/,
  `import React, { useState, useEffect } from 'react';\nimport studentDashboardService from '../services/studentDashboardService';`
);

data = data.replace(
  /const \[email, setEmail\] = useState\(student.profile.email\);\r?\n  const \[isSaved, setIsSaved\] = useState\(false\);/,
  `const [email, setEmail] = useState(student.profile.email);
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    studentDashboardService.getProfile().then(d => {
      if(d && typeof d === 'object' && !d.error) {
        setBranch(d.branch || '');
        setSemester(d.semester || '');
      }
    }).catch(console.error);
  }, []);`
);

// Add fields to form
const newFields = `
            <div style={styles.inputGroup}>
              <label style={styles.label}>Branch</label>
              <div style={styles.inputWrapper}>
                <input 
                  type="text" 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)} 
                  style={styles.input} 
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Semester</label>
              <div style={styles.inputWrapper}>
                <input 
                  type="number" 
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)} 
                  style={styles.input} 
                  placeholder="e.g. 5"
                />
              </div>
            </div>
`;

data = data.replace(
  /<button type="submit" style=\{styles.saveBtn\}>/,
  newFields + '\n            <button type="submit" style={styles.saveBtn}>'
);

// Also replace handleSubmit to call api
data = data.replace(
  /updateProfile\(name, email\);/,
  `studentDashboardService.updateProfile({ name, branch, semester }).then(() => updateProfile(name, email)).catch(e => alert(e.message));`
);

fs.writeFileSync('src/pages/Profile.jsx', data);
console.log("Modified Profile.jsx");
