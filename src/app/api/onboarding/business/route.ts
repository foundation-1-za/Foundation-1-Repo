import { NextResponse } from 'next/server';
import { registerBusinessUser } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.email || !body.businessName || !body.registrationNumber || !body.physicalAddress) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = registerBusinessUser(body);

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        // Simulate email notification
        console.log(`[EMAIL] Business Application received for ${body.businessName}`);
        if (body.salesRepRef) {
            console.log(`[REF] Referred by sales rep: ${body.salesRepRef}`);
        }

        // Simulate sending credentials
        console.log(`[EMAIL] Credentials sent to ${body.email}`);

        return NextResponse.json({ success: true, user: result });
    } catch (error) {
        console.error('Business onboarding error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
