import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppMode = 'essential' | 'advanced';

interface AppModeContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('oms_app_mode');
    return saved === 'advanced' ? 'advanced' : 'essential';
  });

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    localStorage.setItem('oms_app_mode', mode);
  };

  const toggleAppMode = () => {
    const nextMode = appMode === 'essential' ? 'advanced' : 'essential';
    setAppMode(nextMode);
  };

  return (
    <AppModeContext.Provider value={{ appMode, setAppMode, toggleAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
