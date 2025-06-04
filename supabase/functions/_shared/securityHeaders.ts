
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export function addSecurityHeaders(headers: Record<string, string>): Record<string, string> {
  return {
    ...headers,
    ...securityHeaders
  };
}
