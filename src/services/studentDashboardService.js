import { request } from './api';

export const studentDashboardService = {
  async getDashboardStats() {
    return request('dashboard', {
      method: 'GET'
    });
  },

  async getProfile() {
    return request('profile', {
      method: 'GET'
    });
  },

  async updateProfile(profileData) {
    return request('profile', {
      method: 'PUT',
      body: profileData
    });
  }
};

export default studentDashboardService;
