import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { email, password, firstName, lastName, phone } = data;

        if (!email || !password || !firstName || !lastName || !phone) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        const result = registerUser({ email, password, firstName, lastName, phone });

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 409 });
        }

        return NextResponse.json({ user: result }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
