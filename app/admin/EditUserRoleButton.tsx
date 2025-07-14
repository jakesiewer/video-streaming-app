'use client';

import { Role } from 'app/lib/entities/models.ts';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


interface User {
    id: string;
    email: string;
    role: string;
}

interface EditUserRoleButtonProps {
    user: User;
    roles: Role[];
    onRoleUpdate?: (userId: string, newRole: string) => void;
}

export default function EditUserRoleButton({ user, roles = [], onRoleUpdate }: EditUserRoleButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSave = async () => {
        if (selectedRole === user.role) {
            setIsModalOpen(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/user-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    roleId: selectedRole,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user role');
            }

            if (onRoleUpdate) {
                onRoleUpdate(user.id, selectedRole);
            }
            
            setIsModalOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setSelectedRole(user.role);
        setError(null);
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-900 transition-colors"
            >
                Edit
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Edit User Role
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                User: <span className="font-medium">{user.email}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Current Role: <span className="font-medium capitalize">{user.role}</span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Select New Role:
                            </label>
                            <select
                                id="role-select"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={isLoading}
                            >
                                {roles.map((role) => (
                                    <option key={role.role_id.toString()} value={role.role_id.toString()}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading || selectedRole === user.role}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}