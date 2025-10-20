import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  shortLabel: string;
}

const CompactNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems: NavItem[] = [
    { to: '/', label: t('navigation.home'), icon: '🏠', shortLabel: 'Home' },
    { to: '/trade', label: t('navigation.trade'), icon: '💱', shortLabel: 'Trade' },
    { to: '/create-token', label: t('navigation.create_token'), icon: '🪙', shortLabel: 'Token' },
    { to: '/create-pair', label: t('navigation.create_pair'), icon: '🔗', shortLabel: 'Pair' },
    { to: '/commercial-street', label: t('navigation.commercial_street'), icon: '🏪', shortLabel: 'Street' },
    { to: '/performance', label: t('navigation.performance'), icon: '🏆', shortLabel: 'Rank' },
    { to: '/portfolio', label: t('navigation.portfolio'), icon: '💼', shortLabel: 'Portfolio' },
    { to: '/liquidity', label: t('navigation.liquidity'), icon: '💧', shortLabel: 'Liquidity' },
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <div className="flex space-x-1">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.to}
          className={`group relative flex flex-col items-center px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            isActiveRoute(item.to)
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
          }`}
          title={item.label}
        >
          <span className="text-lg mb-1">{item.icon}</span>
          <span className="hidden sm:block">{item.shortLabel}</span>
          
          {/* 悬浮提示 */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CompactNav;