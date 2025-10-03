import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLanguage);
    // 保存语言选择到本地存储
    localStorage.setItem('language', newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="ml-4 px-3 py-1 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 transition-colors"
    >
      {i18n.language === 'zh' ? 'English' : '中文'}
    </button>
  );
};

export default LanguageSwitcher;