# EmpathAI - Vercel Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/EmpathAI)

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **API Keys** (Required):
   - [Google Gemini API Key](https://makersuite.google.com/app/apikey)
   - [Groq API Key](https://console.groq.com/keys) (Recommended)

## Deployment Steps

### Option 1: One-Click Deploy
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set environment variables (see below)
4. Deploy!

### Option 2: Manual Deploy
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

## Environment Variables

Set these in your Vercel project settings:

### Required Variables
```
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### Optional Variables
```
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_APP_NAME=EmpathAI
VOICE_RESPONSE_RATE=1.1
VOICE_RESPONSE_VOLUME=0.9
VOICE_RESPONSE_PITCH=1.0
```

### Authentication (Optional)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### Database (Optional)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Configuration Files

- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `next.config.js` - Next.js optimized for Vercel
- ✅ `.env.local.example` - Environment template
- ✅ `package.json` - Build scripts configured

## Post-Deployment

1. **Test the deployment** - Visit your Vercel URL
2. **Configure domain** - Add custom domain in Vercel settings
3. **Monitor performance** - Use Vercel Analytics
4. **Set up monitoring** - Configure Vercel monitoring

## Troubleshooting

### Build Errors
- Check environment variables are set
- Ensure all API keys are valid
- Check Vercel function logs

### Runtime Errors
- Verify API keys work in production
- Check browser console for client-side errors
- Review Vercel function logs

### Performance Issues
- Enable Vercel Analytics
- Check bundle size in build output
- Monitor function execution times

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Open an issue in the GitHub repository

---

**Ready to deploy!** 🚀
