# Production Setup Guide

## ✅ Automated Cron Jobs (CONFIGURED)

### 1. Flight Price Checker
- **Schedule**: Every hour (at minute 0)
- **Function**: `check-flight-prices`
- **Status**: ✅ Active (Cron Job ID: 7)
- Checks 55 destinations via Amadeus API
- Creates price alerts for qualifying deals
- Queues emails for users

### 2. Email Queue Processor
- **Schedule**: Every 5 minutes
- **Function**: `process-email-queue`
- **Status**: ✅ Active (Cron Job ID: 8)
- Processes pending emails from queue
- Sends via Resend API
- Handles retries (max 3 attempts)

## ✅ Rate Limit Monitoring (CONFIGURED)

The system monitors Amadeus API rate limits automatically:
- Logs remaining requests after each API call
- Warns when below 100 requests remaining
- Handles 429 errors gracefully (returns null, continues with other destinations)
- Rate limit reset time is logged for troubleshooting

**Current API Limits:**
- Test API: 500 requests/month
- Production API: 10,000 requests/month (requires upgrade)

## 🔧 Custom Email Domain Setup (ACTION REQUIRED)

### Current Status:
Using Resend's default domain: `onboarding@resend.dev`

### To Use Your Own Domain:

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `updates.yourdomain.com`)

2. **Add DNS Records**
   Resend will provide 3 DNS records to add at your domain registrar:
   - **SPF Record** (TXT): Authorizes Resend to send email from your domain
   - **DKIM Record** (TXT): Signs emails to prevent spoofing
   - **Return-Path** (CNAME): Handles bounces

   Example DNS records:
   ```
   Type: TXT
   Name: updates.yourdomain.com
   Value: v=spf1 include:_spf.resend.com ~all

   Type: TXT
   Name: resend._domainkey.updates.yourdomain.com
   Value: [provided by Resend]

   Type: CNAME
   Name: resend._domainkey.updates.yourdomain.com
   Value: [provided by Resend]
   ```

3. **Verify Domain**
   - Wait for DNS propagation (15 minutes - 72 hours)
   - Click "Verify" in Resend dashboard
   - Status should change to "Verified" ✅

4. **Update Environment Variable**
   Go to Lovable Cloud → Secrets and add:
   ```
   SECRET_NAME: EMAIL_FROM
   VALUE: Cheap Singapore Flights <deals@updates.yourdomain.com>
   ```

5. **Test**
   Trigger a test email to verify the new sender address works.

## 📊 Monitoring Dashboard

### Check Cron Job Status
```sql
SELECT 
  jobname, 
  schedule, 
  active,
  jobid 
FROM cron.job 
WHERE jobname LIKE '%flight%' OR jobname LIKE '%email%';
```

### View Recent Executions
```sql
SELECT 
  j.jobname,
  r.runid,
  r.start_time,
  r.end_time,
  r.status,
  r.return_message
FROM cron.job j
JOIN cron.job_run_details r ON j.jobid = r.jobid
WHERE j.jobname IN ('check-flight-prices-hourly', 'process-email-queue-5min')
ORDER BY r.start_time DESC
LIMIT 20;
```

### Email Queue Statistics
```sql
SELECT 
  status,
  COUNT(*) as count,
  MAX(created_at) as last_created
FROM email_queue
GROUP BY status;
```

### Alert Performance
```sql
SELECT 
  COUNT(*) as total_alerts,
  COUNT(CASE WHEN email_opened = true THEN 1 END) as opened,
  COUNT(CASE WHEN link_clicked = true THEN 1 END) as clicked,
  ROUND(COUNT(CASE WHEN email_opened = true THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as open_rate,
  ROUND(COUNT(CASE WHEN link_clicked = true THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as click_rate
FROM price_alerts
WHERE sent_at >= NOW() - INTERVAL '30 days';
```

## 🚨 Troubleshooting

### Cron Jobs Not Running?
1. Check if pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check job status:
   ```sql
   SELECT * FROM cron.job WHERE active = false;
   ```

3. Re-enable if needed:
   ```sql
   UPDATE cron.job SET active = true WHERE jobname = 'check-flight-prices-hourly';
   ```

### Emails Not Sending?
1. Check email queue for errors:
   ```sql
   SELECT * FROM email_queue WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10;
   ```

2. Verify Resend API key is valid in Secrets

3. Check edge function logs:
   - Go to Lovable Cloud → Functions → process-email-queue → Logs

### Rate Limit Issues?
1. Monitor Amadeus API usage:
   - Check edge function logs for rate limit warnings
   - Look for "RATE LIMIT EXCEEDED" messages

2. Reduce destinations if hitting limits:
   ```sql
   -- Disable lower priority destinations
   UPDATE destinations SET is_active = false WHERE priority > 3;
   ```

3. Consider upgrading to Amadeus Production API (10,000 requests/month)

## 🎯 Performance Optimization

### Current Configuration
- 55 active destinations
- Checking every hour = 1,320 API calls/day
- With 5-minute email processing = 288 queue checks/day
- Total: ~1,600 operations/day

### Scaling Recommendations
1. **For 100+ destinations**: 
   - Upgrade to Amadeus Production API
   - Consider staggered checks (half hourly intervals)

2. **For high email volume**:
   - Batch email sending (up to 50 at once)
   - Implement email throttling for user preferences

3. **Cost optimization**:
   - Archive old price history (>90 days)
   - Clean up sent emails (>30 days)
   - Monitor Resend usage (50k emails/month free tier)

## 📈 Next Steps

1. ✅ Cron jobs configured
2. ✅ Rate limit monitoring active
3. 🔧 Set up custom email domain (see instructions above)
4. ✅ System ready for production traffic

## Support

For issues or questions:
- Check edge function logs in Lovable Cloud
- Review this documentation
- Contact Lovable support if persistent issues occur
