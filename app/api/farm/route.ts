// app/api/farm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId, pointsToAdd } = await req.json();

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { 
                points: { increment: pointsToAdd },
                farmAmount: { increment: pointsToAdd }
            }
        });

        if (updatedUser.farmAmount >= 60) {
            await prisma.user.update({
                where: { telegramId },
                data: { 
                    farmStartTime: null,
                    farmAmount: 60
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            points: updatedUser.points,
            farmAmount: updatedUser.farmAmount
        });
    } catch (error) {
        console.error('Error farming:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
