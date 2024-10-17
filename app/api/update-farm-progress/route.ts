import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId, farmAmount } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { 
                farmAmount: farmAmount
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating farm progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
