/**
 * Generate a URL-safe slug from text.
 * Removes accents, special chars, and truncates to maxLength.
 */
export function slugify(text: string, maxLength = 80): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength)
    .replace(/-+$/, ''); // clean trailing dash after truncation
}

/**
 * Generate an SEO-friendly product URL.
 * Prefers the stored slug field. Falls back to slugifying the title.
 * Format: /productos/stored-slug--PRODUCT_ID
 */
export function generateProductUrl(titleOrSlug: string, id: string, useAsSlug = false): string {
  const slug = useAsSlug ? titleOrSlug : slugify(titleOrSlug);
  return `/productos/${slug}--${id}`;
}

/**
 * Extract product ID from an SEO slug parameter.
 * Supports both new format (slug--id) and legacy format (just id).
 */
export function extractProductId(slugParam: string): string {
  const separatorIndex = slugParam.lastIndexOf('--');
  if (separatorIndex !== -1) {
    return slugParam.substring(separatorIndex + 2);
  }
  // Legacy format: the entire param is the ID
  return slugParam;
}
