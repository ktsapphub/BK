import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bk_admin_token");
  if (token && config.url && config.url.includes("/admin")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------
export const publicApi = {
  getPage: (slug) => api.get(`/public/page/${slug}`).then((r) => r.data),
  getCareerEntries: () => api.get(`/public/career-entries`).then((r) => r.data),
  getTestimonials: () => api.get(`/public/testimonials`).then((r) => r.data),
  getProjects: () => api.get(`/public/projects`).then((r) => r.data),
  getProject: (slug) => api.get(`/public/projects/${slug}`).then((r) => r.data),
  getServices: () => api.get(`/public/services`).then((r) => r.data),
  getThoughts: () => api.get(`/public/thoughts`).then((r) => r.data),
  getThought: (slug) => api.get(`/public/thoughts/${slug}`).then((r) => r.data),
  getImpactItems: () => api.get(`/public/impact-items`).then((r) => r.data),
  getNavigation: () => api.get(`/public/navigation`).then((r) => r.data),
  getGlobalSettings: () => api.get(`/public/global-settings`).then((r) => r.data),
  submitInquiry: (payload) => api.post(`/public/inquiries`, payload).then((r) => r.data),
  subscribeNewsletter: (email) => api.post(`/public/newsletter`, { email }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export const adminApi = {
  login: (email, password) => api.post(`/admin/login`, { email, password }).then((r) => r.data),
  me: () => api.get(`/admin/me`).then((r) => r.data),

  uploadMedia: (file, onProgress) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post(`/admin/media/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress) onProgress(Math.round((evt.loaded * 100) / (evt.total || 1)));
        },
      })
      .then((r) => r.data);
  },
  listMedia: () => api.get(`/admin/media`).then((r) => r.data),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`).then((r) => r.data),

  listPages: () => api.get(`/admin/pages`).then((r) => r.data),
  createPage: (payload) => api.post(`/admin/pages`, payload).then((r) => r.data),

  listSections: (pageId) => api.get(`/admin/sections`, { params: pageId ? { page_id: pageId } : {} }).then((r) => r.data),
  getSection: (id) => api.get(`/admin/sections/${id}`).then((r) => r.data),
  createSection: (payload) => api.post(`/admin/sections`, payload).then((r) => r.data),
  updateSection: (id, payload) => api.put(`/admin/sections/${id}`, payload).then((r) => r.data),
  deleteSection: (id) => api.delete(`/admin/sections/${id}`).then((r) => r.data),
  getSectionVersions: (id) => api.get(`/admin/sections/${id}/versions`).then((r) => r.data),
  rollbackSection: (id, versionId) => api.post(`/admin/sections/${id}/rollback/${versionId}`).then((r) => r.data),

  reorder: (collection, items) => api.post(`/admin/reorder/${collection}`, { items }).then((r) => r.data),

  listCareerEntries: () => api.get(`/admin/career-entries`).then((r) => r.data),
  createCareerEntry: (payload) => api.post(`/admin/career-entries`, payload).then((r) => r.data),
  updateCareerEntry: (id, payload) => api.put(`/admin/career-entries/${id}`, payload).then((r) => r.data),
  deleteCareerEntry: (id) => api.delete(`/admin/career-entries/${id}`).then((r) => r.data),

  listTestimonials: () => api.get(`/admin/testimonials`).then((r) => r.data),
  createTestimonial: (payload) => api.post(`/admin/testimonials`, payload).then((r) => r.data),
  updateTestimonial: (id, payload) => api.put(`/admin/testimonials/${id}`, payload).then((r) => r.data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`).then((r) => r.data),

  listProjects: () => api.get(`/admin/projects`).then((r) => r.data),
  createProject: (payload) => api.post(`/admin/projects`, payload).then((r) => r.data),
  updateProject: (id, payload) => api.put(`/admin/projects/${id}`, payload).then((r) => r.data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`).then((r) => r.data),

  listServices: () => api.get(`/admin/services`).then((r) => r.data),
  createService: (payload) => api.post(`/admin/services`, payload).then((r) => r.data),
  updateService: (id, payload) => api.put(`/admin/services/${id}`, payload).then((r) => r.data),
  deleteService: (id) => api.delete(`/admin/services/${id}`).then((r) => r.data),

  listThoughts: () => api.get(`/admin/thoughts`).then((r) => r.data),
  createThought: (payload) => api.post(`/admin/thoughts`, payload).then((r) => r.data),
  updateThought: (id, payload) => api.put(`/admin/thoughts/${id}`, payload).then((r) => r.data),
  deleteThought: (id) => api.delete(`/admin/thoughts/${id}`).then((r) => r.data),

  listImpactItems: () => api.get(`/admin/impact-items`).then((r) => r.data),
  createImpactItem: (payload) => api.post(`/admin/impact-items`, payload).then((r) => r.data),
  updateImpactItem: (id, payload) => api.put(`/admin/impact-items/${id}`, payload).then((r) => r.data),
  deleteImpactItem: (id) => api.delete(`/admin/impact-items/${id}`).then((r) => r.data),

  listNavItems: () => api.get(`/admin/navigation-items`).then((r) => r.data),
  createNavItem: (payload) => api.post(`/admin/navigation-items`, payload).then((r) => r.data),
  deleteNavItem: (id) => api.delete(`/admin/navigation-items/${id}`).then((r) => r.data),

  getGlobalSettings: () => api.get(`/admin/global-settings`).then((r) => r.data),
  updateGlobalSettings: (payload) => api.put(`/admin/global-settings`, payload).then((r) => r.data),

  listInquiries: () => api.get(`/admin/inquiries`).then((r) => r.data),
  updateInquiry: (id, status) => api.put(`/admin/inquiries/${id}`, { status }).then((r) => r.data),
  deleteInquiry: (id) => api.delete(`/admin/inquiries/${id}`).then((r) => r.data),

  listNewsletterSubscribers: () => api.get(`/admin/newsletter-subscribers`).then((r) => r.data),
};
