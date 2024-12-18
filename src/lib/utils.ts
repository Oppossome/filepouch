import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// MARK: cn

/**
 * Utility function to merge and conditionally apply class names.
 *
 * This function combines the functionality of `clsx` and `twMerge` to handle
 * conditional class names and merge Tailwind CSS classes efficiently.
 *
 * @param {...ClassValue[]} inputs - A list of class values that can be strings, arrays, or objects.
 * @returns {string} - A single string of merged class names.
 *
 * @example
 * // Basic usage with conditional classes
 * const className = cn('btn', isActive && 'btn-active', 'btn-primary');
 * console.log(className); // Output: 'btn btn-active btn-primary' (if isActive is true)
 *
 * @example
 * // Usage with arrays and objects
 * const className = cn(['btn', 'btn-primary'], { 'btn-active': isActive });
 * console.log(className); // Output: 'btn btn-primary btn-active' (if isActive is true)
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
