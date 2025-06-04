
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'validation_error' | 'unauthorized_access';
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  details?: any;
}

export function logSecurityEvent(event: SecurityEvent) {
  console.log('SECURITY_EVENT:', JSON.stringify({
    ...event,
    timestamp: new Date().toISOString()
  }));
}

export function createSecureErrorResponse(
  error: Error | string,
  status: number = 500,
  corsHeaders: Record<string, string> = {},
  context?: string
): Response {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Log detailed error for debugging (server-side only)
  console.error(`[${context || 'Unknown'}] Error:`, error);
  
  // Create generic error message for client
  let clientMessage: string;
  
  switch (status) {
    case 400:
      clientMessage = 'Invalid request data';
      break;
    case 401:
      clientMessage = 'Authentication required';
      break;
    case 403:
      clientMessage = 'Access denied';
      break;
    case 429:
      clientMessage = 'Too many requests. Please try again later';
      break;
    case 413:
      clientMessage = 'Request too large';
      break;
    default:
      clientMessage = 'An error occurred while processing your request';
  }
  
  return new Response(
    JSON.stringify({ 
      error: clientMessage,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      },
    }
  );
}

export function validateRequestSize(req: Request, maxSizeBytes: number = 100 * 1024 * 1024): boolean {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    return false;
  }
  return true;
}
