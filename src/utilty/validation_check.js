// Email and Password Validation Utility

/**
 * Validates if the given email is in a proper format.
 * @param {string} email - The email to validate.
 * @returns {boolean} - Returns true if valid, false otherwise.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates if the given password meets the required criteria.
 * Criteria: Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.
 * @param {string} password - The password to validate.
 * @returns {boolean} - Returns true if valid, false otherwise.
 */
function isStrongPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

export default {
    isValidEmail,
    isStrongPassword
};