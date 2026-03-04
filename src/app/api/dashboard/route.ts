import { NextRequest, NextResponse } from 'next/server';
import { getLeadsForUser, getDashboardMetrics } from '@/lib/store';

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'userId required.' }, { status: 400 });
    }

    const leads = getLeadsForUser(userId);
    const metrics = getDashboardMetrics(userId);

    return NextResponse.json({ leads, metrics });
}
