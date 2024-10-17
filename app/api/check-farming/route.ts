import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId } = await req.json();

        const user = await prisma.user.findUnique({
            where: { telegramId },
            select: {
                farmStartTime: true,
                farmAmount: true
            }
        });

        if (user?.farmStartTime) {
            return NextResponse.json({ 
                farming: true,
                farmStartTime: user.farmStartTime,
                farmAmount: user.farmAmount || 0
            });
        }

        return NextResponse.json({ farming: false });
    } catch (error) {
        console.error('Error checking farming status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
