import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const user = authenticateUser(email, password);
        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        if (user.status === 'suspended') {
            return NextResponse.json({ error: 'Account suspended. Contact support.' }, { status: 403 });
        }

        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
