

import { NextResponse } from 'next/server';
import { supabaseAdmin } from 'app/lib/supabaseService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, roleId } = body;

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'Missing userId or roleId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('user_roles')
      .update({ role_id: roleId })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}