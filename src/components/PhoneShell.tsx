import React from 'react';

interface PhoneShellProps {
  children: React.ReactNode;
  screenTitle?: string;
  onHomeClick?: () => void;
}

export default function PhoneShell({ children }: PhoneShellProps) {
  // Get current time or mock time
  const [timeStr, setTimeStr] = React.useState('12:00');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto flex flex-col items-center">
      {/* Outer Phone Shell */}
      <div 
        className="relative w-[375px] h-[780px] bg-neutral-900 rounded-[52px] p-3.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-neutral-800 flex flex-col overflow-hidden select-none"
        id="phone-device-frame"
      >
        {/* Speaker & Sensor Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-neutral-900 rounded-b-2xl z-50 flex items-center justify-center">
          {/* Speaker grill */}
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1"></div>
          {/* Camera lens */}
          <div className="w-2.5 h-2.5 bg-neutral-950 rounded-full ml-2 mb-1 border border-neutral-850"></div>
        </div>

        {/* Outer Volume Buttons */}
        <div className="absolute left-[-3px] top-28 w-[3px] h-14 bg-neutral-700 rounded-l-md"></div>
        <div className="absolute left-[-3px] top-48 w-[3px] h-14 bg-neutral-700 rounded-l-md"></div>
        {/* Power Button */}
        <div className="absolute right-[-3px] top-36 w-[3px] h-20 bg-neutral-700 rounded-r-md"></div>

        {/* Inner Screen */}
        <div className="relative w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col select-none">
          
          {/* Status Bar */}
          <div className="h-11 px-6 pt-3 flex justify-between items-center bg-[#3db5d7] text-white font-sans text-xs font-semibold z-40 transition-colors duration-300">
            {/* Time */}
            <span className="text-[11px] font-medium tracking-wide">{timeStr.split(' ')[0]}</span>
            
            {/* Right Status Icons */}
            <div className="flex items-center space-x-1.5">
              {/* Cellular Signal Strength (dots) */}
              <div className="flex items-end space-x-0.5 h-2.5">
                <span className="w-[3px] h-[4px] bg-white rounded-full"></span>
                <span className="w-[3px] h-[6px] bg-white rounded-full"></span>
                <span className="w-[3px] h-[8px] bg-white rounded-full"></span>
                <span className="w-[3px] h-[10px] bg-white rounded-full"></span>
              </div>
              
              {/* WiFi Icon (simulated) */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21l-12-12c4.4-4.4 11.6-4.4 16 0l-4 4c-2.2-2.2-5.8-2.2-8 0l8 8zm0-18c-6.6 0-12 5.4-12 12h3c0-5 4-9 9-9s9 4 9 9h3c0-6.6-5.4-12-12-12z" opacity="0.3" />
                <path d="M12 21l-6-6c3.3-3.3 8.7-3.3 12 0l-6 6z" />
              </svg>

              {/* Battery */}
              <div className="flex items-center space-x-0.5 border border-white/80 rounded px-0.5 py-0.2">
                <span className="w-4 h-2.5 bg-white rounded-sm flex justify-start items-center p-0.5">
                  <span className="w-2.5 h-1.5 bg-cyan-500 rounded-2xs"></span>
                </span>
                <span className="w-0.5 h-1 bg-white/80 rounded-r-sm"></span>
              </div>
            </div>
          </div>

          {/* Actual Screen Content */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-white">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="h-5 flex items-center justify-center bg-white pb-1.5 z-40">
            <div className="w-28 h-1 bg-neutral-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
