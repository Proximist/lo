// app/api/farm-points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId, action } = await req.json();

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 });
        }

        if (action === 'start') {
            const user = await prisma.user.update({
                where: { telegramId },
                data: { 
                    farmStartTime: new Date(),
                    isFarming: true,
                    farmAmount: 0
                }
            });
            return NextResponse.json({ success: true, user });
        } 
        else if (action === 'collect') {
            const user = await prisma.user.findUnique({
                where: { telegramId }
            });

            if (!user?.farmStartTime || !user.isFarming) {
                return NextResponse.json({ error: 'Not farming' }, { status: 400 });
            }

            const farmingDuration = Math.floor((Date.now() - user.farmStartTime.getTime()) / 1000);
            const earnedPoints = Math.min(Math.floor(farmingDuration * 0.5), 60); // 0.5 points per second, max 60

            const updatedUser = await prisma.user.update({
                where: { telegramId },
                data: {
                    farmPoints: { increment: earnedPoints },
                    points: { increment: earnedPoints },
                    farmAmount: earnedPoints,
                    isFarming: earnedPoints >= 60 ? false : true,
                    farmStartTime: earnedPoints >= 60 ? null : user.farmStartTime
                }
            });

            return NextResponse.json({ 
                success: true, 
                points: updatedUser.points,
                farmPoints: updatedUser.farmPoints,
                farmAmount: updatedUser.farmAmount,
                isFarming: updatedUser.isFarming
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error processing farm points:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
