/**
 * UUID Utility Functions
 * SQLite compatible UUID generation
 */
import { randomUUID } from 'crypto';
/**
 * Generate a UUID v4
 * Compatible with SQLite (no gen_random_uuid function)
 */
export function generateUUID() {
    return randomUUID();
}
/**
 * Generate a UUID with prefix
 * Useful for identifying entity types
 */
export function generatePrefixedUUID(prefix) {
    return `${prefix}_${randomUUID()}`;
}
/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Generate multiple UUIDs
 */
export function generateUUIDs(count) {
    return Array.from({ length: count }, () => randomUUID());
}
/**
 * Default export for convenience
 */
export default {
    generate: generateUUID,
    generatePrefixed: generatePrefixedUUID,
    isValid: isValidUUID,
    generateMultiple: generateUUIDs,
};
