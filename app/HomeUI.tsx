import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toggleUpdateText } from './utils';
import './HomeUI.css';

interface HomeUIProps {
  user: any;
  buttonStage1: 'check' | 'claim' | 'claimed';
  buttonStage2: 'check' | 'claim' | 'claimed';
  buttonStage3: 'check' | 'claim' | 'claimed';
  isLoading: boolean;
  notification: string;
  handleButtonClick1: () => void;
  handleButtonClick2: () => void;
  handleButtonClick3: () => void;
  handleClaim1: () => void;
  handleClaim2: () => void;
  handleClaim3: () => void;
}

export default function HomeUI({
  user,
  buttonStage1,
  buttonStage2,
  buttonStage3,
  isLoading,
  notification,
  handleButtonClick1,
  handleButtonClick2,
  handleButtonClick3,
  handleClaim1,
  handleClaim2,
  handleClaim3,
}: HomeUIProps) {
  const [farming, setFarming] = useState(false);
  const [farmAmount, setFarmAmount] = useState(0);
  const [farmTimer, setFarmTimer] = useState(0);
  const [totalPoints, setTotalPoints] = useState(user.points);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);
    toggleUpdateText();
  }, []);

  useEffect(() => {
    setTotalPoints(user.points);
  }, [user.points]);

  useEffect(() => {
    const checkFarmingStatus = async () => {
      try {
        const res = await fetch('/api/check-farming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: user.telegramId }),
        });
        const data = await res.json();
        
        if (data.farming) {
          const elapsedTime = Math.floor((Date.now() - new Date(data.farmStartTime).getTime()) / 1000);
          if (elapsedTime < 60) {
            setFarming(true);
            setFarmTimer(60 - elapsedTime);
            setFarmAmount(data.farmAmount);
            startFarming(60 - elapsedTime, data.farmAmount);
          } else {
            // If more than 60 seconds have passed, end the farming session
            await fetch('/api/end-farming', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ telegramId: user.telegramId }),
            });
          }
        }
      } catch (error) {
        console.error('Error checking farming status:', error);
      }
    };
    
    checkFarmingStatus();
  }, [user.telegramId]);

  const updateFarmProgress = async (amount: number) => {
    try {
      await fetch('/api/update-farm-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          telegramId: user.telegramId, 
          farmAmount: amount 
        }),
      });
    } catch (error) {
      console.error('Error updating farm progress:', error);
    }
  };

  const startFarming = async (duration = 60, initialAmount = 0) => {
    if (farming) return;
    
    setFarming(true);
    setFarmTimer(duration);
    setFarmAmount(initialAmount);

    try {
      if (initialAmount === 0) {
        await fetch('/api/start-farming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: user.telegramId }),
        });
      }

      let localAmount = initialAmount;
      let timeElapsed = 60 - duration;

      const farmInterval = setInterval(async () => {
        timeElapsed += 1;
        
        if (timeElapsed % 10 === 0) {
          localAmount += 5;
          setFarmAmount(localAmount);
          
          // Update both points and farm progress
          try {
            const [pointsRes] = await Promise.all([
              fetch('/api/increase-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  telegramId: user.telegramId, 
                  pointsToAdd: 5, 
                  buttonId: 'farm' 
                }),
              }),
              updateFarmProgress(localAmount)
            ]);

            const pointsData = await pointsRes.json();
            if (pointsData.success) {
              setTotalPoints(pointsData.points);
            }
          } catch (error) {
            console.error('Error updating points:', error);
          }
        }

        setFarmTimer(duration - (timeElapsed - (60 - duration)));

        if (timeElapsed >= 60) {
          clearInterval(farmInterval);
          setFarming(false);
          setFarmTimer(0);
          
          await fetch('/api/end-farming', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: user.telegramId }),
          });
        }
      }, 1000);

      return () => clearInterval(farmInterval);
    } catch (error) {
      console.error('Error during farming:', error);
      setFarming(false);
    }
  };

  return (
    <div className="home-container">
      <div className="header-container">
        <div className="dog-image-container">
          <img
            alt="Animated style dog image"
            className="dog-image"
            src="https://storage.googleapis.com/a1aa/image/YlpvEfbklKRiDi8LX5Rww5U3zZZwHEUfju1qUNknpEZ6e2OnA.jpg"
          />
        </div>
        <p id="pixelDogsCount" className="pixel-dogs-count">
          {totalPoints} PixelDogs
        </p>
        <p id="updateText" className="update-text fade fade-in">
          Exciting updates are on the way:)
        </p>
        <div className="tasks-container">
          <button className="tasks-button">Daily Tasks..!</button>
          <div className="social-container">
            <p className="social-text">Follow Our Youtube!</p>
            <button
              onClick={() => {
                if (buttonStage1 === 'check') {
                  handleButtonClick1();
                } else if (buttonStage1 === 'claim') {
                  handleClaim1();
                }
              }}
              disabled={buttonStage1 === 'claimed' || isLoading}
              className={`claim-button ${
                buttonStage1 === 'claimed' || isLoading ? 'disabled' : ''
              }`}
            >
              {isLoading ? 'Claiming...' : buttonStage1 === 'check' ? 'Check' : buttonStage1 === 'claim' ? 'Claim' : 'Claimed'}
            </button>
          </div>
          <div className="social-container">
            <p className="social-text">Follow Our Twitter!</p>
            <button
              onClick={() => {
                handleButtonClick2();
                handleClaim2();
              }}
              disabled={buttonStage2 === 'claimed'}
              className="claim-button"
            >
              {buttonStage2 === 'check' ? 'Check' : buttonStage2 === 'claim' ? 'Claim' : 'Claimed'}
            </button>
          </div>
          <div className="social-container">
            <p className="social-text">Join Our Telegram!</p>
            <button
              onClick={() => {
                handleButtonClick3();
                handleClaim3();
              }}
              disabled={buttonStage3 === 'claimed'}
              className="claim-button"
            >
              {buttonStage3 === 'check' ? 'Check' : buttonStage3 === 'claim' ? 'Claim' : 'Claimed'}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-grow"></div>
      <button 
        className="farm-button"
        onClick={() => !farming && startFarming()}
        disabled={farming}
      >
        {farming 
          ? `Farming... ${farmAmount} PD (${farmTimer}s)`
          : 'Farm PixelDogs...'}
      </button>
      <div className="footer-container">
        <Link href="/">
          <a className="flex flex-col items-center text-gray-800">
            <i className="fas fa-home text-2xl"></i>
            <p className="text-sm">Home</p>
          </a>
        </Link>
        <Link href="/invite">
          <a className="flex flex-col items-center text-gray-800">
            <i className="fas fa-users text-2xl"></i>
            <p className="text-sm">Friends</p>
          </a>
        </Link>
        <Link href="/wallet">
          <a className="flex flex-col items-center text-gray-800">
            <i className="fas fa-wallet text-2xl"></i>
            <p className="text-sm">Wallet</p>
          </a>
        </Link>
      </div>
    </div>
  );
}
