
import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ParametersCalculatorPage from './pages/ParametersCalculatorPage';
import ExposureCalculatorPage from './pages/ExposureCalculatorPage';
import ActivityCalculatorPage from './pages/ActivityCalculatorPage';
import GeometricUnsharpnessCalculatorPage from './pages/GeometricUnsharpnessCalculatorPage';
import AboutPage from './pages/AboutPage';

const Header = () => {
  const location = useLocation();

  const navLinkClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300";
  const activeLinkClasses = "bg-blue-600 text-white";
  const inactiveLinkClasses = "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";

  const getLinkClass = (path: string) => {
    return `${navLinkClasses} ${location.pathname === path ? activeLinkClasses : inactiveLinkClasses}`;
  };

  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-sm rounded-xl sticky top-4 z-50 mx-auto max-w-7xl px-4">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            РК
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Калькулятор РК</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Инструменты для радиографического контроля</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={getLinkClass('/')}>Главная</NavLink>
          <NavLink to="/parameters" className={getLinkClass('/parameters')}>Параметры РК</NavLink>
          <NavLink to="/exposure" className={getLinkClass('/exposure')}>Время экспозиции</NavLink>
          <NavLink to="/activity" className={getLinkClass('/activity')}>Активность источника</NavLink>
          <NavLink to="/geometric-unsharpness" className={getLinkClass('/geometric-unsharpness')}>Геометрическая нерезкость</NavLink>
          <NavLink to="/about" className={getLinkClass('/about')}>О проекте</NavLink>
        </nav>
      </div>
    </header>
  );
};


const Footer = () => (
  <footer className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mt-8">
    <div className="container mx-auto p-8 text-center text-slate-600 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} Калькулятор РК. Независимый проект.</p>
      <p className="text-sm mt-2">Профессиональные инструменты для специалистов неразрушающего контроля.</p>
       <div className="mt-4 flex justify-center gap-4">
          <a href="mailto:moohobor@yandex.ru" className="text-blue-500 hover:text-blue-400 transition-colors">
            Email
          </a>
          <span>|</span>
          <a href="https://t.me/robotaxist" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
            Telegram
          </a>
        </div>
    </div>
  </footer>
);


const App = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col p-4">
        <Header />
        <main className="flex-grow container mx-auto py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/parameters" element={<ParametersCalculatorPage />} />
            <Route path="/exposure" element={<ExposureCalculatorPage />} />
            <Route path="/activity" element={<ActivityCalculatorPage />} />
            <Route path="/geometric-unsharpness" element={<GeometricUnsharpnessCalculatorPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;