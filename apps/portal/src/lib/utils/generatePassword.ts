/**
 * Password Generation Utility
 *
 * Generates secure temporary passwords for user credential creation.
 * Used when sending login credentials to new portal users.
 */

/**
 * Characters to use in password generation.
 * Excludes ambiguous characters: 0, O, l, 1, I
 * to avoid confusion when users read/type the password.
 */
const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/**
 * Generate a temporary password.
 *
 * Generates a random password of specified length using mixed case
 * letters and numbers, excluding ambiguous characters.
 *
 * @param length Password length (default: 12, minimum: 12)
 * @returns Generated password string
 */
export function generateTemporaryPassword(length: number = 12): string {
  const minLength = 12;
  const actualLength = Math.max(length, minLength);

  let password = "";
  for (let i = 0; i < actualLength; i++) {
    const randomIndex = Math.floor(Math.random() * PASSWORD_CHARS.length);
    password += PASSWORD_CHARS.charAt(randomIndex);
  }

  // Ensure password has at least one uppercase, lowercase, and number
  // by checking and regenerating if needed
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    // Recursively generate until we get a valid password
    return generateTemporaryPassword(actualLength);
  }

  return password;
}
