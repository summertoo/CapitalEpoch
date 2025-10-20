import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  label: string;
  icon?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const GroupedNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const navGroups: NavGroup[] = [
    {
      title: t('navigation.groups.trading'),
      items: [
        { to: '/', label: t('navigation.home'), icon: '🏠' },
        { to: '/trade', label: t('navigation.trade'), icon: '💱' },
        { to: '/liquidity', label: t('navigation.liquidity'), icon: '💧' },
        { to: '/history', label: t('navigation.trade_history'), icon: '📊' },
      ]
    },
    {
      title: t('navigation.groups.create'),
      items: [
        { to: '/create-token', label: t('navigation.create_token'), icon: '🪙' },
        { to: '/my-creations', label: t('navigation.my_creations'), icon: '💼' },
        { to: '/create-pair', label: t('navigation.create_pair'), icon: '🔗' },
        { to: '/create-facility', label: t('navigation.create_facility'), icon: '🏗️' },
      ]
    },
    {
      title: t('navigation.groups.gamefi'),
      items: [
        { to: '/commercial-street', label: t('navigation.commercial_street'), icon: '🏪' },
        { to: '/performance', label: t('navigation.performance'), icon: '🏆' },
        { to: '/portfolio', label: t('navigation.portfolio'), icon: '💼' },
      ]
    },
    {
      title: t('navigation.groups.tools'),
      items: [
        { to: '/tokenomics', label: t('navigation.tokenomics'), icon: '📈' },
      ]
    }
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  const handleMouseEnter = (groupTitle: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setActiveGroup(groupTitle);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveGroup(null);
    }, 150); // 150ms延迟，给用户时间移动到下拉菜单
    setHoverTimeout(timeout);
  };

  const handleDropdownEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
  };

  const handleDropdownLeave = () => {
    setActiveGroup(null);
  };

  const handleClick = (groupTitle: string) => {
    setActiveGroup(activeGroup === groupTitle ? null : groupTitle);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className="flex space-x-1">
      {navGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="relative"
          onMouseEnter={() => handleMouseEnter(group.title)}
          onMouseLeave={handleMouseLeave}
        >
          {/* 分组标题 */}
          <button 
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeGroup === group.title 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={() => handleClick(group.title)}
          >
            {group.title}
            <svg 
              className={`ml-1 h-4 w-4 inline transition-transform ${
                activeGroup === group.title ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉菜单 */}
          {activeGroup === group.title && (
            <div 
              className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="py-1">
                {group.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    to={item.to}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActiveRoute(item.to)
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    onClick={() => setActiveGroup(null)}
                  >
                    <span className="mr-3 text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedNav;