
// financial-ai-platform/lib/api.ts

export const API_BASE_URL = 'http://localhost:8001';

export interface AnalysisData {
  id: string;
  fileName: string;
  score: number;
  date: string;
  factors: Array<{ name: string; score: number }>;
  status?: 'completed' | 'processing' | 'failed';
  aiExplanation?: string;
  provenanceHash?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  plan: string;
  joined: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auditx_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auditx_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auditx_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    // Remove Content-Type for FormData (browser sets it automatically with boundary)
    if (options.body instanceof FormData) {
      delete (headers as any)['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const data = await this.request('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    this.setToken(data.access_token);
    return data;
  }

  async register(username: string, email: string, password: string) {
    const data = await this.request('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    this.setToken(data.access_token);
    return data;
  }

  async getProfile() {
    const data = await this.request('/api/me');
    return {
      name: data.username, // Map backend username to frontend name
      email: data.email || '',
      plan: data.plan || 'Free',
      joined: data.joined || 'Recently',
    };
  }

  private calculateDQSFactors(data: any): Array<{ name: string; score: number }> {
    const metadata = data.metadata_summary;
    const rules = data.rule_results;

    // Helper to find rule result
    const getRuleResult = (ruleId: string) =>
      rules.find((r: any) => r.rule_id === ruleId);

    // 1. Completeness - based on null percentages
    let completeness = 100;
    if (metadata.column_stats) {
      Object.values(metadata.column_stats).forEach((stat: any) => {
        if (stat.null_percentage && stat.null_percentage > 10) {
          completeness -= 15;
        }
      });
    }
    completeness = Math.max(0, completeness);

    // 2. Validity - RULE_002 (Future Dates)
    const validityRule = getRuleResult('RULE_002');
    const validity = validityRule && !validityRule.passed ? 75 : 100;

    // 3. Accuracy - RULE_001 (Benford's Law)
    const accuracyRule = getRuleResult('RULE_001');
    const accuracy = accuracyRule && !accuracyRule.passed ? 60 : 100;

    // 4. Consistency - Check for data consistency (simplified for now)
    const consistency = 100; // Could be enhanced with type consistency checks

    // 5. Timeliness - Date ranges and RULE_002
    const timelinessRule = getRuleResult('RULE_002');
    const timeliness = timelinessRule && !timelinessRule.passed ? 70 : 100;

    // 6. Integrity - RULE_003 (Negative Amounts) + RULE_001
    const integrityRule1 = getRuleResult('RULE_001');
    const integrityRule2 = getRuleResult('RULE_003');
    let integrity = 100;
    if (integrityRule1 && !integrityRule1.passed) integrity -= 25;
    if (integrityRule2 && !integrityRule2.passed) integrity -= 25;
    integrity = Math.max(0, integrity);

    // 7. Security - RULE_006 (PII) + RULE_004 (Suspicious Entities)
    const securityRule1 = getRuleResult('RULE_006');
    const securityRule2 = getRuleResult('RULE_004');
    let security = 100;
    if (securityRule1 && !securityRule1.passed) security -= 40;
    if (securityRule2 && !securityRule2.passed) security -= 40;
    security = Math.max(0, security);

    return [
      { name: 'Completeness', score: completeness },
      { name: 'Validity', score: validity },
      { name: 'Accuracy', score: accuracy },
      { name: 'Consistency', score: consistency },
      { name: 'Timeliness', score: timeliness },
      { name: 'Integrity', score: integrity },
      { name: 'Security', score: security },
    ];
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const data = await this.request('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    // Map backend response to frontend AnalysisData format
    return {
      id: data.audit_id,
      fileName: String(file.name),
      score: data.compliance_score.final_score,
      date: new Date(data.timestamp).toISOString().split('T')[0],
      aiExplanation: data.ai_explanation,
      provenanceHash: data.provenance_hash,
      factors: this.calculateDQSFactors(data),
    } as AnalysisData;
  }

  async getHistory() {
    try {
      const response = await this.request('/api/history');
      // Map backend history to frontend format
      return response.map((item: any) => ({
        id: item.audit_id,
        fileName: item.fileName || 'Unknown File', // Use correct case from backend
        score: item.final_score || 0,
        date: new Date(item.timestamp).toISOString().split('T')[0],
        status: 'completed',
        factors: [], // History summary doesn't need detailed factors immediately
      }));
    } catch (e) {
      console.error("Failed to fetch history", e);
      return [];
    }
  }

  async downloadReport(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/report/${id}`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });

    if (!response.ok) throw new Error("Report download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuditX_Report_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const api = new ApiClient();
