# Edge Functions Setup Guide for NourishSA

This guide will help you deploy the Supabase Edge Functions and ensure your frontend connects properly with the backend.

## 🚀 Edge Functions Overview

The NourishSA platform includes **4 main edge functions**:

1. **`ai-matching`** - AI-powered donation matching system
2. **`notifications`** - User notification management
3. **`statistics`** - Dashboard statistics calculation
4. **`audit-log`** - System audit trail logging

## 📋 Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project created** with database schema deployed
3. **Environment variables configured**

## 🔧 Deployment Steps

### Step 1: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link your project (replace with your project ref)
supabase link --project-ref your-project-ref
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy ai-matching
supabase functions deploy notifications
supabase functions deploy statistics
supabase functions deploy audit-log
```

### Step 3: Set Environment Variables

Set the required environment variables in your Supabase dashboard:

1. Go to **Settings > Edge Functions**
2. Add the following variables:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 🔐 Security Configuration

### 1. Enable Edge Functions

In your Supabase dashboard:
1. Go to **Settings > Edge Functions**
2. Enable **Edge Functions**
3. Set **JWT Expiry** to your preferred duration (e.g., 3600 seconds)

### 2. Configure CORS

The edge functions include CORS headers, but you may need to configure additional settings in your Supabase dashboard:

1. Go to **Settings > API**
2. Add your frontend domain to **Additional Allowed Origins**

## 🧪 Testing Edge Functions

### 1. Test AI Matching Function

```bash
# Test locally
supabase functions serve ai-matching

# Test with curl
curl -X POST http://localhost:54321/functions/v1/ai-matching \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"donation_id": "your-donation-id"}'
```

### 2. Test Notifications Function

```bash
curl -X POST http://localhost:54321/functions/v1/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "notification_data": {
      "user_id": "user-uuid",
      "title": "Test Notification",
      "message": "This is a test notification",
      "type": "system"
    }
  }'
```

### 3. Test Statistics Function

```bash
curl -X POST http://localhost:54321/functions/v1/statistics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{"force_refresh": false}'
```

## 🔗 Frontend Integration

### 1. API Service Configuration

The frontend uses the `APIService` class in `src/lib/api.ts` to communicate with edge functions. Ensure your environment variables are set:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Testing Frontend-Backend Connection

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test donation creation:**
   - Sign in to your application
   - Navigate to the donation form
   - Create a test donation
   - Check the browser console for any errors

3. **Test AI matching:**
   - After creating a donation, check if AI matching is triggered
   - Verify notifications are created for matched recipients

### 3. Debugging Common Issues

#### Issue: "Function not found" error
**Solution:**
- Ensure edge functions are deployed: `supabase functions deploy`
- Check function names match exactly
- Verify project is linked correctly

#### Issue: "Unauthorized" error
**Solution:**
- Check environment variables are set correctly
- Verify service role key has proper permissions
- Ensure CORS is configured properly

#### Issue: "Database connection failed"
**Solution:**
- Verify database schema is deployed
- Check RLS policies are configured
- Ensure service role key has database access

## 📊 Monitoring and Logs

### 1. View Function Logs

```bash
# View logs for all functions
supabase functions logs

# View logs for specific function
supabase functions logs ai-matching
```

### 2. Monitor in Supabase Dashboard

1. Go to **Edge Functions** in your dashboard
2. Click on a function to view its logs
3. Monitor execution times and errors

### 3. Set up Alerts

Configure alerts for:
- Function execution failures
- High response times
- Database connection errors

## 🔄 Production Deployment

### 1. Environment Setup

For production, ensure:
- All environment variables are set
- CORS origins are restricted to your domain
- JWT expiry is appropriate for production
- Rate limiting is configured

### 2. Performance Optimization

- Monitor function execution times
- Optimize database queries
- Implement caching where appropriate
- Use connection pooling for database operations

### 3. Security Hardening

- Review and update RLS policies
- Implement proper input validation
- Set up audit logging
- Configure proper CORS policies

## 🧪 Testing Checklist

### Frontend Tests
- [ ] User authentication works
- [ ] Donation creation form submits successfully
- [ ] Claim form works with donation selection
- [ ] Notifications are displayed correctly
- [ ] Statistics dashboard loads data
- [ ] Error handling works properly

### Backend Tests
- [ ] AI matching function executes successfully
- [ ] Notifications are created and sent
- [ ] Statistics are calculated correctly
- [ ] Audit logs are created
- [ ] Database operations work with RLS

### Integration Tests
- [ ] End-to-end donation flow works
- [ ] Claim process completes successfully
- [ ] Notifications are triggered appropriately
- [ ] Data consistency is maintained

## 🚨 Troubleshooting

### Common Error Messages

**"Function not deployed"**
```bash
# Redeploy the function
supabase functions deploy function-name
```

**"Invalid JWT"**
- Check authentication in frontend
- Verify JWT expiry settings
- Ensure user is properly signed in

**"Database permission denied"**
- Check RLS policies
- Verify service role permissions
- Ensure user has proper role

**"CORS error"**
- Add your domain to allowed origins
- Check CORS headers in edge functions
- Verify request headers

### Debug Mode

Enable debug logging in edge functions:

```typescript
// Add to edge function
console.log('Debug info:', { data, error })
```

### Performance Issues

1. **Check function execution time:**
   ```bash
   supabase functions logs --follow
   ```

2. **Optimize database queries:**
   - Use proper indexes
   - Limit result sets
   - Implement pagination

3. **Monitor memory usage:**
   - Check function logs for memory warnings
   - Optimize data processing

## 📈 Scaling Considerations

### 1. Database Scaling
- Monitor query performance
- Add indexes as needed
- Consider read replicas for heavy queries

### 2. Function Scaling
- Monitor concurrent executions
- Implement rate limiting
- Use caching for frequently accessed data

### 3. Storage Scaling
- Monitor storage usage
- Implement cleanup policies
- Consider archiving old data

## 🔄 Updates and Maintenance

### 1. Updating Edge Functions

```bash
# Deploy updated functions
supabase functions deploy

# Test in staging first
supabase functions deploy --env-file .env.staging
```

### 2. Database Migrations

```bash
# Apply new migrations
supabase db push

# Reset if needed (careful in production)
supabase db reset
```

### 3. Monitoring and Alerts

Set up monitoring for:
- Function execution failures
- Database performance
- API response times
- Error rates

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check function logs for detailed error messages
4. Verify all environment variables are set correctly
5. Test with minimal data to isolate issues

## 🎯 Next Steps

After successful deployment:

1. **Test all user flows** end-to-end
2. **Monitor performance** and optimize as needed
3. **Set up monitoring** and alerting
4. **Document any custom configurations**
5. **Plan for scaling** as user base grows

---

**Note**: This setup provides a solid foundation for your NourishSA platform. The edge functions handle the core business logic while maintaining security and performance. 