'use client'

import { useEffect, useState } from 'react'
import { WebApp } from '@twa-dev/types'
import HomeUI from './HomeUI'

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

interface User {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  points: number;
  farmPoints: number;
  claimedButton1: boolean;
  claimedButton2: boolean;
  claimedButton3: boolean;
  farmAmount: number;
  farmStartTime?: Date;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [inviterInfo, setInviterInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [buttonStage1, setButtonStage1] = useState<'check' | 'claim' | 'claimed'>('check')
  const [buttonStage2, setButtonStage2] = useState<'check' | 'claim' | 'claimed'>('check')
  const [buttonStage3, setButtonStage3] = useState<'check' | 'claim' | 'claimed'>('check')
  const [isLoading, setIsLoading] = useState(false)
  const [isFarming, setIsFarming] = useState(false)
  const [farmAmount, setFarmAmount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()

      const initDataUnsafe = tg.initDataUnsafe || {}

      if (initDataUnsafe.user) {
        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...initDataUnsafe.user, start_param: initDataUnsafe.start_param || null })
        })
          .then((res) => res.json())
          .then((data: { error?: string; user: User; inviterInfo: any }) => {
            if (data.error) {
              setError(data.error)
            } else {
              setUser(data.user)
              setInviterInfo(data.inviterInfo)
              setButtonStage1(data.user.claimedButton1 ? 'claimed' : 'check')
              setButtonStage2(data.user.claimedButton2 ? 'claimed' : 'check')
              setButtonStage3(data.user.claimedButton3 ? 'claimed' : 'check')
              setFarmAmount(data.user.farmAmount)
              setIsFarming(!!data.user.farmStartTime)
              if (data.user.farmStartTime) {
                startFarming(new Date(data.user.farmStartTime), data.user.farmAmount)
              }
            }
          })
          .catch(() => {
            setError('Failed to fetch user data')
          })
      } else {
        setError('No user data available')
      }
    } else {
      setError('This app should be opened in Telegram')
    }
  }, [])

  const handleIncreasePoints = async (pointsToAdd: number, buttonId: string) => {
    if (!user) return

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId, pointsToAdd, buttonId }),
      })
      const data: { success: boolean; points: number } = await res.json()
      if (data.success) {
        setUser(prev => prev ? { ...prev, points: data.points } : null)
        setNotification(`Points increased successfully! (+${pointsToAdd})`)
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError('Failed to increase points')
      }
    } catch {
      setError('An error occurred while increasing points')
    }
  }

  const startFarming = (startTime: Date, initialFarmAmount: number) => {
    let localFarmAmount = initialFarmAmount;
    const interval = setInterval(async () => {
      const now = new Date()
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const expectedFarmAmount = Math.min(Math.floor(elapsedSeconds / 2) * 1, 60) // 1 PD per 2 seconds, max 60
      const pointsToAdd = expectedFarmAmount - localFarmAmount

      if (pointsToAdd > 0) {
        try {
          const res = await fetch('/api/farm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ telegramId: user?.telegramId, pointsToAdd }),
          })
          const data: { success: boolean; points: number; farmPoints: number; farmAmount: number; isFarming: boolean } = await res.json()
          if (data.success) {
            setUser(prev => prev ? { ...prev, points: data.points, farmPoints: data.farmPoints } : null)
            setFarmAmount(data.farmAmount)
            setIsFarming(data.isFarming)
            localFarmAmount = data.farmAmount
            if (!data.isFarming) {
              clearInterval(interval)
            }
          }
        } catch (error) {
          console.error('Error while farming:', error)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }

  const handleFarmClick = async () => {
    if (isFarming) return

    try {
      const res = await fetch('/api/start-farm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user?.telegramId }),
      })
      const data: { success: boolean; farmStartTime: string } = await res.json()
      if (data.success) {
        setIsFarming(true)
        setFarmAmount(0)
        startFarming(new Date(data.farmStartTime), 0)
      }
    } catch (error) {
      console.error('Error starting farm:', error)
    }
  }

  const handleButtonClick1 = () => {
    if (buttonStage1 === 'check') {
      window.open('https://youtu.be/xvFZjo5PgG0', '_blank')
      setButtonStage1('claim')
    }
  }

  const handleButtonClick2 = () => {
    if (buttonStage2 === 'check') {
      window.open('https://twitter.com', '_blank')
      setButtonStage2('claim')
    }
  }

  const handleButtonClick3 = () => {
    if (buttonStage3 === 'check') {
      window.open('https://telegram.org', '_blank')
      setButtonStage3('claim')
    }
  }

  const handleClaim1 = () => {
    if (buttonStage1 === 'claim') {
      setIsLoading(true)
      handleIncreasePoints(5, 'button1')
      setTimeout(() => {
        setButtonStage1('claimed')
        setIsLoading(false)
      }, 3000)
    }
  }

  const handleClaim2 = () => {
    if (buttonStage2 === 'claim') {
      handleIncreasePoints(3, 'button2')
      setButtonStage2('claimed')
    }
  }

  const handleClaim3 = () => {
    if (buttonStage3 === 'claim') {
      handleIncreasePoints(9, 'button3')
      setButtonStage3('claimed')
    }
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!user) return <div className="container mx-auto p-4">Loading...</div>

  return (
    <HomeUI 
      user={user}
      buttonStage1={buttonStage1}
      buttonStage2={buttonStage2}
      buttonStage3={buttonStage3}
      isLoading={isLoading}
      notification={notification}
      handleButtonClick1={handleButtonClick1}
      handleButtonClick2={handleButtonClick2}
      handleButtonClick3={handleButtonClick3}
      handleClaim1={handleClaim1}
      handleClaim2={handleClaim2}
      handleClaim3={handleClaim3}
      isFarming={isFarming}
      farmAmount={farmAmount}
      handleFarmClick={handleFarmClick}
    />
  )
}
