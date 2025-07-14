import { supabaseAdmin } from 'app/lib/supabaseService';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('User ID is required', { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error('Supabase auth error:', error);
    return new Response(error.message, { status: 500 });
  }

  return new Response('Auth user deleted successfully', { status: 200 });
}