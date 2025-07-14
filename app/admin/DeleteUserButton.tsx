'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteUserButton({ userId }: { userId: string; }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/user?userId=${encodeURIComponent(userId)}`, {
                method: 'DELETE',
            });
            router.refresh();

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

        } catch (err: any) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className="text-red-600 hover:text-red-900 ml-4 transition-colors"
            onClick={handleDelete}
            disabled={isLoading}
        >
            {isLoading ? 'Deleting...' : 'Delete'}
            {error && <span className="text-red-500 ml-2">{error}</span>}
        </button>
    );
}