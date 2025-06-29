# TaskFlow - Intelligent Task Management

A modern, collaborative task management application built with React, TypeScript, and Supabase. TaskFlow enables teams to organize, track, and collaborate on tasks with real-time updates and intelligent features.

## 🚀 Features

- **Real-time Collaboration**: Live updates across all connected devices
- **Task Management**: Create, edit, delete, and organize tasks with priorities and due dates
- **Task Sharing**: Share tasks with team members via email
- **Smart Filtering**: Filter tasks by status, priority, due date, and more
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Secure Authentication**: Google OAuth and email/password authentication
- **Offline Support**: Continue working even when offline
- **Role-based Access**: Admin and user roles with appropriate permissions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify (frontend), Supabase (backend)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Modern web browser

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Copy `.env.example` to `.env` and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Set Up Database

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the content from `supabase/migrations/create_complete_schema.sql`
3. Run the query to create all tables and policies

### 5. Configure Authentication (Optional)

For Google OAuth:
1. Go to Authentication > Settings in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📖 Usage

### Creating Tasks
1. Click the "New Task" button
2. Fill in task details (title, description, priority, due date)
3. Click "Create" to save

### Sharing Tasks
1. Click the share icon on any task
2. Enter the email address of the person you want to share with
3. They'll be able to view and edit the shared task

### Filtering and Sorting
- Use the sidebar to filter tasks by status, due date, or completion
- Sort tasks by creation date, due date, priority, or title
- Search tasks using the search bar

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │◄──►│ │ Auth        │ │    │ │ profiles    │ │
│ │ - Dashboard │ │    │ │ Real-time   │ │    │ │ tasks       │ │
│ │ - TaskList  │ │    │ │ API         │ │◄──►│ │ task_shares │ │
│ │ - TaskCard  │ │    │ │ Storage     │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Hooks       │ │    │ │ Row Level   │ │    │ │ Indexes     │ │
│ │ - useTasks  │ │    │ │ Security    │ │    │ │ Triggers    │ │
│ │ - useAuth   │ │    │ │ Policies    │ │    │ │ Functions   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security

- **Row Level Security**: All database tables use RLS policies
- **Authentication**: Secure OAuth 2.0 and email/password auth
- **Data Validation**: Client and server-side validation
- **HTTPS**: All communications encrypted in transit
- **Environment Variables**: Sensitive data stored securely

## 🚀 Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Backend (Supabase)
- Supabase handles all backend infrastructure
- Database migrations can be applied via SQL Editor
- Real-time subscriptions work automatically

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📝 API Documentation

### Task Operations
- `GET /tasks` - Fetch user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Sharing Operations
- `POST /task_shares` - Share task with user
- `GET /task_shares` - Get shared tasks
- `DELETE /task_shares/:id` - Remove task share

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the excellent backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide](https://lucide.dev) for the beautiful icons
- [React](https://reactjs.org) team for the amazing framework

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [Setup Guide](SETUP_GUIDE.md) for detailed instructions
- Review the [troubleshooting section](#troubleshooting) in the setup guide

---

**This project is a part of a hackathon run by https://www.katomaran.com**

## 🎯 Assumptions Made

Based on the requirements, the following assumptions were made:

1. **User Authentication**: Users prefer multiple sign-in options (Google OAuth + email/password)
2. **Task Collaboration**: Teams need to share tasks with specific permissions (read/write)
3. **Real-time Updates**: Users expect live updates when collaborating
4. **Mobile Responsiveness**: Application should work on all device sizes
5. **Offline Capability**: Users may need to work without internet connection
6. **Data Security**: All user data should be protected with proper access controls
7. **Scalability**: Application should handle multiple users and large task volumes
8. **Performance**: Fast loading and responsive interactions are critical
9. **Accessibility**: Application should be usable by people with disabilities
10. **Modern UI/UX**: Clean, intuitive interface following current design trends