import { User, Announcement, Community } from '../types';

// The API is now served by the same origin (Node server) or proxied in dev
const API_BASE_URL = '/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Service Request Failed:', error);
      throw error;
    }
  }

  async login(communityId: string, username: string): Promise<{ user: User; community: Community }> {
    return this.request<{ user: User; community: Community }>('/login', {
      method: 'POST',
      body: JSON.stringify({ communityId, username }),
    });
  }

  async getUsers(communityId: string): Promise<User[]> {
    return this.request<User[]>(`/users?communityId=${encodeURIComponent(communityId)}`);
  }

  async getAnnouncements(communityId: string): Promise<Announcement[]> {
    return this.request<Announcement[]>(`/announcements?communityId=${encodeURIComponent(communityId)}`);
  }

  async createAnnouncement(announcement: Announcement): Promise<void> {
    await this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  }

  async updateUserProfile(user: User): Promise<User> {
    return this.request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }
}

export const mockService = new ApiService();