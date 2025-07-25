'use client';
import { supabase } from 'app/lib/supabaseBrowserClient';
import { get } from 'http';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const menuItems = [
  { label: 'Profile', href: '/profile', roles: ['user', 'admin'] },
  { label: 'Admin', href: '/admin', roles: ['admin'] },
  { label: 'Settings', href: '/settings', roles: ['user', 'admin'] }
];

export default function ProfileHandler() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Get the current session data when component mounts
  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const user = session.user;
      setUserId(user.id);
      setUserEmail(user.email ?? null);
      // For the username, either get it from user metadata or make a separate query
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || null);
      setUserRole(await getUserRole(user.id));
    }
  };

  async function getUserRole(userId: string ): Promise<string | null> {
    try {
      const response = await fetch(`/api/admin/user-role?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user role');
      }

      return data.role_name.toLowerCase() || null;
    } catch (err: any) {
      console.error('Error fetching user role:', err);
      return null;
    }
  }

  useEffect(() => {
    fetchUserData();
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email ?? null);
          setUserName(session.user.user_metadata?.username || session.user.email?.split('@')[0] || null);
        } else {
          setUserEmail(null);
          setUserName(null);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-medium">U</span>
        </div>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          {menuItems
            .filter(item => item.roles.includes(userRole || 'guest'))
            .map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error logging out:', error.message);
              } else {
                setIsOpen(false);
                router.push('/auth/login');
              }
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}