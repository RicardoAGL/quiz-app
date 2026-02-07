import React from 'react';
import './QuestionRenderer.css';

/**
 * Allowed media types for question content.
 * Only these types are rendered; unknown types are ignored.
 */
const ALLOWED_MEDIA_TYPES = ['image', 'code'];

/**
 * Validate and sanitize an image source path using an allowlist approach.
 * Only allows relative paths and data:image/* URIs.
 * Rejects everything else by default (safe default-deny).
 * @param {string} src
 * @returns {string|null} Sanitized src or null if invalid
 */
function sanitizeImageSrc(src) {
  if (typeof src !== 'string' || src.length === 0) return null;

  // Strip control characters (codepoints < 0x20) to prevent obfuscation bypasses
  // eslint-disable-next-line no-control-regex
  const cleaned = src.replace(/[\x00-\x1f]/g, '');
  if (cleaned.length === 0) return null;

  const lower = cleaned.toLowerCase().trim();

  // Allowlist: data:image/* URIs
  if (lower.startsWith('data:image/')) return cleaned;

  // Allowlist: relative paths (no protocol/scheme)
  // Block anything with a colon before the first slash (indicates a protocol)
  const colonIndex = lower.indexOf(':');
  const slashIndex = lower.indexOf('/');
  if (colonIndex !== -1 && (slashIndex === -1 || colonIndex < slashIndex)) {
    return null;
  }

  // Block protocol-relative URLs
  if (lower.startsWith('//')) return null;

  return cleaned;
}

/**
 * QuestionRenderer — renders a question with optional media content.
 *
 * If the question has no `media` field, renders plain text (identical to current behavior).
 * If `media` is present, renders the appropriate content type below the question text.
 *
 * Supported media types:
 * - `image`: renders an <img> with lazy loading, max-width, and alt text
 * - `code`: renders a <pre><code> block with dark background and horizontal scroll
 *
 * @param {{ question: Object }} props
 */
export default function QuestionRenderer({ question }) {
  if (!question) return null;

  const media = question.media;
  const hasMedia = media && ALLOWED_MEDIA_TYPES.includes(media.type);

  return (
    <div className="question-renderer">
      <p className="question-text">{question.question}</p>

      {hasMedia && media.type === 'image' && (() => {
        const safeSrc = sanitizeImageSrc(media.src);
        if (!safeSrc) return null;
        return (
          <div className="question-media question-media--image">
            <img
              src={safeSrc}
              alt={typeof media.alt === 'string' ? media.alt.slice(0, 500) : ''}
              loading="lazy"
              className="question-media-img"
            />
          </div>
        );
      })()}

      {hasMedia && media.type === 'code' && (
        <div className="question-media question-media--code">
          <pre className="question-code-block">
            <code>{typeof media.content === 'string' ? media.content : ''}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
