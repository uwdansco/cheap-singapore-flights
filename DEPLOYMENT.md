# Deployment Guide - Cheap Singapore Flights

Complete deployment checklist and post-launch monitoring plan.

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Production build successful (`npm run build`)
- [ ] No console.log statements in production code
- [ ] No TODO comments for critical features
- [ ] TypeScript strict mode enabled and passing
- [ ] ESLint warnings resolved
- [ ] Code reviewed by team

### Security Audit
- [ ] All RLS policies reviewed and tested
- [ ] Rate limiting configured on all endpoints
- [ ] Input validation on all user inputs
- [ ] XSS prevention in place
- [ ] SQL injection protection verified
- [ ] CSRF tokens implemented
- [ ] Secrets stored securely (not in code)
- [ ] Password requirements enforced (8+ chars, mixed case, numbers, special chars)
- [ ] Email verification required
- [ ] Session timeout configured (7 days)
- [ ] Admin routes protected
- [ ] Audit logging enabled

### Environment Setup
- [ ] Production Supabase project created
- [ ] All environment variables set:
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_PUBLISHABLE_KEY
  - [ ] AMADEUS_CLIENT_ID
  - [ ] AMADEUS_CLIENT_SECRET
  - [ ] RESEND_API_KEY
- [ ] Database migrations applied
- [ ] Indexes created
- [ ] RLS policies enabled
- [ ] Edge functions deployed
- [ ] Cron jobs configured

### DNS & Domain
- [ ] Domain purchased: yourdomain.com
- [ ] A record configured
- [ ] CNAME for www subdomain
- [ ] SSL certificate active (auto via Vercel/Lovable)
- [ ] Email domain configured: emails.yourdomain.com
- [ ] SPF record added
- [ ] DKIM configured in Resend
- [ ] DMARC policy set

### Email Configuration
- [ ] Resend account created
- [ ] Email domain verified in Resend
- [ ] RESEND_API_KEY added to secrets
- [ ] Email templates tested
- [ ] Unsubscribe links tested
- [ ] Email tracking pixels working
- [ ] Bounce handling configured
- [ ] Spam test score >8/10 (Mail Tester)

### External Integrations
- [ ] Amadeus API credentials verified
- [ ] Amadeus API quota checked (10,000 calls/month free)
- [ ] Test flight search successful
- [ ] Error handling for API failures
- [ ] Rate limiting respected

### Performance
- [ ] Lighthouse score >90 (Performance)
- [ ] Lighthouse score 100 (Accessibility)
- [ ] Lighthouse score 100 (Best Practices)
- [ ] Lighthouse score 100 (SEO)
- [ ] Images optimized and lazy-loaded
- [ ] JavaScript bundle size < 500KB
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Database queries optimized
- [ ] Indexes verified
- [ ] Caching configured

### SEO
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Meta tags on all pages
- [ ] Open Graph tags
- [ ] Twitter Cards
- [ ] Structured data (Schema.org)
- [ ] Canonical URLs
- [ ] Google Search Console set up
- [ ] Google Analytics installed
- [ ] Bing Webmaster Tools configured

### Testing
- [ ] User signup flow tested in production
- [ ] Email verification flow tested
- [ ] Onboarding flow tested
- [ ] Add/remove destination tested
- [ ] Price alert triggering tested
- [ ] Email delivery tested
- [ ] Unsubscribe flow tested
- [ ] Admin login tested
- [ ] Mobile responsiveness tested (iOS & Android)
- [ ] Cross-browser tested (Chrome, Safari, Firefox, Edge)
- [ ] PWA installation tested
- [ ] Offline functionality tested

### Legal & Compliance
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie Policy published
- [ ] GDPR compliance verified
- [ ] CAN-SPAM compliance verified
- [ ] Contact page with physical address
- [ ] Affiliate disclosures (if applicable)

## 🎯 Launch Day

### Morning (Pre-Launch)
1. **Final Code Deploy**
   ```bash
   git checkout main
   git pull
   npm run build
   # Deploy via Lovable/Vercel
   ```

2. **Database Verification**
   - Check all migrations applied
   - Verify RLS policies active
   - Test database connectivity
   - Check indexes exist

3. **Monitor Setup**
   - Start error monitoring (Sentry)
   - Open analytics dashboard
   - Open edge function logs
   - Open email delivery dashboard

### Launch (Go Live)
4. **DNS Cutover** (if migrating)
   - Update A records
   - Wait for propagation (can take up to 48 hours)
   - Monitor DNS propagation tools

5. **Smoke Tests** (15 minutes)
   - [ ] Homepage loads
   - [ ] Signup flow works
   - [ ] Email verification sent
   - [ ] Dashboard accessible
   - [ ] Add destination works
   - [ ] Admin login works
   - [ ] Email delivery working

6. **Launch Announcement**
   - Social media posts
   - Email to beta testers
   - Submit to Product Hunt (optional)
   - Update status page

### Afternoon (Post-Launch Monitoring)
7. **Monitor for First 4 Hours**
   - Error rate < 1%
   - API response times < 2s
   - No 5xx errors
   - Email delivery rate >95%
   - No database connection issues

8. **User Feedback**
   - Monitor support email
   - Check social media mentions
   - Review error logs
   - Track signup conversions

## 📊 Post-Launch Monitoring (Week 1)

### Daily Checks
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%
- [ ] Email open rate >20%
- [ ] Email click rate >5%
- [ ] No failed cron jobs
- [ ] Database performance normal
- [ ] No security alerts

### Metrics to Track

#### User Metrics
- Daily signups
- Onboarding completion rate (target: >70%)
- Active users (daily/weekly/monthly)
- Destinations tracked per user (target: >3)
- Churn rate (target: <10% monthly)

#### System Metrics
- API response time (target: <2s)
- Database query time (target: <100ms)
- Email delivery rate (target: >95%)
- Email bounce rate (target: <5%)
- Edge function error rate (target: <1%)
- Price check success rate (target: >95%)

#### Business Metrics
- Conversion rate (visitor → signup) (target: >10%)
- Engagement rate (opened email → clicked) (target: >5%)
- User retention (7-day) (target: >50%)
- User retention (30-day) (target: >30%)

### Week 1 Action Items
1. **Monday**: Review launch metrics, fix critical bugs
2. **Tuesday**: Analyze user feedback, prioritize improvements
3. **Wednesday**: Optimize slow queries, improve performance
4. **Thursday**: Review email deliverability, adjust templates
5. **Friday**: Analyze full week metrics, plan Week 2
6. **Weekend**: Monitor systems, respond to issues

## 🔥 Rollback Plan

If critical issues arise, follow this rollback procedure:

### Level 1: Code Rollback (5 minutes)
```bash
# Revert to previous working version via Vercel/Lovable
# Click "Rollback" on previous deployment
```

### Level 2: Database Rollback (15 minutes)
```bash
# Restore from backup
# In Supabase dashboard: Database → Backups → Restore
```

### Level 3: Full Rollback (30 minutes)
- Rollback code
- Restore database from backup
- Clear cache
- Notify users of maintenance

## 🛠️ Emergency Contacts

- **Hosting Support**: Lovable/Vercel support
- **Database Support**: Supabase support
- **Email Support**: Resend support
- **DNS Support**: Your domain registrar
- **On-Call Developer**: [Your contact]

## 📈 Scaling Plan

### When to Scale

**Immediate action required if:**
- Response time > 5s consistently
- Error rate > 5%
- Database CPU > 80%
- Email queue backlog > 1000

### Scaling Steps

1. **Database**
   - Upgrade Supabase plan
   - Add read replicas
   - Implement connection pooling
   - Add Redis for caching

2. **Edge Functions**
   - Already auto-scaling
   - Monitor concurrency limits
   - Optimize cold starts

3. **Email**
   - Upgrade Resend plan
   - Implement email batching
   - Use background jobs

## 🎓 Lessons Learned Template

After Week 1, document:
- What went well?
- What didn't go well?
- What would we do differently?
- Technical debt to address
- Feature requests from users
- Performance bottlenecks identified

---

## 📞 Support Plan

### Support Channels
1. Email: support@yourdomain.com (response time: 24h)
2. Discord community (optional)
3. In-app help center (future)

### Support SLA
- **Critical** (site down): 1 hour response
- **High** (feature broken): 4 hour response
- **Medium** (bug): 24 hour response
- **Low** (enhancement): 7 day response

---

**Remember**: Launch is just the beginning. Monitor, iterate, and improve based on user feedback and data.

Good luck! 🚀
