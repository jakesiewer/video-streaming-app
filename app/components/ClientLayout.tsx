'use client';

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseBrowserClient'
import ProfileHandler from './ProfileHandler'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log('Auth state changed:', event, session);

      const storeSession = (session: any) => {
        if (session?.user) {
          sessionStorage.setItem('user_id', session.user.id);
          sessionStorage.setItem('user_name', session.user.user_metadata.username);
          sessionStorage.setItem('user_email', session.user.email);
          sessionStorage.setItem('access_token', session.access_token || '');
          sessionStorage.setItem('refresh_token', session.refresh_token || '');
        }
      };

      switch (event) {
        case 'INITIAL_SESSION':
          storeSession(session);
          break;
        case 'SIGNED_IN':
          storeSession(session);
          router.push('/');
          break;
        case 'SIGNED_OUT':
          sessionStorage.clear();
          router.push('/auth/login');
          break;
        case 'PASSWORD_RECOVERY':
          break;
        case 'TOKEN_REFRESHED': 
          storeSession(session);
          break;
        case 'USER_UPDATED':
          storeSession(session);
          break;
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-slate-700 text-xl font-bold">StreamApp</h1>
              </div>
            </div>
            <div className="flex items-center">
              <ProfileHandler />
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  );
} 