/**
 * Simple obfuscation for Expo Go compatibility.
 * Replaced CryptoJS with Base64 to avoid 'Native crypto module' errors on mobile.
 */

export const encryptData = (data: string) => {
  try {
    // Standard Base64 encoding
    return btoa(data);
  } catch (e) {
    return data;
  }
};

export const decryptData = (encryptedData: string) => {
  try {
    // Standard Base64 decoding
    return atob(encryptedData);
  } catch (e) {
    return encryptedData;
  }
};
