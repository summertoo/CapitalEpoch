import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTranslation from './locales/zh/translation.json';
import enTranslation from './locales/en/translation.json';

// 配置i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zhTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'zh', // 回退语言
    interpolation: {
      escapeValue: false // React已经安全处理了
    }
  });

export default i18n;