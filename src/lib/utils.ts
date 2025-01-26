import { getContext, hasContext, setContext } from "svelte"
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// MARK: ContextPair

export interface ContextPair<Value> {
	get: ((unsafe?: false) => Value) & ((unsafe: true) => Value | undefined)
	set(value: Value, force?: boolean): Value
}

export function defineContextPair<Value>(key: string): ContextPair<Value> {
	return {
		get(unsafe?: boolean) {
			if (!unsafe && !hasContext(key)) throw new Error(`Context of key ${key} doesn't exist`)
			return getContext(key)
		},
		set(value: Value, force?: boolean) {
			if (!force && hasContext(key)) throw new Error(`Context of key ${key} already exists`)
			return setContext(key, value)
		},
	}
}

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

// MARK: hashStr

/**
 * Hashes a given string using the SHA-256 algorithm and encodes the result in lowercase hexadecimal format.
 *
 * This function uses the `TextEncoder` to convert the input string to a `Uint8Array`,
 * then computes the SHA-256 hash of the byte array, and finally encodes the hash
 * in lowercase hexadecimal format.
 *
 * @param {string} str - The input string to be hashed.
 * @returns {string} The SHA-256 hash of the input string, encoded in lowercase hexadecimal format.
 */
export function hashStr(str: string) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(str)))
}

// MARK: wait

export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

// MARK: loadImage

export function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.onload = () => resolve(image)
		image.onerror = reject
		image.src = url
	})
}

// MARK: .svelte exports

export * from "./utils.svelte"
