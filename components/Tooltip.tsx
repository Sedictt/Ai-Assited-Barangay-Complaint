import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  /*dsa*/
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const gap = 8; // gap between trigger and tooltip

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = rect.top - gap;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + gap;
          break;
      }

      setCoords({ top, left });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => updatePosition();
      // Listen to scroll on window (capturing) to handle any scrolling parent
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isVisible]);

  // CSS transform for centering relative to the coordinate
  const getTransform = () => {
    switch (placement) {
      case 'top': return 'translate(-50%, -100%)';
      case 'bottom': return 'translate(-50%, 0)';
      case 'left': return 'translate(-100%, -50%)';
      case 'right': return 'translate(0, -50%)';
      default: return 'translate(-50%, -100%)';
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative flex items-center w-fit h-fit"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="fixed z-[9999] px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl pointer-events-none animate-in fade-in zoom-in duration-200 max-w-[200px] text-center"
          style={{
            top: coords.top,
            left: coords.left,
            transform: getTransform()
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;