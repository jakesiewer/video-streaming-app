# Video Streaming Application

A modern video streaming platform built with Next.js, featuring a sleek user interface and seamless video playback experience.

## Features

- 🎥 High-quality video streaming
- 🎨 Modern, responsive UI
- ⚡ Fast page loads with Next.js
- 🔒 Secure authentication with Supabase
- 📱 Mobile-friendly design

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: ScyllaDB
- **Storage**: AWS S3
- **Video Streaming**: Custom streaming implementation with range requests

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- AWS S3 bucket
- ScyllaDB instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/video-streaming-app.git
cd video-streaming-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
AWS_REGION="your-aws-region"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="your-s3-bucket-name"
```

4. Initialize the database:
```bash
npm run init-db
npm run init-user-roles
npm run seed-db
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
video-streaming-app/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── components/     # React components
│   ├── lib/           # Utility functions and configurations
│   └── watch/         # Video watching pages
├── public/             # Static assets
└── styles/             # Global styles and Tailwind config
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
