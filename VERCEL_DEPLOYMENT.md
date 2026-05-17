# Vercel Deployment Instructions

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Backend API deployed and accessible

## Step 1: Connect GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for and select the `freightpilot` repository
5. Click "Import"

## Step 2: Configure Project Settings

### Root Directory
- Set to `frontend` (since the frontend is in a subdirectory)

### Build Command
- Should auto-detect as `npm run build`

### Output Directory
- Should auto-detect as `dist`

### Environment Variables

Add the following environment variables in Vercel project settings:

```
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

Replace `your-api-domain.com` with your actual backend API domain.

## Step 3: Deploy

1. Click "Deploy"
2. Vercel will automatically build and deploy the frontend
3. Your site will be available at `https://your-project.vercel.app`

## Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `app.freightpilot.com`)
4. Follow DNS configuration instructions

## Step 5: Set Up Production Environment

### Update Backend CORS Settings

Update your backend `.env` file to include the Vercel domain:

```env
DJANGO_CORS_ORIGINS=https://your-project.vercel.app,https://yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-project.vercel.app,https://yourdomain.com
```

### Update Frontend API URL

The `VITE_API_BASE_URL` environment variable should point to your production backend API.

## Step 6: Enable Automatic Deployments

Vercel automatically deploys when you push to the main branch. To deploy from a specific branch:

1. Go to project "Settings" → "Git"
2. Under "Deploy Hooks", you can create custom deployment triggers
3. Or manually trigger deployments from the Vercel dashboard

## Deployment from Command Line

If you prefer to deploy from the command line:

```bash
npm install -g vercel
cd frontend
vercel --prod
```

## Monitoring and Logs

### View Deployment Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment to view logs

### Monitor Performance

1. Go to "Analytics" tab in Vercel dashboard
2. View real-time metrics and performance data

## Rollback to Previous Deployment

1. Go to "Deployments" tab
2. Find the previous deployment you want to restore
3. Click the three dots menu
4. Select "Promote to Production"

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard. Common issues:
- Missing environment variables
- Node version mismatch (ensure Node 18+)
- Missing dependencies in package.json

### API Connection Issues

1. Verify `VITE_API_BASE_URL` is correct
2. Check backend CORS settings include Vercel domain
3. Ensure backend API is accessible from the internet

### Blank Page or 404 Errors

1. Verify `vercel.json` rewrites configuration
2. Check that `dist` folder is being built correctly
3. Clear browser cache and hard refresh

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. To optimize further:

1. Add cache headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Monitor Bundle Size

Use Vercel's built-in analytics to monitor bundle size and performance.

## Security

### Environment Variables

Never commit sensitive data. Use Vercel's environment variable management:

1. Go to project "Settings" → "Environment Variables"
2. Add variables for different environments (Production, Preview, Development)

### HTTPS

Vercel automatically provides HTTPS for all deployments.

## Next Steps

1. Test the deployed application thoroughly
2. Set up monitoring and alerting
3. Configure custom domain if needed
4. Set up automated backups for your database
5. Monitor API usage and performance

## Support

For Vercel-specific issues, visit: https://vercel.com/docs
For Freightpilot issues, refer to the API documentation and deployment guide.
