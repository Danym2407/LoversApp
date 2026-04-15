import { initialDates } from '@/data/dates';

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem('loversappToken');
}

export function isAuthenticated() {
  return !!(localStorage.getItem('loversappToken') && localStorage.getItem('loversappUser'));
}

// ── Core request ──────────────────────────────────────────────────────────────
async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || res.statusText);
  }

  return res.json();
}

// ── Couple-dates mapper ───────────────────────────────────────────────────────
// Merges an API couple_dates row with the static date name from initialDates.
// The API row uses date_item_id (1-100) as the logical identifier.
export function mapCoupleDate(row) {
  const initial = initialDates.find(d => d.id === row.date_item_id) || {};
  return {
    id: row.date_item_id,           // keep original 1-100 id for compatibility
    _rowId: row.id,                 // real DB primary key for PATCH calls
    name: initial.name || `Cita ${row.date_item_id}`,
    status: row.status || 'pending',
    priority: row.date_item_id,
    date: row.scheduled_date || '',
    location: row.location || '',
    liked: !!row.liked,
    danielaRating:   { hearts: row.p1_hearts || 0, stars: row.p1_stars || 0 },
    eduardoRating:   { hearts: row.p2_hearts || 0, stars: row.p2_stars || 0 },
    danielaReview:   row.p1_review   || '',
    eduardoReview:   row.p2_review   || '',
    danielaOneWord:  row.p1_one_word || '',
    eduardoOneWord:  row.p2_one_word || '',
    danielaBestPart: row.p1_best_part || '',
    eduardoBestPart: row.p2_best_part || '',
    // preserve any static metadata from initialDates
    categories: initial.categories || [],
    category:   initial.category   || '',
    budget:     initial.budget     || '',
    time:       initial.time       || '',
  };
}

// ── API methods ───────────────────────────────────────────────────────────────
export const api = {

  // Auth
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  register: (name, partner_name, email, password) =>
    request('POST', '/auth/register', { name, partner_name, email, password }),

  // User profile
  getMe:               ()     => request('GET',    '/users/me'),
  updateMe:            (data) => request('PATCH',  '/users/me', data),
  getPartnerGreeting:  ()     => request('GET',    '/users/partner-greeting'),
  coupleWith:  (partner_code) => request('POST',   '/users/couple', { partner_code }),
  uncouple:            ()     => request('DELETE', '/users/couple'),

  // Couple dates (bucket list)
  getCoupleDates:      ()          => request('GET',   '/couple-dates'),
  updateCoupleDate:    (itemId, d) => request('PATCH', `/couple-dates/${itemId}`, d),
  getCoupleDatesStats: ()          => request('GET',   '/couple-dates/stats/summary'),

  // Cita swipes (aleatorias)
  getCitaSwipes:    ()              => request('GET',    '/cita-swipes'),
  swipeCita:        (cita_id, action) => request('POST', '/cita-swipes', { cita_id, action }),
  resetSwipes:      ()              => request('DELETE', '/cita-swipes'),
  getSwipeStats:    ()              => request('GET',    '/cita-swipes/stats'),
  getSwipeMatches:  ()             => request('GET',    '/cita-swipes/matches'),
  getPartnerSwipes: ()             => request('GET',    '/cita-swipes/partner'),

  // Cita preferences (personalizadas)
  getPreferences: () =>
    request('GET', '/cita-swipes/preferences'),
  setPreference:  (cita_id, preference) =>
    request('POST', '/cita-swipes/preferences', { cita_id, preference }),

  // Letters
  getLetters:        ()          => request('GET',    '/letters'),
  getReceivedLetters: ()         => request('GET',    '/letters/received'),
  markLetterRead:    (id)        => request('PATCH',  `/letters/${id}/read`),
  createLetter:      (data)      => request('POST',   '/letters', data),
  updateLetter:      (id, data)  => request('PATCH',  `/letters/${id}`, data),
  deleteLetter:      (id)        => request('DELETE', `/letters/${id}`),

  // Moments
  getMoments:    ()          => request('GET',    '/moments'),
  createMoment:  (data)      => request('POST',   '/moments', data),
  updateMoment:  (id, data)  => request('PATCH',  `/moments/${id}`, data),
  deleteMoment:  (id)        => request('DELETE', `/moments/${id}`),

  // Challenges
  getChallenges:    ()           => request('GET',  '/challenges'),
  toggleChallenge:  (challengeId, type) =>
    request('POST', `/challenges/${challengeId}/toggle`, { type }),
  getChallengeStats: () => request('GET', '/challenges/stats'),

  // Calendar
  getCalendar:          ()          => request('GET',    '/calendar'),
  createCalendarEvent:  (data)      => request('POST',   '/calendar', data),
  updateCalendarEvent:  (id, data)  => request('PATCH',  `/calendar/${id}`, data),
  deleteCalendarEvent:  (id)        => request('DELETE', `/calendar/${id}`),

  // Timeline
  getTimeline:         ()          => request('GET',    '/timeline'),
  createTimelineEvent: (data)      => request('POST',   '/timeline', data),
  deleteTimelineEvent: (id)        => request('DELETE', `/timeline/${id}`),

  // Important dates
  getImportantDates:    ()          => request('GET',    '/important-dates'),
  createImportantDate:  (data)      => request('POST',   '/important-dates', data),
  updateImportantDate:  (id, data)  => request('PATCH',  `/important-dates/${id}`, data),
  deleteImportantDate:  (id)        => request('DELETE', `/important-dates/${id}`),

  // Countdowns
  getCountdowns:    ()          => request('GET',    '/countdowns'),
  createCountdown:  (data)      => request('POST',   '/countdowns', data),
  updateCountdown:  (id, data)  => request('PATCH',  `/countdowns/${id}`, data),
  deleteCountdown:  (id)        => request('DELETE', `/countdowns/${id}`),

  // Password reset
  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    request('POST', '/auth/reset-password', { token, password }),
};
