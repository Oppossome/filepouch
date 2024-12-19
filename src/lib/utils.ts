import { encodeBase64url } from "@oslojs/encoding"
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

// MARK: randomStr

/**
 * Generates a random string of the specified length.
 *
 * This function uses the `crypto.getRandomValues` method to generate a
 * cryptographically secure random sequence of bytes, which is then
 * encoded using Base64 URL encoding.
 *
 * @param {number} length - The length of the random string to generate.
 * @returns {string} A Base64 URL encoded random string of the specified length.
 */
export function randomStr(length: number) {
	const bytes = crypto.getRandomValues(new Uint8Array(length))
	return encodeBase64url(bytes)
}
