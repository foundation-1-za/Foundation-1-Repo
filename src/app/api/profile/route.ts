import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/lib/store';

export async function PATCH(request: NextRequest) {
    try {
        const { id, ...updates } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
        }
        const user = updateUser(id, updates);
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
