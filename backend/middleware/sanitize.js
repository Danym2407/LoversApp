/**
 * Input sanitization middleware.
 * Recursively strips dangerous characters from string values in req.body
 * without altering data shape or requiring external dependencies.
 *
 * Protects against:
 *  - Null-byte injection
 *  - Control characters that break logs / parsers
 *  - Overly long strings that could cause OOM issues
 */

const MAX_STRING_LENGTH = 10_000; // 10 KB per field

/**
 * Recursively walk an object/array and clean every string value.
 * Non-string values are left untouched.
 */
function sanitizeValue(val, depth = 0) {
  // Avoid infinite recursion on circular structures
  if (depth > 6) return val;

  if (typeof val === 'string') {
    return val
      .replace(/\0/g, '')           // strip null bytes
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip other control chars (keep \t \n \r)
      .slice(0, MAX_STRING_LENGTH);  // hard cap per field
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeValue(item, depth + 1));
  }

  if (val !== null && typeof val === 'object') {
    const cleaned = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = sanitizeValue(val[key], depth + 1);
    }
    return cleaned;
  }

  return val;
}

/**
 * Express middleware — cleans req.body in place.
 * Safe to apply globally; skips requests with no body.
 */
function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

module.exports = sanitizeBody;
