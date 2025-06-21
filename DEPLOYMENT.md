# UniVoucher MCP Server - Deployment Guide

This guide covers deploying the UniVoucher MCP server to Digital Ocean App Platform as a Node.js application.

## Prerequisites

- Digital Ocean account
- GitHub repository with your MCP server code

## Deployment to Digital Ocean App Platform

The recommended way to deploy is using Digital Ocean's App Platform for Node.js applications:

### 1. Push to GitHub
Make sure your code is in a GitHub repository

### 2. Create App on Digital Ocean
- Go to Digital Ocean App Platform
- Click "Create App"
- Select "GitHub" as source
- Choose your repository and branch

### 3. Configure Build Settings
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **HTTP Port**: `3000`
- **Node Version**: `20.x`

### 4. Environment Variables
```
NODE_ENV=production
PORT=3000
```

### 5. Deploy
Click "Create Resources" and wait for deployment to complete

## Alternative: Using app.yaml

You can also use the included `app.yaml` file for deployment:

```bash
doctl apps create --spec app.yaml
```

## Post-Deployment

### 1. Verify Deployment

Check the health endpoint:
```bash
curl https://your-app-url.ondigitalocean.app/health
```

Expected response:
```json
{
  "status": "ok",
  "name": "univoucher-mcp",
  "version": "1.0.0",
  "message": "UniVoucher MCP Server is running"
}
```

### 2. Test API Functionality

Test the root endpoint:
```bash
curl https://your-app-url.ondigitalocean.app/
```

### 3. Configure Custom Domain (Optional)

In Digital Ocean App Platform:
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Local Development vs Production

The server automatically detects the environment:

- **Development**: Starts as MCP server on stdio
- **Production**: Starts HTTP server on specified port

### Local MCP Testing

```bash
# Start in MCP mode
npm run dev

# Start in HTTP mode for testing
HTTP_MODE=true npm run dev
```

## Monitoring and Logs

### View Logs
```bash
doctl apps logs your-app-id
```

### Monitor Performance
- Use Digital Ocean's built-in monitoring
- Check the `/health` endpoint regularly
- Monitor memory and CPU usage

## Scaling

For high-traffic usage:

1. **Increase Instance Size**:
   - Go to your app settings
   - Increase instance size from basic-xxs to basic-xs or higher

2. **Add More Instances**:
   - Increase instance count for load balancing

## Security Considerations

1. **HTTPS**: Digital Ocean App Platform provides HTTPS by default
2. **Environment Variables**: Never commit secrets to git
3. **Rate Limiting**: Consider adding rate limiting for production use
4. **CORS**: Configure CORS if serving web clients

## Cost Optimization

- **Basic XXS**: $5/month - Good for development and light usage
- **Basic XS**: $12/month - Better for production use
- **Professional**: $25/month+ - For high-traffic applications

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (requires 18+)
   - Verify all dependencies are listed in package.json
   - Make sure TypeScript builds successfully

2. **Health Check Fails**:
   - Ensure PORT environment variable is set
   - Check if server is binding to 0.0.0.0, not localhost

3. **Documentation Not Loading**:
   - Verify docs folder is included in build
   - Check file paths are correct

### Debug Commands

```bash
# Check app status
doctl apps list

# View detailed app info
doctl apps get your-app-id

# View build logs
doctl apps logs your-app-id --type build

# View runtime logs
doctl apps logs your-app-id --type run
```

## Support

For deployment issues:
- Check Digital Ocean documentation
- Open GitHub issue
- Join UniVoucher Telegram group

## Next Steps

After successful deployment:
1. Share the server URL with developers
2. Create documentation for integration
3. Set up monitoring and alerting
4. Plan for updates and maintenance 