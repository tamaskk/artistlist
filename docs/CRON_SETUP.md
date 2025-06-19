# Cron Job Setup for Expired Ads Check

This document explains how to set up a cron job to automatically check for expired advertisements and update their status.

## Overview

The cron job checks for ads that have expired (where `adEndDate` is in the past) and:
1. Updates the ad status from "running" to "completed"
2. Sets the artist's `isAdActive` to `false`
3. Clears the artist's `adsUntil` field
4. Fixes any orphaned artists (artists with `isAdActive: true` but expired or missing `adsUntil`)

## API Endpoints

### Production Cron Endpoint
- **URL**: `POST /api/cron/check-expired-ads`
- **Security**: Requires `x-cron-secret` header matching `CRON_SECRET` environment variable
- **Purpose**: For production cron services

### Manual Testing Endpoint
- **URL**: `POST /api/admin/manual-check-expired-ads`
- **Security**: No authentication required (for testing only)
- **Purpose**: For manual testing and debugging

## Environment Variables

Add the following to your `.env.local` file:

```env
CRON_SECRET=your-secure-random-string-here
```

## Setting Up Cron Jobs

### Option 1: Using a Cron Service (Recommended)

#### Vercel Cron Jobs
If deploying on Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-expired-ads",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs once per day at midnight. **Note**: Vercel hobby plans are limited to one cron job per day.

#### Other Cron Services
You can use services like:
- **Cron-job.org**: Free cron service
- **EasyCron**: Paid service with more features
- **AWS EventBridge**: If using AWS
- **Google Cloud Scheduler**: If using GCP

### Option 2: Server Cron (Linux/Unix)

Add to your server's crontab:

```bash
# Edit crontab
crontab -e

# Add this line to run every 6 hours
0 */6 * * * curl -X POST https://yourdomain.com/api/cron/check-expired-ads -H "x-cron-secret: your-secure-random-string-here"
```

### Option 3: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to run every 6 hours
4. Set action to run a program: `curl`
5. Add arguments: `-X POST https://yourdomain.com/api/cron/check-expired-ads -H "x-cron-secret: your-secure-random-string-here"`

## Testing the Cron Job

### Manual Testing
1. Navigate to `/admin/cron` in your application
2. Click "Check Expired Ads" button
3. Review the results

### API Testing
```bash
# Test the manual endpoint
curl -X POST https://yourdomain.com/api/admin/manual-check-expired-ads

# Test the production endpoint (requires secret)
curl -X POST https://yourdomain.com/api/cron/check-expired-ads \
  -H "x-cron-secret: your-secure-random-string-here"
```

## Response Format

The API returns a JSON response with:

```json
{
  "ok": true,
  "message": "Expired ads check completed",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "results": {
    "processed": 5,
    "updated": 3,
    "errors": 0,
    "details": [
      {
        "adId": "ad_id_here",
        "artistId": "artist_id_here",
        "title": "Ad Title",
        "status": "completed"
      }
    ]
  }
}
```

## Monitoring

### Logs
The cron job logs important information:
- Number of expired ads found
- Number of orphaned artists found
- Processing results
- Any errors encountered

### Recommended Monitoring
1. **Set up log monitoring** to track cron job execution
2. **Monitor error rates** in the results
3. **Set up alerts** for failed executions
4. **Regular manual checks** to verify functionality

## Security Considerations

1. **Keep the CRON_SECRET secure** and use a strong random string
2. **Don't expose the manual endpoint** in production
3. **Monitor for unauthorized access** attempts
4. **Use HTTPS** for all cron job calls
5. **Consider IP whitelisting** for additional security

## Troubleshooting

### Common Issues

1. **Cron job not running**
   - Check cron service status
   - Verify URL is accessible
   - Check authentication headers

2. **Ads not being updated**
   - Verify database connection
   - Check for JavaScript errors in logs
   - Ensure proper date formatting

3. **Permission errors**
   - Check database user permissions
   - Verify collection access rights

### Debug Steps

1. Test manually using `/admin/cron`
2. Check server logs for errors
3. Verify environment variables are set
4. Test database connectivity
5. Check ad data structure

## Frequency Recommendations

- **Development**: Every hour or manual testing
- **Production**: Every 6 hours (4 times per day)
- **High-traffic sites**: Every 2-4 hours

## Performance Considerations

- The cron job processes ads sequentially to avoid overwhelming the database
- Consider batch processing for large numbers of ads
- Monitor execution time and optimize if needed
- Add database indexes on `status` and `adEndDate` fields for better performance 