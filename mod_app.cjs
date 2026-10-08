const fs = require('fs');
let data = fs.readFileSync('src/App.jsx', 'utf8');

data = data.replace(
  /\} catch \(e\) \{[\s\S]*?console\.warn\("PHP Backend offline or unavailable, falling back to local mock data:", e\);[\s\S]*?\/\/\s*LOAD LOCAL FALLBACK DATA[\s\S]*?setDbAnalytics\(null\); \/\/ Fallback to calculate performance from local state\r?\n      \}/,
  `} catch (e) {
        console.error("Failed to fetch data from backend:", e);
        // Do not fall back to mock data so we can test the real integration
      }`
);

fs.writeFileSync('src/App.jsx', data);
console.log("Modified App.jsx fallbacks removed");
