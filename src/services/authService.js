import { request } from './api';

const getSeedUsers = () => {
  const savedUsers = JSON.parse(localStorage.getItem('lap_users_db') || '[]');
  if (savedUsers.length > 0) return savedUsers;

  const demoUsers = [
    {
      user_id: 1,
      name: 'Krish Patel',
      email: 'krish.patel@college.edu',
      password: 'password',
      role: 'Student',
      enrolledCourses: ['py-101']
    },
    {
      user_id: 2,
      name: 'Dr. Alok Verma',
      email: 'alok.verma@college.edu',
      password: 'password',
      role: 'Teacher',
      enrolledCourses: []
    }
  ];

  localStorage.setItem('lap_users_db', JSON.stringify(demoUsers));
  return demoUsers;
};

const toSessionUser = (user) => {
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    user_id: safeUser.user_id ?? safeUser.id ?? Date.now(),
    token: safeUser.token ?? btoa(JSON.stringify({ email: safeUser.email, user_id: safeUser.user_id ?? safeUser.id ?? Date.now() }))
  };
};

const getLocalUser = (email, password) => {
  const normalisedEmail = String(email || '').trim().toLowerCase();
  const users = getSeedUsers();
  const match = users.find((user) => String(user.email || '').trim().toLowerCase() === normalisedEmail);
  if (!match) return null;
  if (String(match.password || '') !== String(password || '')) return null;
  return match;
};

export const authService = {
  async login(email, password) {
    try {
      const data = await request('login', {
        method: 'POST',
        body: { email, password }
      });
      if (data.user) {
        const sessionUser = toSessionUser(data.user);
        localStorage.setItem('lap_current_user', JSON.stringify(sessionUser));
        return sessionUser;
      }
    } catch (error) {
      const localUser = getLocalUser(email, password);
      if (localUser) {
        const sessionUser = toSessionUser(localUser);
        localStorage.setItem('lap_current_user', JSON.stringify(sessionUser));
        return sessionUser;
      }
      throw new Error(error?.message || 'Invalid email or password.');
    }

    const localUser = getLocalUser(email, password);
    if (localUser) {
      const sessionUser = toSessionUser(localUser);
      localStorage.setItem('lap_current_user', JSON.stringify(sessionUser));
      return sessionUser;
    }

    throw new Error('Invalid email or password.');
  },

  async register(name, email, password, role = 'Student') {
    const trimmedEmail = String(email || '').trim();
    const existingUsers = getSeedUsers();
    const duplicate = existingUsers.find((user) => String(user.email || '').trim().toLowerCase() === trimmedEmail.toLowerCase());
    if (duplicate) {
      throw new Error('An account with this email already exists.');
    }

    try {
      const response = await request('register', {
        method: 'POST',
        body: { name, email: trimmedEmail, password, role }
      });
      if (response.user) {
        const sessionUser = toSessionUser(response.user);
        localStorage.setItem('lap_current_user', JSON.stringify(sessionUser));
        return sessionUser;
      }
      return response;
    } catch (error) {
      const newUser = {
        user_id: Date.now(),
        name,
        email: trimmedEmail,
        password,
        role,
        enrolledCourses: role === 'Student' ? ['py-101'] : []
      };

      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('lap_users_db', JSON.stringify(updatedUsers));
      const sessionUser = toSessionUser(newUser);
      localStorage.setItem('lap_current_user', JSON.stringify(sessionUser));
      return sessionUser;
    }
  },

  async updateProfile(userId, name) {
    try {
      return await request('register', {
        method: 'PUT',
        body: { user_id: userId, name }
      });
    } catch (_error) {
      const users = getSeedUsers();
      const updatedUsers = users.map((user) => (
        Number(user.user_id) === Number(userId)
          ? { ...user, name }
          : user
      ));
      localStorage.setItem('lap_users_db', JSON.stringify(updatedUsers));

      const current = this.getCurrentUser();
      if (current) {
        const saved = { ...current, name };
        localStorage.setItem('lap_current_user', JSON.stringify(saved));
      }

      return { ok: true };
    }
  },

  logout() {
    localStorage.removeItem('lap_current_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('lap_current_user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
