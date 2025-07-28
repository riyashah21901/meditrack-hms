# MediTrack Supabase Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: MediTrack
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### Step 2: Get Your Project Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secret!)

### Step 3: Run Database Scripts
1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. **FIRST**: Copy and paste the entire content from `scripts/01-create-tables.sql`
4. Click **Run** button
5. Wait for success message
6. Click **New Query** again
7. **SECOND**: Copy and paste the entire content from `scripts/02-seed-data.sql`
8. Click **Run** button
9. Verify data was inserted by going to **Table Editor**

### Step 4: Configure Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL = https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
   \`\`\`
4. Click **Save**
5. **Redeploy** your application

### Step 5: Test Your Setup
1. Visit your deployed Vercel app
2. Go to **Dashboard** → **Patients**
3. Try adding a new patient
4. Try editing an existing patient
5. Check if data persists after page refresh

## 🔧 Troubleshooting

### Common Issues:

**1. "Failed to fetch" errors**
- Check if environment variables are set correctly in Vercel
- Ensure Supabase project is active (not paused)
- Verify the project URL format

**2. "Row Level Security" errors**
- Make sure you ran the first SQL script completely
- Check if RLS policies were created properly

**3. "Table doesn't exist" errors**
- Ensure you ran both SQL scripts in the correct order
- Check Table Editor to verify tables were created

**4. Data not persisting**
- Verify environment variables are deployed
- Check browser console for JavaScript errors
- Ensure Supabase connection is working

### Verification Checklist:
- [ ] Supabase project created
- [ ] Database password saved
- [ ] Project keys copied
- [ ] First SQL script executed successfully
- [ ] Second SQL script executed successfully
- [ ] Tables visible in Table Editor
- [ ] Sample data visible in tables
- [ ] Environment variables added to Vercel
- [ ] Application redeployed
- [ ] CRUD operations working

## 📞 Need Help?
If you encounter issues:
1. Check Supabase logs in **Logs** → **Database**
2. Check Vercel function logs
3. Verify all environment variables are correct
4. Ensure no typos in SQL scripts
