import React from 'react';
import { Target, Users, AlertTriangle, MessageSquare, Mail, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
    <div className="flex items-start gap-4">
      <div className="text-blue-500 bg-blue-100 dark:bg-slate-700 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 space-y-2">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">О проекте "Калькулятор РК"</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Точные и доступные инструменты для профессионалов неразрушающего контроля.
        </p>
      </div>

      <div className="space-y-8">
        <InfoCard icon={<Target size={24} />} title="Наша миссия">
          <p>
            Мы стремимся предоставить специалистам в области неразрушающего контроля удобные, точные и современные цифровые инструменты. Наша цель — упростить сложные расчёты, повысить эффективность работы и способствовать соблюдению стандартов безопасности и качества.
          </p>
          <p>
            Все расчёты основаны на действующих ГОСТах и нормативных документах, однако сервис является продуктом независимой разработки и не связан с какими-либо официальными организациями.
          </p>
        </InfoCard>

        <InfoCard icon={<Users size={24} />} title="Для кого эти инструменты">
          <p>
            Наши калькуляторы разработаны для широкого круга специалистов:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Дефектоскопистов и операторов РК</li>
            <li>Специалистов лабораторий неразрушающего контроля (ЛНК)</li>
            <li>Инженеров-технологов и разработчиков технологических карт</li>
            <li>Студентов и преподавателей профильных специальностей</li>
          </ul>
        </InfoCard>

        <InfoCard icon={<MessageSquare size={24} />} title="Обратная связь">
            <p>
                Разработчик постоянно работает над улучшением приложения и поиском возможных ошибок. Ваш отзыв очень важен для нас!
            </p>
            <p>
                Если у вас есть вопросы, предложения по улучшению функционала или вы столкнулись с ошибкой, пожалуйста, свяжитесь с нами:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <a href="mailto:moohobor@yandex.ru" className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                    <Mail size={16} />
                    Написать на Email
                </a>
                <a href="https://t.me/robotaxist" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors">
                    <Send size={16} />
                    Написать в Telegram
                </a>
            </div>
        </InfoCard>

        <div className="bg-amber-50 dark:bg-amber-900/50 p-6 rounded-xl border-l-4 border-amber-500">
          <div className="flex items-start gap-4">
            <div className="text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Отказ от ответственности</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-2">
                Разработчик не несёт ответственность за любые убытки или риски, связанные с применением результатов расчётов, полученных с помощью данного сервиса. Всегда сверяйте полученные данные с актуальной методической документацией и нормативными актами перед проведением реальных работ.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link to="/" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 inline-block">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
