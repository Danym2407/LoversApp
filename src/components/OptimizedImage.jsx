/**
 * OptimizedImage Component
 * 
 * Handles:
 * - Lazy loading
 * - Explicit width/height (prevents CLS)
 * - Responsive images
 * - Error handling
 */

export default function OptimizedImage({
  src,
  alt = '',
  width = 192,
  height = 192,
  loading = 'lazy',
  className = '',
  style = {},
  onError,
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        ...style,
      }}
      onError={onError}
      decoding="async"
    />
  );
}
