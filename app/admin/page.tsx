import EditUserRoleButton from './EditUserRoleButton';
import { Role } from 'app/lib/entities/models.ts';
import { supabaseAdmin } from 'app/lib/supabaseService';
import { mapRowToRole } from 'app/lib/entities/mappings';
import DeleteUserButton from './DeleteUserButton';

interface User {
    id: string;
    email: string;
    role: string;
}

async function fetchUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
        .from('users_with_roles')
        .select('*')

    if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
    }

    const usersWithRoles = (data || []).map((user: any) => ({
        id: user.id || null,
        email: user.email || null,
        role_id: user.role_id || null,
        role: user.role || null
    }))

    return usersWithRoles;
}

async function fetchUserRoles(): Promise<Role[]> {
    const { data, error } = await supabaseAdmin
        .from('roles')
        .select('*')

    if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
    }

    const roles: Role[] = (data || []).map((row: any) => mapRowToRole(row));

    return roles;
}

export default async function AdminDashboard() {
    const users = await fetchUsers();
    const roles = await fetchUserRoles();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl text-slate-700 font-bold mb-6">Admin Dashboard</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <EditUserRoleButton user={user} roles={roles} />
                                    <DeleteUserButton userId={user.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}