import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (sessionClaims?.metadata as any)?.role;
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // TODO: Switch to Drizzle/Neon query
        return NextResponse.json({ clients: [] });
    } catch (error) {
        console.error('Admin Clients API error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
