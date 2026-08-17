import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Award, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Local storage mock users DB
  const getMockUsersDB = () => {
    const db = localStorage.getItem('lap_users_db');
    if (db) return JSON.parse(db);
    
    // Seed default credentials
    const defaultDB = [
      {
        name: "Krish Patel",
        email: "krish.patel@college.edu",
        password: "password123",
        enrolledCourses: ["py-101"] // Default pre-enrolled for demo
      }
    ];
    localStorage.setItem('lap_users_db', JSON.stringify(defaultDB));
    return defaultDB;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const db = getMockUsersDB();
    const matchedUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matchedUser) {
      setError('No student account found with this email. Please register first.');
      return;
    }
    
    if (matchedUser.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    setSuccessMsg('Authentication successful! Opening workspace...');
    setTimeout(() => {
      onAuthSuccess({
        name: matchedUser.name,
        email: matchedUser.email,
        enrolledCourses: matchedUser.enrolledCourses || []
      });
    }, 1200);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Full Student Name validation (no numbers, must contain a space)
    if (/\d/.test(name)) {
      setError('Full Student Name must not contain numbers.');
      return;
    }
    if (!name.trim().includes(' ')) {
      setError('Please enter your full name (first name and last name separated by a space).');
      return;
    }

    // Single letter name validation
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.some(part => part.length < 2)) {
      setError('Each part of the name must be at least 2 characters long (no single letters).');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Numbers only password validation
    if (/^\d+$/.test(password)) {
      setError('Password cannot consist of numbers only. Please include at least one letter or symbol.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const db = getMockUsersDB();
    const alreadyExists = db.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (alreadyExists) {
      setError('An account with this email is already registered. Try logging in.');
      return;
    }

    // Register user with empty enrollments
    const newUser = {
      name,
      email,
      password,
      enrolledCourses: [] // Course selection required
    };

    db.push(newUser);
    localStorage.setItem('lap_users_db', JSON.stringify(db));
    
    setSuccessMsg('Registration successful! Please sign in using your credentials.');
    
    // Switch to login tab and pre-fill fields after a brief delay
    setTimeout(() => {
      setActiveTab('login');
      setSuccessMsg('');
      setError('');
      setPassword('');
      setConfirmPassword('');
    }, 2200);
  };

  // Reset error when switching tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={styles.authContainer}>
      <div className="glass-card animate-fade-in" style={styles.authCard}>
        
        {/* Left Side: Brand & Visuals */}
        <div style={styles.visualCol}>
          <div style={styles.brandLogo}>
            <Award size={26} color="#8b5cf6" />
            <h2 style={styles.brandName}>EduAnalytics</h2>
          </div>
          
          <div style={styles.infoTextContainer}>
            <h3 style={styles.infoHeading}>Accelerate Learning Through Analytics.</h3>
            <p style={styles.infoDesc}>
              Log in to access your classroom curriculum. Complete quizzes, upload assignments, track active study sessions, and unlock data-driven performance advisory insights.
            </p>
          </div>
          
          <div style={styles.visualFooter}>
            <div style={styles.shieldBadge}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Rule-Based Analytical Thresholds (No AI/ML)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Forms */}
        <div style={styles.formCol}>
          
          {/* Tab Selector Buttons */}
          <div style={styles.tabHeader}>
            <button 
              onClick={() => switchTab('login')} 
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'login' ? styles.tabBtnActive : {})
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => switchTab('register')} 
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'register' ? styles.tabBtnActive : {})
              }}
            >
              Register Account
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="animate-fade-in" style={styles.errorBox}>
              <AlertCircle style={{marginRight: '8px'}} size={14} />
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="animate-fade-in" style={styles.successBox}>
              <ShieldCheck style={{marginRight: '8px'}} size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} style={styles.form}>
              <div style={styles.formInfo}>
                <h4 style={styles.formTitle}>Welcome Back</h4>
                <p style={styles.formSubtitle}>Sign in to access your student learning account and dashboard.</p>
              </div>

              <div style={styles.inputField}>
                <label style={styles.fieldLabel}>Academic Email</label>
                <div style={styles.inputWrapper}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input 
                    type="email" 
                    placeholder="name@college.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input} 
                    required 
                  />
                </div>
              </div>

              <div style={styles.inputField}>
                <label style={styles.fieldLabel}>Secure Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" style={styles.submitBtn}>
                Sign In To Dashboard <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={styles.form}>
              <div style={styles.formInfo}>
                <h4 style={styles.formTitle}>New Student Registration</h4>
                <p style={styles.formSubtitle}>Create a student profile to enroll in courses and track milestones.</p>
              </div>

              <div style={styles.inputField}>
                <label style={styles.fieldLabel}>Full Student Name</label>
                <div style={styles.inputWrapper}>
                  <User size={16} style={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Krish Patel" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input} 
                    required 
                  />
                </div>
              </div>

              <div style={styles.inputField}>
                <label style={styles.fieldLabel}>Academic Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input 
                    type="email" 
                    placeholder="name@college.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input} 
                    required 
                  />
                </div>
              </div>

              <div style={styles.inputField}>
                <label style={styles.fieldLabel}>Create Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimum 6 characters" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={styles.inputField}>
                <label style={styles.fieldLabel}>Confirm Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Repeat password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" style={styles.submitBtn}>
                Register & Select Course <ArrowRight size={16} />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

// Inline alert icons helper
function AlertCircle({ size, style }) {
  return (
    <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}

const styles = {
  authContainer: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0b0f19',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundAttachment: 'fixed',
    backgroundImage: 
      'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),' +
      'radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%)',
  },
  authCard: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    width: '100%',
    maxWidth: '920px',
    padding: 0,
    overflow: 'hidden',
    minHeight: '560px',
  },
  visualCol: {
    backgroundColor: 'rgba(15, 20, 34, 0.4)',
    borderRight: '1px solid rgba(255,255,255,0.03)',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandName: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
  },
  infoTextContainer: {
    margin: '3rem 0',
  },
  infoHeading: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '1.25',
    color: '#f3f4f6',
    fontFamily: "'Outfit', sans-serif",
  },
  infoDesc: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    marginTop: '1rem',
    lineHeight: '1.5',
  },
  visualFooter: {
    marginTop: 'auto',
  },
  shieldBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  formCol: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  tabHeader: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '1.5rem',
  },
  tabBtn: {
    flexGrow: 1,
    padding: '8px 0',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    backgroundColor: '#8b5cf6',
    color: '#fff',
    boxShadow: '0 0 10px rgba(139,92,246,0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flexGrow: 1,
    justifyContent: 'center',
  },
  formInfo: {
    marginBottom: '8px',
  },
  formTitle: {
    fontSize: '1.25rem',
    color: '#f3f4f6',
    fontWeight: '600',
    fontFamily: "'Outfit', sans-serif",
  },
  formSubtitle: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '2px',
    lineHeight: '1.4',
  },
  inputField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '0 12px',
    height: '42px',
    transition: 'border-color 0.15s ease',
  },
  inputIcon: {
    color: '#6b7280',
    marginRight: '10px',
  },
  input: {
    flexGrow: 1,
    height: '100%',
    fontSize: '0.85rem',
    color: '#f3f4f6',
    outline: 'none',
  },
  eyeBtn: {
    color: '#6b7280',
    marginLeft: '6px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#8b5cf6',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '12px',
    boxShadow: '0 0 15px rgba(139,92,246,0.3)',
    transition: 'all 0.2s ease',
  },
  errorBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    color: '#f43f5e',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
};
