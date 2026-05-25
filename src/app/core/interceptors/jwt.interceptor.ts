import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip off-gateway absolute URLs (e.g. S3 presigned PUT uploads). S3 rejects
  // requests that carry an Authorization header it didn't sign.
  const isExternal = /^https?:\/\//i.test(req.url) && !req.url.startsWith(environment.apiUrl);
  if (isExternal) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.token();

  // Create unique Request ID for logging & tracing in microservices (MDC Logging)
  const requestId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  let clonedHeaders = req.headers.set('X-Request-Id', requestId);

  // Downstream services trust X-User-* headers set by Gateway, but we pass Bearer Token to Gateway
  if (token) {
    clonedHeaders = clonedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const clonedReq = req.clone({ headers: clonedHeaders });
  return next(clonedReq);
};
