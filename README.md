# Liaise - Medical Documentation Platform

An experimental web application exploring ambient scribe technology and AI's potential in healthcare. This project demonstrates real-time medical transcription, clinical note generation, and patient-friendly communication tools.

## 🚀 Features

- **Audio Transcription**: Real-time voice recording with intelligent transcription powered by OpenAI Whisper
- **Clinical Note Generation**: AI-assisted conversion of transcriptions into structured clinical notes
- **Patient-Friendly Summaries**: Automatic translation of medical jargon into accessible language
- **Interactive Chat**: AI-powered Q&A interface for patients to understand their discharge summaries
- **Secure Authentication**: Enterprise-grade authentication with Clerk
- **Dashboard Analytics**: Track usage statistics and manage past transcriptions/summaries
- **Email Delivery**: Automated secure delivery of summaries to patients

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend & Services
- **Supabase** - Backend-as-a-Service (Database, Auth, Storage)
- **Edge Functions** - Serverless API endpoints
- **Clerk** - Authentication & user management
- **OpenAI API** - Whisper for transcription, GPT for summaries

### UI Libraries
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Clerk account
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Update `src/main.tsx` with your Clerk publishable key.

4. **Set up Supabase**
- Create a new Supabase project
- Run the migrations from `supabase/migrations`
- Configure edge function secrets (OpenAI API key)

5. **Deploy Edge Functions**
```bash
supabase functions deploy transcribe-audio
supabase functions deploy generate-clinical-notes
supabase functions deploy chat-with-summary
supabase functions deploy convert-to-patient-friendly
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── integrations/    # Third-party service integrations
├── lib/             # Utility functions
├── pages/           # Route components
└── utils/           # Helper utilities

supabase/
├── functions/       # Edge functions
└── migrations/      # Database migrations
```

## 🔐 Security

- All user data is encrypted at rest
- HTTPS enforced for all connections
- Row Level Security (RLS) enabled on all Supabase tables
- Authentication required for sensitive operations
- API keys stored securely in environment variables

## 📱 Key Pages

- `/` - Landing page with features overview
- `/dashboard` - User dashboard with analytics
- `/new-transcription` - Audio recording interface
- `/new-summary` - Document upload and summary generation
- `/patient-portal` - Public patient access to summaries
- `/settings` - User preferences and account management

## 🤝 Contributing

Contributions are welcome! This is an experimental project to explore AI applications in healthcare.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and experimentation.

## 🐛 Known Issues

- Audio recording requires HTTPS or localhost
- Large audio files may take longer to process
- Browser compatibility: Chrome, Firefox, Safari (latest versions)

## 📞 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using React, TypeScript, and modern web technologies.