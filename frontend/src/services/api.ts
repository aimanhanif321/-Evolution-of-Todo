// Centralized API client for Taskora application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle unauthorized access specifically
        if (response.status === 401 || response.status === 403) {
          // If unauthorized, redirect to login or clear token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            // Optionally redirect to login page
            // window.location.href = '/auth/login';
          }
        }

        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: responseData.detail || response.statusText,
          },
        };
      }

      return {
        success: true,
        data: responseData.data,
        message: responseData.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      };
    }
  }

  // Authentication endpoints
  async register(userData: { email: string; name: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Task endpoints
  async getUserTasks(userId: string, completed?: boolean) {
    const params = completed !== undefined ? `?completed=${completed}` : '';
    return this.request(`/${userId}/tasks${params}`);
  }

  async createTask(userId: string, taskData: { title: string; description?: string }) {
    return this.request(`/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTask(userId: string, taskId: number) {
    return this.request(`/${userId}/tasks/${taskId}`);
  }

  async updateTask(userId: string, taskId: number, taskData: Partial<{ title: string; description?: string; completed: boolean }>) {
    return this.request(`/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(userId: string, taskId: number) {
    return this.request(`/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(userId: string, taskId: number, completed: boolean) {
    return this.request(`/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;