import { request } from './api';

export const authService = {
  async login(email, password) {
    const data = await request('login.php', {
      method: 'POST',
      body: { email, password }
    });
    if (data.user) {
      localStorage.setItem('eduinsight_user', JSON.stringify(data.user));
    }
    return data.user;
  },

  async register(name, email, password, role = 'Student') {
    return request('register.php', {
      method: 'POST',
      body: { name, email, password, role }
    });
  },

  async updateProfile(userId, name) {
    return request('register.php', {
      method: 'PUT',
      body: { user_id: userId, name }
    });
  },

  logout() {
    localStorage.removeItem('eduinsight_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('eduinsight_user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
