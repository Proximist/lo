import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_FARMING_TIME = 60 * 60; // 1 hour in seconds
const POINTS_PER_MINUTE = 30;

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

        const currentTime = new Date();

        if (action === 'start') {
            const updatedUser = await prisma.user.update({
                where: { telegramId },
                data: {
                    isFarming: true,
                    farmStartTime: currentTime,
                    lastFarmTime: currentTime,
                    farmingPoints: 0
                }
            });
            return NextResponse.json({ success: true, user: updatedUser });
        }

        if (action === 'collect' || action === 'logout') {
            if (!user.isFarming || !user.farmStartTime) {
                return NextResponse.json({ error: 'Not farming' }, { status: 400 });
            }

            const farmingDuration = Math.min(
                (currentTime.getTime() - user.farmStartTime.getTime()) / 1000,
                MAX_FARMING_TIME
            );
            const pointsToAdd = Math.floor(farmingDuration / 60) * POINTS_PER_MINUTE;

            const updateData: any = {
                lastLogoutTime: currentTime,
            };

            if (action === 'collect' || farmingDuration >= MAX_FARMING_TIME) {
                updateData.points = { increment: pointsToAdd };
                updateData.fpoints = { increment: pointsToAdd };
                updateData.isFarming = false;
                updateData.farmStartTime = null;
                updateData.farmingPoints = 0;
            } else {
                updateData.farmingPoints = pointsToAdd;
            }

            const updatedUser = await prisma.user.update({
                where: { telegramId },
                data: updateData
            });

            return NextResponse.json({ 
                success: true, 
                pointsAdded: pointsToAdd, 
                user: updatedUser,
                canClaim: farmingDuration >= MAX_FARMING_TIME
            });
        }

        if (action === 'check') {
            if (!user.isFarming || !user.farmStartTime) {
                return NextResponse.json({ error: 'Not farming' }, { status: 400 });
            }

            const farmingDuration = Math.min(
                (currentTime.getTime() - user.farmStartTime.getTime()) / 1000,
                MAX_FARMING_TIME
            );
            const pointsAccumulated = Math.floor(farmingDuration / 60) * POINTS_PER_MINUTE;

            return NextResponse.json({ 
                success: true, 
                pointsAccumulated, 
                canClaim: farmingDuration >= MAX_FARMING_TIME
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error processing farming:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
