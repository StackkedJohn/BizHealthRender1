# BizHealth Report Generation Pipeline

This is the background worker service for BizHealth.ai that generates business health assessment reports using AI.

## Overview

This worker:
1. Polls the Supabase `pipeline_queue` table every 30 seconds for new jobs
2. When a job is found, fetches the questionnaire data
3. Generates 17 different report types using Claude AI
4. Saves the generated HTML reports to the Supabase `reports` table
5. Updates job status and progress throughout the process

## Report Types Generated

- Comprehensive Business Health Report
- Executive Brief
- Executive Overview
- Owner's Strategic Report
- Growth Engine Deep Dive
- Performance Hub Deep Dive
- People & Leadership Deep Dive
- Risk & Systems Deep Dive
- Manager's Strategy Report
- Manager's Sales & Marketing Report
- Manager's Operations Report
- Manager's Financials Report
- Manager's IT & Technology Report
- Employee Engagement Report
- Financial Analysis Report
- Risk Assessment Report
- Transformation Roadmap

## Deployment on Render

### 1. Create a New Background Worker

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Background Worker"
3. Connect your GitHub repository
4. Select this repository (`BizHealthRender1`)

### 2. Configure Build Settings

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment:** Node

### 3. Set Environment Variables

Add these environment variables in Render:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://jksqdjauzohieghijkam.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

### 4. Deploy

Click "Create Background Worker" and Render will automatically build and deploy.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run in development mode: `npm run dev`

## How It Works

1. **User completes questionnaire** on the frontend
2. **Frontend triggers pipeline** by inserting a job into `pipeline_queue`
3. **This worker picks up the job** and starts processing
4. **Reports are generated** one by one using Claude AI
5. **Reports are saved** to the `reports` table
6. **User can view reports** in their dashboard

## Monitoring

- Check Render logs for worker output
- Monitor the `pipeline_queue` table for job status
- Check the `reports` table for generated reports

## Troubleshooting

- **Worker not processing jobs:** Check environment variables are set correctly
- **Reports not generating:** Check Anthropic API key and rate limits
- **Database errors:** Verify Supabase service role key has correct permissions

## Version

Last updated: 2026-01-16 - Fixed deployment configuration
