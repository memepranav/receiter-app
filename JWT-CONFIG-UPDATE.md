# JWT Configuration Updates Required

## Environment Variables to Update on Production Server

Update both `.env` and `.env.production` files on your server with these new JWT settings:

```bash
# JWT Configuration for Mobile-Friendly Token Management
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=QuranReciterRefresh2025_9L0nQ4oX8wC3yF7rS5uJ2vK6pM9zB1eG0kN4jL7oZ2xV5cB8nM1qP4wE6rT9yU3oI7sD0gF3hJ6kL9zX2cV5b8nM1!
JWT_REFRESH_EXPIRES_IN=30d
```

## Changes Made:

1. **Access Token**: Changed from `7d` to `1h` (more secure)
2. **Added Refresh Token Secret**: New secure secret for refresh tokens
3. **Refresh Token Duration**: Set to `30d` (better mobile UX)

## Files to Update on Server:

- `/var/www/receiter-app/apps/api/.env`
- `/var/www/receiter-app/apps/api/.env.production`

## After Updating:

```bash
# Restart the API service
pm2 restart reciter-api --update-env

# Verify the changes
pm2 logs reciter-api --lines 20
```

## Benefits:

- ✅ More secure with 1-hour access tokens
- ✅ Better mobile UX with 30-day refresh tokens  
- ✅ Automatic token refresh capabilities
- ✅ Reduced security risk if access token is compromised

## Mobile App Integration:

Mobile apps should now:
1. Store both `accessToken` and `refreshToken`
2. Refresh tokens every 50 minutes using `/api/v1/auth/refresh`
3. Handle token expiry gracefully

---
*Generated: $(date)*