import api from './api'

export const npService = {
  signup: (org: string, email: string, password: string) =>
    api.post('/np/auth/signup', { organization_name: org, email, password }),

  login: (email: string, password: string) =>
    api.post('/np/auth/login', { email, password }),

  me: () => api.get('/np/auth/me'),

  submitOrgDetails: (data: {
    ein: string
    legal_name: string
    registered_address: string
    official_contact_email: string
    website?: string
    np_type: string
  }) => api.post('/np/org-details', data),

  getVerificationStatus: () => api.get('/np/verification-status'),

  getLaunchpad: () => api.get('/np/launchpad'),

  getApprovals: (status?: string) =>
    api.get('/np/approvals', { params: status ? { status } : {} }),

  approveEvent: (approvalId: string) =>
    api.post(`/np/approvals/${approvalId}/approve`),

  rejectEvent: (approvalId: string, reason: string) =>
    api.post(`/np/approvals/${approvalId}/reject`, { reason }),

  setupStripeConnect: () => api.post('/np/stripe-connect'),

  getStripeStatus: () => api.get('/np/stripe-connect/status'),
}
