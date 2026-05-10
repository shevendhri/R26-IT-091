/**
 * Utility function to combine className strings
 * Filters out falsy values and joins class names with spaces
 * @param {...any} classes - Class names or arrays of class names
 * @returns {string} - Combined class names
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
}
