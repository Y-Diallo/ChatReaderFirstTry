import { useRef, useState, useEffect } from "react";
import { useTimer } from 'react-timer-hook';
interface TimerProps{
  currentTime: Date,
  restartTime : any,
  pauseTime: any,
  resumeTime: any
}
function Timer({currentTime, restartTime, pauseTime, resumeTime}:TimerProps) {
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({autoStart: true, expiryTimestamp: currentTime, onExpire: () => console.warn('onExpire called') });
  restartTime = restart;
  pauseTime = pause;
  resumeTime = resume;
  return (
  <>
  {minutes}:{seconds < 10 ? "0"+seconds:seconds}
  </> );
}

export default Timer;