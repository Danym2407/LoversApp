const CALENDAR_KEY = 'calendarEvents';
const TIMELINE_KEY = 'timelineEvents';
const COUNTDOWN_KEY = 'countdownEvents';

const readArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

const sanitizeTimelineEvents = (events) => {
  return (events || []).map((event) => {
    const safeImage = event?.image && String(event.image).startsWith('data:image') ? '📌' : event?.image;
    return { ...event, image: safeImage };
  });
};

const writeArray = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (key !== TIMELINE_KEY) throw error;

    try {
      const sanitized = sanitizeTimelineEvents(value);
      localStorage.setItem(key, JSON.stringify(sanitized));
    } catch (secondError) {
      const sanitized = sanitizeTimelineEvents(value);
      const pruned = sanitized.slice(-100);
      localStorage.setItem(key, JSON.stringify(pruned));
    }
  }
};

const parseDateParts = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  return { year, monthIndex: month - 1, day };
};

const buildCalendarEvent = ({ title, description, dateStr, photo, sourceType, sourceId }) => {
  const parts = parseDateParts(dateStr);
  const fallbackDate = new Date();
  const dateKey = parts
    ? `${parts.year}-${parts.monthIndex}-${parts.day}`
    : `${fallbackDate.getFullYear()}-${fallbackDate.getMonth()}-${fallbackDate.getDate()}`;
  const day = parts ? parts.day : fallbackDate.getDate();

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    dateKey,
    date: day,
    title,
    description,
    photo: photo || null,
    createdAt: new Date().toISOString(),
    sourceType,
    sourceId,
    originalDate: dateStr || null
  };
};

const buildTimelineEvent = ({ title, description, dateStr, image, sourceType, sourceId }) => {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    date: dateStr || new Date().toISOString().slice(0, 10),
    title,
    description,
    image: image || '📌',
    createdAt: new Date().toISOString(),
    sourceType,
    sourceId
  };
};

const upsertBySource = (items, sourceType, sourceId, newItem) => {
  if (!sourceType || !sourceId) {
    items.push(newItem);
    return items;
  }

  const index = items.findIndex(
    (item) => item.sourceType === sourceType && item.sourceId === sourceId
  );

  if (index >= 0) {
    const previous = items[index];
    const mergedPhotos = Array.isArray(newItem.photos) && newItem.photos.length > 0
      ? newItem.photos
      : Array.isArray(previous.photos)
      ? previous.photos
      : [];
    items[index] = { ...previous, ...newItem, photos: mergedPhotos };
  } else {
    items.push(newItem);
  }

  return items;
};

export const upsertCalendarEvent = ({ title, description, dateStr, photo, sourceType, sourceId }) => {
  const events = readArray(CALENDAR_KEY);
  const newEvent = buildCalendarEvent({ title, description, dateStr, photo, sourceType, sourceId });
  const updated = upsertBySource(events, sourceType, sourceId, newEvent);
  writeArray(CALENDAR_KEY, updated);
  return updated;
};

export const removeCalendarEventBySource = (sourceType, sourceId) => {
  const events = readArray(CALENDAR_KEY);
  const updated = events.filter(
    (event) => !(event.sourceType === sourceType && event.sourceId === sourceId)
  );
  writeArray(CALENDAR_KEY, updated);
  return updated;
};

export const upsertTimelineEvent = ({ title, description, dateStr, image, sourceType, sourceId }) => {
  const events = readArray(TIMELINE_KEY);
  const newEvent = buildTimelineEvent({ title, description, dateStr, image, sourceType, sourceId });
  const updated = upsertBySource(events, sourceType, sourceId, newEvent);
  const sanitized = sanitizeTimelineEvents(updated);
  writeArray(TIMELINE_KEY, sanitized);
  return updated;
};

export const removeTimelineEventBySource = (sourceType, sourceId) => {
  const events = readArray(TIMELINE_KEY);
  const updated = events.filter(
    (event) => !(event.sourceType === sourceType && event.sourceId === sourceId)
  );
  writeArray(TIMELINE_KEY, updated);
  return updated;
};

export const getTimelineEvents = () => readArray(TIMELINE_KEY);

const buildCountdownEvent = ({ title, dateStr, emoji, sourceType, sourceId }) => {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title,
    date: dateStr,
    emoji: emoji || '💖',
    createdAt: new Date().toISOString(),
    sourceType,
    sourceId
  };
};

export const upsertCountdownEvent = ({ title, dateStr, emoji, sourceType, sourceId }) => {
  const events = readArray(COUNTDOWN_KEY);
  const newEvent = buildCountdownEvent({ title, dateStr, emoji, sourceType, sourceId });
  const updated = upsertBySource(events, sourceType, sourceId, newEvent);
  writeArray(COUNTDOWN_KEY, updated);
  return updated;
};

export const removeCountdownEventBySource = (sourceType, sourceId) => {
  const events = readArray(COUNTDOWN_KEY);
  const updated = events.filter(
    (event) => !(event.sourceType === sourceType && event.sourceId === sourceId)
  );
  writeArray(COUNTDOWN_KEY, updated);
  return updated;
};

export const getCountdownEvents = () => readArray(COUNTDOWN_KEY);