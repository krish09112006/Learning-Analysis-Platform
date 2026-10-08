const fs = require('fs');
let data = fs.readFileSync('src/pages/AuthPage.jsx', 'utf8');

data = data.replace(
  /\} catch \(err\) \{[\s\S]*?console\.warn\("Backend API offline, falling back to mock login verification:", err\);[\s\S]*?\}, 1200\);\r?\n    \}/,
  `} catch (err) {
      setError(err.message || 'Invalid email or password.');
    }`
);

data = data.replace(
  /\} catch \(err\) \{[\s\S]*?console\.warn\("Backend API offline, saving credentials to mock database locally:", err\);[\s\S]*?\}, 2200\);\r?\n    \}/,
  `} catch (err) {
      setError(err.message || 'Registration failed.');
    }`
);

data = data.replace(/const getMockUsersDB = \(\) => \{[\s\S]*?return defaultDB;\r?\n  \};\r?\n/, '');

fs.writeFileSync('src/pages/AuthPage.jsx', data);
console.log("Modified AuthPage.jsx fallbacks removed");
