import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserAwareCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const key = super.trackBy(context);
    if (!key) return key;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    // Default CacheInterceptor keys entries by URL only, so a personalized
    // GET response (e.g. /subscriptions/me) would be served to any other
    // caller who hits the same URL. Namespace the key by the caller's
    // Authorization header so cached entries never cross users.
    return authHeader ? `${authHeader}:${key}` : key;
  }
}
