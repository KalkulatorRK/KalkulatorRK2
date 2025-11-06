import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Timer, Sliders, Info, Construction, Radiation, AlertTriangle, Focus } from 'lucide-react';

interface CardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({ to, icon, title, description, disabled }) => {
  const content = (
    <div className={`group relative bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}`}>
      <div className="flex items-start gap-4">
        <div className={`bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg p-3 transition-colors duration-300 ${!disabled && 'group-hover:bg-blue-600 group-hover:text-white'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
      {disabled && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Construction size={14}/> В разработке
        </div>
      )}
    </div>
  );

  if (disabled) {
    return <div className="cursor-not-allowed">{content}</div>;
  }

  return <Link to={to}>{content}</Link>;
};

const HomePage = () => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Инструменты для специалиста РК</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
          Онлайн-калькуляторы для расчёта параметров радиографического контроля в соответствии с отраслевым стандартами.
        </p>
         <div className="mt-6 flex justify-center">
            <div className="bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm font-medium px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <AlertTriangle size={16} />
                Приложение находится в режиме тестирования!
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card
          to="/parameters"
          icon={<Sliders size={24} />}
          title="Параметры радиографического контроля"
          description="Расчёт фокусного расстояния, числа экспозиций и других параметров по ГОСТ Р 50.05.07-2018."
        />
        <Card
          to="/exposure"
          icon={<Timer size={24} />}
          title="Время экспозиции"
          description="Расчёт времени экспозиции для рентгеновских аппаратов и радионуклидных источников по ТУ РГК 1-2024."
        />
        <Card
          to="/activity"
          icon={<Radiation size={24} />}
          title="Активность источника"
          description="Определение активности радионуклидных источников (Se-75, Ir-192) с учётом периода полураспада."
        />
        <Card
          to="/geometric-unsharpness"
          icon={<Focus size={24} />}
          title="Геометрическая нерезкость"
          description="Расчёт величины геометрической нерезкости изображения дефектов"
          //disabled
        />
      </div>
    </div>
  );
};

export default HomePage;