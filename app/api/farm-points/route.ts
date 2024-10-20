import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { telegramId, action } = await req.json();

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { telegramId }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (action === 'start') {
            const currentTime = new Date();
            const updatedUser = await prisma.user.update({
                where: { telegramId },
                data: {
                    isFarming: true,
                    farmStartTime: currentTime,
                    farmingPoints: 0
                }
            });
            return NextResponse.json({ success: true, user: updatedUser });
        }

        if (action === 'collect') {
            const currentTime = new Date();
            const farmStartTime = user.farmStartTime;
            
            if (!farmStartTime || !user.isFarming) {
                return NextResponse.json({ error: 'Not farming' }, { status: 400 });
            }

            const timeElapsed = Math.floor((currentTime.getTime() - farmStartTime.getTime()) / 1000);
            const pointsToAdd = Math.min(Math.floor(timeElapsed / 2), 60);

            const updatedUser = await prisma.user.update({
                where: { telegramId },
                data: {
                    points: { increment: pointsToAdd },
                    farmingPoints: { increment: pointsToAdd },
                    isFarming: pointsToAdd < 60,
                    farmStartTime: pointsToAdd < 60 ? farmStartTime : null
                }
            });

            return NextResponse.json({ 
                success: true, 
                pointsAdded: pointsToAdd, 
                user: updatedUser 
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error processing farming:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
