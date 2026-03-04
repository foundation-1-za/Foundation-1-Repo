import { NextResponse } from 'next/server';
import { registerSalesRep } from '@/lib/store';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.email || !body.firstName || !body.lastName || !body.phone || !body.idNumber || !body.homeAddress) {
            return NextResponse.json(
                { error: 'Missing required fields. ID Number and Home Address are required for contract generation.' },
                { status: 400 }
            );
        }

        const result = registerSalesRep(body);

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        // Simulate email notification
        console.log(`[EMAIL] Sales Rep Application received for ${body.email}`);
        console.log(`[REF] Reference Code: ${result.referenceCode}`);
        console.log(`[REF] Referral Link: ${result.referralLink}`);

        return NextResponse.json({ success: true, user: result });
    } catch (error) {
        console.error('Sales Rep onboarding error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
