const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  cors_origins: string[];
}

export const api = {
  async getHealth(): Promise<HealthCheckResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.warn('Backend currently offline or unreachable at:', API_BASE_URL, error);
      return {
        status: 'disconnected',
        service: 'MentorMatch AI Backend (Offline)',
        version: '1.0.0',
        cors_origins: [],
      };
    }
  },

  async uploadAudio(audioBlob: Blob, filename = 'recording.webm'): Promise<{
    success: boolean;
    transcript: string;
    file_name: string;
    file_size_bytes: number;
    audio_format: string;
    processing_time_ms: number;
    user_id: string;
    user_role: string;
  }> {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);

    const token = localStorage.getItem('mm_auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/process-audio`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Audio processing failed' }));
      throw new Error(errorData.detail || `Audio upload failed with status ${res.status}`);
    }
    return await res.json();
  },

  async generateRoadmap(goal: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE_URL}/api/roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });
    if (!res.ok) throw new Error('Roadmap generation failed');
    return await res.json();
  },

  async getAdminMetrics(): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE_URL}/api/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics metrics');
    return await res.json();
  }
};
