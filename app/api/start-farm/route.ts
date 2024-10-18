// app/api/start-farm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId } = await req.json();

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { 
                farmStartTime: new Date(),
                farmAmount: 0
            }
        });

        return NextResponse.json({ success: true, farmStartTime: updatedUser.farmStartTime });
    } catch (error) {
        console.error('Error starting farm:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
