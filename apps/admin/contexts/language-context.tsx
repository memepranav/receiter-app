'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ar'
type Direction = 'ltr' | 'rtl'

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Header
    'reciters_admin': 'Reciters Admin',
    'home': 'Home',
    'users': 'Users',
    'analytics': 'Analytics',
    'rewards': 'Rewards',
    'content': 'Content',
    'reports': 'Reports',
    'settings': 'Settings',
    'admin': 'Admin',
    
    // Dashboard
    'welcome_admin': 'Welcome, Admin User',
    'last_logged': 'Last logged in at 09:45 AM',
    'user_management': 'User Management',
    'manage_users': 'Manage registered users',
    'analytics_dashboard': 'Analytics Dashboard',
    'view_statistics': 'View detailed statistics',
    'rewards_processing': 'Rewards Processing',
    'process_rewards': 'Process pending rewards',
    'view_users': 'View Users',
    'view_analytics': 'View Analytics',
    'process_now': 'Process Now',
    'add_user': 'Add User',
    'search_users': 'Search Users',
    'quick_actions': 'Quick Actions',
    'user_statistics': 'User Statistics',
    'recent_transactions': 'Recent Transactions',
    'content_summary': 'Content Summary',
    'achievement_reports': 'Achievement Reports',
    'system_settings': 'System Settings',
    'add_edit_links': 'Add & Edit Links',
    'show_statistics': 'Show Statistics',
    'filter_by': 'Filter by:',
    'all_users': 'All Users',
    'search_users_by_name': 'Search users by name or email',
    'select_status': 'Select status',
    '2543_users': '2,543 Users',
    '89_active': '89% Active',
    '456_pending': '456 Pending',
    
    // User Management
    'user_management_title': 'User Management',
    'manage_monitor_users': 'Manage and monitor all Quran Reciter app users',
    'total_users': 'Total Users',
    'active_users': 'Active Users',
    'total_points': 'Total Points',
    'from_last_month': 'from last month',
    'search_users_section': 'Search Users',
    'filter': 'Filter',
    'export': 'Export',
    'add_new_user': 'Add New User',
    'search': 'Search',
    'search_by_name': 'Search by name or email...',
    'status': 'Status',
    'all_status': 'All Status',
    'country': 'Country',
    'all_countries': 'All Countries',
    'action': 'Action',
    'users_list': 'Users List',
    'total': 'total',
    'showing': 'Showing',
    'of': 'of',
    'user': 'User',
    'contact': 'Contact',
    'progress': 'Progress',
    'points': 'Points',
    'join_date': 'Join Date',
    'actions': 'Actions',
    'juz': 'Juz',
    'active': 'Active',
    'inactive': 'Inactive',
    'suspended': 'Suspended',
  },
  ar: {
    // Header
    'reciters_admin': 'إدارة القراء',
    'home': 'الرئيسية',
    'users': 'المستخدمون',
    'analytics': 'التحليلات',
    'rewards': 'المكافآت',
    'content': 'المحتوى',
    'reports': 'التقارير',
    'settings': 'الإعدادات',
    'admin': 'المدير',
    
    // Dashboard
    'welcome_admin': 'مرحباً، المستخدم المدير',
    'last_logged': 'آخر تسجيل دخول في 09:45 صباحاً',
    'user_management': 'إدارة المستخدمين',
    'manage_users': 'إدارة المستخدمين المسجلين',
    'analytics_dashboard': 'لوحة التحليلات',
    'view_statistics': 'عرض الإحصائيات التفصيلية',
    'rewards_processing': 'معالجة المكافآت',
    'process_rewards': 'معالجة المكافآت المعلقة',
    'view_users': 'عرض المستخدمين',
    'view_analytics': 'عرض التحليلات',
    'process_now': 'معالجة الآن',
    'add_user': 'إضافة مستخدم',
    'search_users': 'البحث عن المستخدمين',
    'quick_actions': 'الإجراءات السريعة',
    'user_statistics': 'إحصائيات المستخدمين',
    'recent_transactions': 'المعاملات الأخيرة',
    'content_summary': 'ملخص المحتوى',
    'achievement_reports': 'تقارير الإنجازات',
    'system_settings': 'إعدادات النظام',
    'add_edit_links': 'إضافة وتعديل الروابط',
    'show_statistics': 'عرض الإحصائيات',
    'filter_by': 'تصفية حسب:',
    'all_users': 'جميع المستخدمين',
    'search_users_by_name': 'البحث عن المستخدمين بالاسم أو البريد الإلكتروني',
    'select_status': 'اختيار الحالة',
    '2543_users': '2,543 مستخدم',
    '89_active': '89% نشط',
    '456_pending': '456 معلقة',
    
    // User Management
    'user_management_title': 'إدارة المستخدمين',
    'manage_monitor_users': 'إدارة ومراقبة جميع مستخدمي تطبيق قارئ القرآن',
    'total_users': 'إجمالي المستخدمين',
    'active_users': 'المستخدمون النشطون',
    'total_points': 'إجمالي النقاط',
    'from_last_month': 'من الشهر الماضي',
    'search_users_section': 'البحث عن المستخدمين',
    'filter': 'تصفية',
    'export': 'تصدير',
    'add_new_user': 'إضافة مستخدم جديد',
    'search': 'بحث',
    'search_by_name': 'البحث بالاسم أو البريد الإلكتروني...',
    'status': 'الحالة',
    'all_status': 'جميع الحالات',
    'country': 'البلد',
    'all_countries': 'جميع البلدان',
    'action': 'إجراء',
    'users_list': 'قائمة المستخدمين',
    'total': 'إجمالي',
    'showing': 'عرض',
    'of': 'من',
    'user': 'المستخدم',
    'contact': 'الاتصال',
    'progress': 'التقدم',
    'points': 'النقاط',
    'join_date': 'تاريخ الانضمام',
    'actions': 'الإجراءات',
    'juz': 'جزء',
    'active': 'نشط',
    'inactive': 'غير نشط',
    'suspended': 'معلق',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr'

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    
    // Update document direction and lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage)
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = savedLanguage
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}