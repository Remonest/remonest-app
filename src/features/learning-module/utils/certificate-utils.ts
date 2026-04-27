/**
 * Generate certificate ID based on user ID and module ID
 * Format: RMN-YYYY-XXXXX where XXXXX is a hash-based ID
 */
export function generateCertificateId(userId: string, moduleId: string): string {
  const hash = (userId + moduleId).split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const paddedHash = Math.abs(hash).toString().padStart(5, '0').slice(0, 5);
  const year = new Date().getFullYear();
  return `RMN-${year}-${paddedHash}`;
}
