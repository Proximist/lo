import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { 
                farmStartTime: new Date(),
                farmAmount: 0
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error starting farming:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
