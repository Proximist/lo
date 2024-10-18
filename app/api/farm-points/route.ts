// app/api/farm-points/route.ts
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
            const updatedUser = await prisma.user.update({
                where: { telegramId },
                data: {
                    isFarming: true,
                    lastFarmTime: new Date(),
                    farmingPoints: 0
                }
            });
            return NextResponse.json({ success: true, user: updatedUser });
        }

        if (action === 'collect') {
    const currentTime = new Date();
    const lastFarmTime = user.lastFarmTime;
    
    if (!lastFarmTime || !user.isFarming) {
        return NextResponse.json({ error: 'Not farming' }, { status: 400 });
    }

    const timeElapsed = Math.floor((currentTime.getTime() - lastFarmTime.getTime()) / 1000);
    const pointsAccumulated = Math.min(Math.floor(timeElapsed / 2), 30); // Changed from 60 to 30

    if (pointsAccumulated < 30) { // Changed condition to wait for 30 points
        return NextResponse.json({ 
            success: true, 
            pointsAccumulated,
            user: { ...user, farmingPoints: pointsAccumulated }
        });
    }

    const updatedUser = await prisma.user.update({
        where: { telegramId },
        data: {
            points: { increment: 30 }, // Always add 30 points when complete
            fpoints: { increment: 30 },
            farmingPoints: 0,
            lastFarmTime: currentTime,
            isFarming: false
        }
    });

    return NextResponse.json({ 
        success: true, 
        pointsAdded: 30,
        user: updatedUser 
    });
}

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error processing farming:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
