import { NextRequest, NextResponse } from 'next/server';
import { submitLead, getLeadsForUser, getAllLeads } from '@/lib/store';
import { getUserById } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const {
            submittedBy,
            businessName,
            registrationNumber,
            physicalAddress,
            contactName,
            contactRole,
            contactPhone,
            contactEmail,
            utilityBillFileName,
            confirmedInterest,
        } = data;

        if (
            !submittedBy ||
            !businessName ||
            !registrationNumber ||
            !physicalAddress ||
            !contactName ||
            !contactRole ||
            !contactPhone ||
            !contactEmail ||
            !confirmedInterest
        ) {
            return NextResponse.json({ error: 'All required fields must be completed.' }, { status: 400 });
        }

        const lead = submitLead({
            submittedBy,
            businessName,
            registrationNumber,
            physicalAddress,
            contactName,
            contactRole,
            contactPhone,
            contactEmail,
            utilityBillFileName,
            confirmedInterest,
        });

        return NextResponse.json({ lead }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    const salesRepId = request.nextUrl.searchParams.get('salesRepId');
    
    // If userId is provided, get leads for that specific user (business owner)
    if (userId) {
        const leads = getLeadsForUser(userId);
        return NextResponse.json({ leads });
    }
    
    // If salesRepId is provided, get leads submitted by that sales rep
    if (salesRepId) {
        const leads = getLeadsForUser(salesRepId);
        return NextResponse.json({ leads });
    }
    
    return NextResponse.json({ error: 'userId or salesRepId required.' }, { status: 400 });
}
