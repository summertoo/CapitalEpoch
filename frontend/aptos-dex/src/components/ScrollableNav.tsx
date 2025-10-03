import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  label: string;
}

const ScrollableNav: React.FC = () => {
  const { t } = useTranslation();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);

  // 导航项数据
  const navItems: NavItem[] = [
    { to: '/', label: t('navigation.home') },
    { to: '/trade', label: t('navigation.trade') },
    { to: '/create-token', label: t('navigation.create_token') },
    { to: '/create-pair', label: t('navigation.create_pair') },
    { to: '/portfolio', label: t('navigation.portfolio') },
    { to: '/commercial-street', label: t('navigation.commercial_street') },
    { to: '/performance', label: t('navigation.performance') },
    { to: '/create-facility', label: t('navigation.create_facility') },
    { to: '/history', label: t('navigation.trade_history') },
    { to: '/tokenomics', label: t('navigation.tokenomics') },
    { to: '/liquidity', label: t('navigation.liquidity') },
    // { to: '/lp-calculator', label: t('navigation.lp_calculator') },
    // { to: '/price-simulator', label: t('navigation.price_simulator') },
    // { to: '/mev-demo', label: t('navigation.mev_demo') },
    // { to: '/aptos-mev', label: t('navigation.aptos_mev') },
  ];

  // 检查是否需要显示箭头
  const checkArrows = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      // 添加一个像素的容差以避免浮点数比较问题
      const tolerance = 1;
      setShowLeftArrow(scrollLeft > tolerance);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - tolerance);
    }
  };

  // 滚动处理
  const scroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 监听滚动事件
  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('scroll', checkArrows);
      // 初始检查
      setTimeout(checkArrows, 100);
      return () => navElement.removeEventListener('scroll', checkArrows);
    }
  }, []);

  // 窗口大小改变时重新检查箭头
  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkArrows, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 检查容器是否需要滚动
  useEffect(() => {
    const checkIfScrollNeeded = () => {
      if (navRef.current) {
        const { scrollWidth, clientWidth } = navRef.current;
        const needsScroll = scrollWidth > clientWidth;
        if (!needsScroll) {
          setShowLeftArrow(false);
          setShowRightArrow(false);
        } else {
          checkArrows();
        }
      }
    };

    // 初始检查
    setTimeout(checkIfScrollNeeded, 100);
    
    // 窗口大小改变时检查
    const handleResize = () => {
      setTimeout(checkIfScrollNeeded, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative">
      {/* 左箭头 */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 shadow-md transition-opacity duration-300 ${
          showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="向左滚动"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* 导航链接容器 */}
      <div
        ref={navRef}
        className="ml-10 flex space-x-4 overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className="text-gray-700 hover:text-blue-600 whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* 右箭头 */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 shadow-md transition-opacity duration-300 ${
          showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="向右滚动"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* 隐藏滚动条样式 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};

export default ScrollableNav;
