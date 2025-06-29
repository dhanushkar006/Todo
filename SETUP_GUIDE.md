# TaskFlow Database Setup Guide

## Step 1: Create Supabase Project

1. **Visit Supabase**: Go to [https://supabase.com](https://supabase.com)
2. **Sign up/Sign in**: Create an account or sign in
3. **Create new project**:
   - Click "New Project"
   - Choose your organization
   - Project name: `TaskFlow`
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to your location
   - Click "Create new project"

## Step 2: Get Project Credentials

1. **Wait for setup**: Project takes 2-3 minutes to initialize
2. **Go to Settings**: Click "Settings" in left sidebar
3. **Click "API"**: Find your project credentials
4. **Copy these values**:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Configure Environment Variables

1. **Update `.env` file** in your project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.

## Step 4: Set Up Database Schema

1. **Go to SQL Editor**: In Supabase dashboard, click "SQL Editor"
2. **Create new query**: Click "New query"
3. **Copy and paste** the entire content from `supabase/migrations/create_complete_schema.sql`
4. **Run the query**: Click "Run" button
5. **Verify success**: You should see "Success. No rows returned" message

## Step 5: Configure Authentication

1. **Go to Authentication**: Click "Authentication" in left sidebar
2. **Click "Settings"**: Go to Auth settings
3. **Configure providers**:
   - **Email**: Already enabled by default
   - **Google OAuth** (optional):
     - Enable Google provider
     - Add your Google OAuth credentials
     - Set redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 6: Test the Connection

1. **Restart your development server**:
```bash
npm run dev
```

2. **Open the application**: Go to `http://localhost:5173`
3. **Try signing up**: Create a new account with email/password
4. **Verify database**: Check if your profile appears in the Supabase dashboard under "Table Editor" > "profiles"

## Step 7: Enable Real-time (Optional)

1. **Go to Database**: Click "Database" in left sidebar
2. **Click "Replication"**: Enable replication for real-time updates
3. **Enable tables**: Turn on replication for `tasks` and `profiles` tables

## Troubleshooting

### Common Issues:

1. **"Supabase Configuration Required" message**:
   - Check your `.env` file has correct values
   - Restart development server after updating `.env`

2. **Authentication errors**:
   - Verify your Supabase URL and anon key are correct
   - Check if email confirmation is disabled in Auth settings

3. **Database connection errors**:
   - Ensure you ran the SQL migration script
   - Check if RLS policies are properly set up

4. **Permission denied errors**:
   - Verify Row Level Security policies are created
   - Check if user is properly authenticated

### Getting Help:

- Check browser console for detailed error messages
- Verify database tables exist in Supabase dashboard
- Test authentication in Supabase Auth logs
- Ensure environment variables are loaded correctly

## Next Steps

Once connected:
1. Create your first task
2. Test task sharing functionality
3. Try real-time collaboration features
4. Customize the application for your needs

## Security Notes

- Never commit your `.env` file to version control
- Use environment-specific configurations for production
- Regularly rotate your Supabase keys
- Monitor authentication logs for suspicious activity