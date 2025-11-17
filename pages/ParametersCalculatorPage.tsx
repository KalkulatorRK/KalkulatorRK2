import React, { useState, useRef } from 'react';
import { Calculator, RotateCcw, FileText, Download, Printer, X, AlertTriangle } from 'lucide-react';

// Импорт изображений схем для корректной обработки путей Vite
import scheme4_6 from '../img/scheme_4_6.png';
import scheme5a from '../img/scheme_5a.png';
import scheme5b from '../img/scheme_5b.png';
import scheme5d from '../img/scheme_5d.png';
import scheme5e from '../img/scheme_5e.png';
import scheme5g from '../img/scheme_5g.png';
import scheme5v from '../img/scheme_5v.png';
import scheme5z from '../img/scheme_5z.png';
import scheme5zh from '../img/scheme_5zh.png';

// Словарь с изображениями схем
const schemeImages: Record<string, string> = {
    '4_6': scheme4_6,
    '5a': scheme5a,
    '5b': scheme5b,
    '5d': scheme5d,
    '5e': scheme5e,
    '5g': scheme5g,
    '5v': scheme5v,
    '5z': scheme5z,
    '5zh': scheme5zh,
};

// Данные таблиц из ГОСТ
const TABLE_DATA_5a: Record<number, Record<number, number>> = {
    0.50: {10: 14.2, 9: 3.3}, 0.55: {8: 27.3, 9: 3.4, 10: 1.8},
    0.60: {8: 4.2, 9: 1.9, 10: 1.2}, 0.65: {7: 7.7, 8: 2.2, 9: 1.3, 10: 0.9},
    0.70: {7: 3.1, 8: 1.5, 9: 1.0, 10: 0.7}, 0.75: {6: 7.1, 7: 1.9, 8: 1.1, 9: 0.8, 10: 0.6},
    0.80: {6: 3.2, 7: 1.4, 8: 0.9, 9: 0.7, 10: 0.5}, 0.85: {5: 18.2, 6: 2.0, 7: 1.0, 8: 0.7, 9: 0.5, 10: 0.4},
    0.90: {5: 4.7, 6: 1.5, 7: 0.8, 8: 0.6, 9: 0.5, 10: 0.4}, 0.95: {5: 2.6, 6: 1.1, 7: 0.7, 8: 0.5, 9: 0.4, 10: 0.3}
};

const TABLE_DATA_5b: Record<number, Record<number, number | null>> = {
    0.40: {8: 10.4, 9: 3.2, 10: 2.0}, 0.45: {7: 18.2, 8: 3.3, 9: 2.0},
    0.50: {7: 3.8, 8: 2.2, 9: 2.0}, 0.55: {6: 6.9, 7: 2.8, 8: 2.0},
    0.60: {6: 4.0, 7: 2.0}, 0.65: {6: 2.5, 7: 2.0},
    0.70: {5: 9.8, 6: 2.0}, 0.75: {5: 4.3, 6: 2.0},
    0.80: {5: 3.0, 6: 2.0}, 0.85: {5: 2.3, 6: 2.0},
    0.90: {5: 2.0}, 0.95: {4: 18.3, 5: 2.0}
};

const TABLE_DATA_5g: Record<number, Record<number, [string, number]>> = {
    0.50: {4: ["≤", 0.4], 5: ["≤", 1.4], 6: ["≤", 12.0], 7: [">", 12.0]},
    0.55: {4: ["≤", 0.6], 5: ["≤", 2.6], 6: [">", 2.6]},
    0.60: {3: ["≤", 0.1], 4: ["≤", 0.9], 5: ["≤", 5.8], 6: [">", 5.8]},
    0.65: {3: ["≤", 0.2], 4: ["≤", 1.3], 5: ["≤", 40.0], 6: [">", 40.0]},
    0.70: {3: ["≤", 0.3], 4: ["≤", 1.9], 5: [">", 1.9]},
    0.75: {3: ["≤", 0.4], 4: ["≤", 3.0], 5: [">", 3.0]},
    0.80: {3: ["≤", 0.5], 4: ["≤", 4.7], 5: [">", 4.7]},
    0.85: {3: ["≤", 0.6], 4: ["≤", 9.8], 5: [">", 9.8]},
    0.90: {3: ["≤", 1.0], 4: [">", 1.0]}
};

// Описания схем
const schemeDetails: Record<string, { name: string; description: string }> = {
    '4_6': { name: 'Чертёж 2', description: 'пластины/листы' },
    '5a': { name: 'Чертёж 3а', description: '' },
    '5b': { name: 'Чертёж 3б', description: '' },
    '5v': { name: 'Чертёж 3в', description: 'D до 100 мм' },
    '5g': { name: 'Чертёж 3г', description: 'D более 50 мм' },
    '5d': { name: 'Чертёж 3д', description: 'D более 50 мм' },
    '5e': { name: 'Чертёж 3е', description: '' },
    '5zh': { name: 'Чертёж 3ж', description: 'D не более 2 м' },
    '5z': { name: 'Чертёж 3и', description: 'D более 2 м' }
};

// Компонент поля ввода с плейсхолдером
const InputField = ({ label, name, value, onChange, disabled = false, placeholder = "введите числовое значение", ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`mt-1 block w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            {...props}
        />
    </div>
);

// Компонент выпадающего списка
const SelectField = ({ label, name, value, onChange, children }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
            {children}
        </select>
    </div>
);

// Компонент элемента результата
const ResultItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{value}</p>
    </div>
);

// Компонент предупреждения
const WarningAlert = ({ message }: { message: string }) => (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
            <p className="text-amber-800 text-sm font-medium">Внимание!</p>
            <p className="text-amber-700 text-sm mt-1">{message}</p>
        </div>
    </div>
);

// Основной компонент калькулятора параметров
const ParametersCalculatorPage = () => {
    // Состояние для хранения входных данных - теперь все поля пустые
    const [inputs, setInputs] = useState({
        scheme: '4_6',
        d_focus: '',
        h_thickness: '',
        z_sensitivity: '',
        d_outer: '',
        d_inner: '',
    });

    // Состояния для результатов и UI
    const [results, setResults] = useState<React.ReactNode | null>(null);
    const [calculationLog, setCalculationLog] = useState<string | null>(null);
    const [helpVisible, setHelpVisible] = useState(false);
    const [currentScheme, setCurrentScheme] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState('');

    // Ref для печати
    const printRef = useRef<HTMLDivElement>(null);

    // Обработчик изменения полей ввода
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    // Сброс формы к начальным значениям
    const resetForm = () => {
        setInputs({
            scheme: '4_6',
            d_focus: '',
            h_thickness: '',
            z_sensitivity: '',
            d_outer: '',
            d_inner: '',
        });
        setResults(null);
        setCalculationLog(null);
        setHelpVisible(false);
        setCurrentScheme(null);
        setAlertMessage('');
    };

    // Построение текста справки для отчёта
    const buildHelpText = (logData: { steps: string[], resultsData: Record<string, any> }) => {
        const lines = [];
        const {scheme} = inputs;
        const Φ = parseFloat(inputs.d_focus);
        const s = parseFloat(inputs.h_thickness);
        const K = parseFloat(inputs.z_sensitivity);
        const D = parseFloat(inputs.d_outer);
        const d = parseFloat(inputs.d_inner);

        // Заголовок и основная информация
        lines.push(`Технический отчёт`);
        lines.push(`Дата: ${new Date().toLocaleString()}`);
        lines.push(`Схема: ${schemeDetails[scheme].name}`);
        lines.push('------------------------------------');
        lines.push('');
        lines.push('Исходные данные:');
        lines.push(`  Φ (Размер фокусного пятна) = ${Φ} мм`);
        lines.push(`  s (Радиационная толщина) = ${s} мм`);
        lines.push(`  K (Требуемая чувствительность) = ${K} мм`);

        // Добавляем диаметры только если они используются в расчёте
        if (scheme !== '4_6') {
            lines.push(`  D (Наружный диаметр) = ${D} мм`);
            lines.push(`  d (Внутренний диаметр) = ${d} мм`);
            lines.push(`  m (Отношение диаметров d/D) = ${(d / D).toFixed(4)}`);
        }

        lines.push('');
        lines.push('Ход расчёта:');
        logData.steps.forEach((st) => lines.push(`  - ${st}`));
        lines.push('');

        // Формулы в зависимости от схемы
        lines.push('Формулы и переменные:');
        switch (scheme) {
            case '4_6': lines.push('  f = C * s'); break;
            case '5a': lines.push('  f = 0.7 * C * (1 - m) * D'); break;
            case '5b': lines.push('  f = 0.5 * C * D'); break;
            case '5v': lines.push('  f = C * D'); break;
            case '5g': lines.push('  f = 0.5 * (1.5 * C * (D - d) - D)'); break;
            case '5d': lines.push('  f = 0.5 * (C * (1.4 * D - d) - D)'); break;
            case '5zh': lines.push('  f_min = 0.5 * C * (1 - m) * D'); break;
        }
        if (scheme !== '5e' && scheme !== '5z') {
           lines.push('  C = (2 * Φ) / K, (где C ≥ 4)');
        }
        lines.push('  f - расстояние от источника до поверхности сварного шва, мм');
        lines.push('  N - число экспозиций');
        lines.push('  L - длина контролируемого за одну экспозицию участка, мм');
        lines.push('');
        lines.push('------------------------------------');

        // Итоговые результаты
        lines.push('Итоговые значения:');
        for (const [key, val] of Object.entries(logData.resultsData)) {
            lines.push(`  ${key} = ${typeof val === 'number' ? val.toFixed(4) : val}`);
        }

        // Добавляем предупреждение для схемы 3б в отчёт
        if (scheme === '5b') {
            lines.push('');
            lines.push('ПРИМЕЧАНИЕ:');
            lines.push('ГОСТ Р 50.05.07-18 Г.5 Для схемы на рисунке 3б при длине радиографической пленки менее внутреннего диаметра сварного соединения, а также для схем на рисунке 3ж, и расстояние и число участков (экспозиций) определяют опытным путем с учетом требований настоящего стандарта.');
        }

        lines.push('');
        lines.push('Примечание: Для окончательных решений сверяйтесь с актуальной методической документацией.');

        return lines.join('\n');
    };

    // Основная функция расчёта
    const calculate = () => {
        const Φ = parseFloat(inputs.d_focus);
        const s = parseFloat(inputs.h_thickness);
        const K = parseFloat(inputs.z_sensitivity);
        const D = parseFloat(inputs.d_outer);
        const d = parseFloat(inputs.d_inner);

        // Валидация входных данных
        if (isNaN(Φ) || isNaN(s) || isNaN(K) || Φ <=0 || s <=0 || K<=0) {
            setAlertMessage('Пожалуйста, заполните все обязательные поля корректными положительными числовыми значениями.');
            return;
        }

        // Для схем, где используются диаметры, проверяем их корректность
        if (inputs.scheme !== '4_6') {
            if (isNaN(D) || isNaN(d) || D<=0 || d<=0) {
                setAlertMessage('Пожалуйста, заполните все поля корректными положительными числовыми значениями.');
                return;
            }
            if (d >= D) {
                setAlertMessage('Внутренний диаметр d не может быть больше или равен наружному диаметру D.');
                return;
            }
        }

        setAlertMessage('');
        setCurrentScheme(inputs.scheme);

        const log: { steps: string[], resultsData: Record<string, any> } = { steps: [], resultsData: {} };

        // Функция расчёта коэффициента C
        const getC = (phi: number, K_val: number) => {
            if (isNaN(phi) || isNaN(K_val) || K_val === 0) return 4;
            const ratio = phi / K_val;
            return (ratio >= 2) ? (2 * phi / K_val) : 4;
        };

        // Функция поиска ближайшего ключа в таблице
        const findClosestKey = (table: Record<string, any>, value: number) => {
            return Object.keys(table).reduce((prev, curr) =>
                (Math.abs(parseFloat(curr) - value) < Math.abs(parseFloat(prev) - value) ? curr : prev)
            );
        };

        let resultNode: React.ReactNode = null;

        // Расчёт в зависимости от выбранной схемы
        switch (inputs.scheme) {
            case '4_6': {
                // Схема для пластин/листов
                const C = getC(Φ, K);
                log.steps.push(`Расчёт коэффициента С: C = (2 * Φ) / K = (2 * ${Φ}) / ${K} = ${C.toFixed(4)}`);
                const f = C * s;
                log.steps.push(`Расчёт фокусного расстояния f: f = C * s = ${C.toFixed(4)} * ${s} = ${f.toFixed(3)} мм`);
                log.resultsData = { 'Коэффициент C': C, 'Расстояние f, не менее': `${f.toFixed(1)} мм` };
                resultNode = (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ResultItem label="Коэффициент C:" value={C.toFixed(2)} />
                        <ResultItem label="Расстояние от источника до поверхности сварного шва f: не менее" value={`${f.toFixed(1)} мм`} />
                    </div>
                );
                break;
            }
            case '5a': {
                // Схема 5а - трубы с размещением источника снаружи
                const m = d / D;
                log.steps.push(`Расчёт m: m = d / D = ${d} / ${D} = ${m.toFixed(4)}`);
                const C = getC(Φ, K);
                log.steps.push(`Расчёт C: C = ${C.toFixed(4)}`);
                const f = 0.7 * C * (1 - m) * D;
                log.steps.push(`Расчёт f: f = 0.7 * C * (1 - m) * D = 0.7 * ${C.toFixed(4)} * (1 - ${m.toFixed(4)}) * ${D} = ${f.toFixed(3)} мм`);
                const fD = f / D;
                log.steps.push(`Расчёт f/D: f/D = ${f.toFixed(3)} / ${D} = ${fD.toFixed(4)}`);

                // Поиск в таблице данных
                const closest_m_key = findClosestKey(TABLE_DATA_5a, m);
                log.steps.push(`Поиск в таблице для m ≈ ${closest_m_key}`);
                const tableRow = TABLE_DATA_5a[parseFloat(closest_m_key)];
                let N = 10;
                for (const [exposures, min_fD] of Object.entries(tableRow).sort((a,b)=>parseInt(a[0])-parseInt(b[0]))) {
                    if (fD >= min_fD) {
                        N = parseInt(exposures);
                        log.steps.push(`Условие f/D >= ${min_fD} выполнено. Выбрано N = ${N}`);
                        break;
                    }
                }
                const angle = 360 / N;
                const L = (Math.PI * D) / N; // Исправлено: длина участка по окружности
                log.resultsData = { f: `${f.toFixed(1)} мм`, N, 'Угол': `${angle.toFixed(0)}°`, L: `${L.toFixed(0)} мм` };
                resultNode = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ResultItem label="Коэфф. C:" value={C.toFixed(2)} />
                        <ResultItem label="Расстояние f:" value={`${f.toFixed(1)} мм`} />
                        <ResultItem label="Экспозиций N:" value={N} />
                        <ResultItem label="Угол между экспозициями:" value={`${angle.toFixed(0)}°`} />
                        <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
                    </div>
                );
                break;
            }
            case '5b': {
                // Схема 5б - трубы с другим размещением
                const m = d / D;
                log.steps.push(`m = d / D = ${d} / ${D} = ${m.toFixed(4)}`);
                const C = getC(Φ, K);
                log.steps.push(`C = ${C.toFixed(4)}`);
                const f = 0.5 * C * D;
                log.steps.push(`f = 0.5 * C * D = 0.5 * ${C.toFixed(4)} * ${D} = ${f.toFixed(3)} мм`);
                const fD = f / D;
                log.steps.push(`f/D = ${f.toFixed(3)} / ${D} = ${fD.toFixed(4)}`);

                const closest_m_key = findClosestKey(TABLE_DATA_5b, m);
                log.steps.push(`Поиск в таблице для m ≈ ${closest_m_key}`);
                const tableRow = TABLE_DATA_5b[parseFloat(closest_m_key)];
                let N = 10;
                 for (const [exposures, min_fD] of Object.entries(tableRow).sort((a,b)=>parseInt(a[0])-parseInt(b[0]))) {
                    if (min_fD !== null && fD >= min_fD) {
                        N = parseInt(exposures);
                        log.steps.push(`Условие f/D >= ${min_fD} выполнено. N = ${N}`);
                        break;
                    }
                }
                const L = (Math.PI * D) / N; // ИСПРАВЛЕНО: длина участка по окружности как в схеме 3г
                log.resultsData = { f: `${f.toFixed(1)} мм`, N, L: `${L.toFixed(0)} мм` };
                resultNode = (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <ResultItem label="Расстояние от источника до поверхности сварного шва f: не менее" value={`${f.toFixed(1)} мм`} />
                            <ResultItem label="Экспозиций N:" value={N} />
                            <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
                        </div>
                        {/* Предупреждение для схемы 3б */}
                        <WarningAlert message="ГОСТ Р 50.05.07-18 Г.5 Для схемы на рисунке 3б при длине радиографической пленки менее внутреннего диаметра сварного соединения, а также для схем на рисунке 3ж, и расстояние и число участков (экспозиций) определяют опытным путем с учетом требований настоящего стандарта." />
                    </>
                );
                break;
            }
            case '5v': {
                // Схема 5в - для труб малого диаметра
                const C = getC(Φ, K);
                log.steps.push(`C = ${C.toFixed(4)}`);
                const f = C * D;
                log.steps.push(`f = C * D = ${C.toFixed(4)} * ${D} = ${f.toFixed(3)} мм`);
                const N = 2;
                const angle = 180;
                const L = (Math.PI * D) / 2;
                log.resultsData = { f: `${f.toFixed(1)} мм`, N, 'Угол': `${angle.toFixed(0)}°`, L: `${L.toFixed(0)} мм` };
                resultNode = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ResultItem label="Расстояние от источника до поверхности сварного шва f: не менее" value={`${f.toFixed(1)} мм`} />
                        <ResultItem label="Экспозиций N:" value={N} />
                        <ResultItem label="Угол между экспозициями:" value={`${angle.toFixed(0)}°`} />
                        <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
                    </div>
                );
                break;
            }
            case '5g':
            case '5d': {
                // Схемы 5г и 5д - для труб большого диаметра
                 const m = d / D;
                log.steps.push(`m = d / D = ${d} / ${D} = ${m.toFixed(4)}`);
                const C = getC(Φ, K);
                log.steps.push(`C = ${C.toFixed(4)}`);
                const f = inputs.scheme === '5g'
                    ? 0.5 * (1.5 * C * (D - d) - D)
                    : 0.5 * (C * (1.4 * D - d) - D);
                log.steps.push(`f (оценочно) = ${f.toFixed(3)} мм`);
                const fD = f / D;
                log.steps.push(`f/D = ${f.toFixed(3)} / ${D} = ${fD.toFixed(4)}`);

                const closest_m_key = findClosestKey(TABLE_DATA_5g, m);
                log.steps.push(`Поиск в таблице для m ≈ ${closest_m_key}`);
                const tableRow = TABLE_DATA_5g[parseFloat(closest_m_key)];
                let N: number | null = null;

                for (const [exposures, condition] of Object.entries(tableRow).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
                    if (!condition) continue;
                    const [operator, threshold] = condition;
                    log.steps.push(` - Проверка для N=${exposures}: f/D (${fD.toFixed(4)}) ${operator} ${threshold}?`);
                    if ((operator === "≥" && fD >= threshold) || (operator === "≤" && fD <= threshold) || (operator === ">" && fD > threshold)) {
                        N = parseInt(exposures);
                        log.steps.push(`   > Условие выполнено. N = ${N}`);
                        break;
                    }
                }
                if (N === null) {
                    log.steps.push("N не найдено.");
                    resultNode = <div className="text-amber-700 bg-amber-100 p-4 rounded-lg">Для m={m.toFixed(3)} и f/D={fD.toFixed(3)} N не найдено.</div>;
                } else {
                    const angle = 360 / N;
                    const L = (Math.PI * D) / N;
                    log.resultsData = { f: `${(fD * D).toFixed(1)} мм`, N, 'Угол': `${angle.toFixed(0)}°`, L: `${L.toFixed(0)} мм` };
                    resultNode = (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <ResultItem label="Расстояние от источника до поверхности сварного шва f: не менее" value={`${(fD * D).toFixed(1)} мм`} />
                           <ResultItem label="Экспозиций N:" value={N} />
                           <ResultItem label="Угол между экспозициями:" value={`${angle.toFixed(0)}°`} />
                           <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
                        </div>
                   );
                }
                break;
            }
             case '5zh': {
                // Схема 5ж - для труб с внутренним размещением
                const m = d / D;
                const C = getC(Φ, K);
                log.steps.push(`m = ${m.toFixed(4)}, C = ${C.toFixed(4)}`);
                const f_min_required = 0.5 * C * (1 - m) * D;
                log.steps.push(`Мин. требуемое f = 0.5 * C * (1-m) * D = ${f_min_required.toFixed(3)} мм`);
                if (f_min_required > d) {
                    log.steps.push(`Условие не выполняется: f (${f_min_required.toFixed(1)} мм) > d (${d} мм)`);
                    log.resultsData = { 'Результат': 'Условие не выполняется' };
                    resultNode = (
                        <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                            <p className="font-bold">❌ Условие не выполняется</p>
                            <p>f ≥ {f_min_required.toFixed(1)} мм &gt; d = {d} мм. Используйте источник с меньшим фокусным пятном.</p>
                        </div>
                    );
                } else {
                    log.steps.push(`Условие выполнено: f (${f_min_required.toFixed(1)} мм) <= d (${d} мм)`);
                    log.resultsData = { 'Минимальное расстояние f': `≥ ${f_min_required.toFixed(1)} мм` };
                    resultNode = (
                        <>
                           <ResultItem label="Минимальное расстояние f:" value={`≥ ${f_min_required.toFixed(1)} мм`} />
                           <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">Определите f исходя из диаметра {d} мм. Количество участков — опытным путём.</div>
                        </>
                    );
                }
                break;
            }
            case '5e':
            case '5z':
                // Схемы без расчёта
                const message = inputs.scheme === '5e'
                    ? "Схема 3е — панорамное просвечивание, расчёт не выполняется."
                    : "Схема 3и — расчёт не выполняется.";
                log.steps.push(message);
                log.resultsData = { 'Результат': message };
                resultNode = <div className="text-slate-700 bg-slate-100 p-4 rounded-lg">{message}</div>;
                break;
            default:
                resultNode = <div className="text-amber-700 bg-amber-100 p-4 rounded-lg">Выбранная схема не поддерживается.</div>;
        }

        setResults(resultNode);
        setCalculationLog(buildHelpText(log));
    };

    // Функция печати
    const handlePrint = () => {
        window.print();
    };

    // Функция скачивания справки
    const downloadHelp = () => {
        if (!calculationLog) return;
        const blob = new Blob([calculationLog], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculation_log_${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Определяем, должны ли быть отключены поля диаметров
    const isDiameterInputsDisabled = inputs.scheme === '4_6';

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in">
             {/* Стили для печати */}
             <style>{`
                @media print {
                    body {
                        visibility: hidden;
                    }
                    .print-section, .print-section * {
                        visibility: visible;
                    }
                    .print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                        font-size: 12px;
                        color: black;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Секция для печати */}
            <div ref={printRef} className="hidden print:block print-section">
                {calculationLog && currentScheme && (
                    <div>
                        <h1 className="text-2xl font-bold mb-6 text-center">Отчёт о расчёте параметров РК</h1>
                        <div className="text-center mb-6">
                             <h2 className="text-xl font-semibold mb-2">Схема контроля</h2>
                             {schemeImages[currentScheme] && <img src={schemeImages[currentScheme]} alt={`Схема ${schemeDetails[currentScheme].name}`} className="max-w-md mx-auto h-auto object-contain rounded-md border p-2" />}
                             <p className="text-sm text-slate-600 mt-2">{schemeDetails[currentScheme].name}</p>
                        </div>
                        <div>
                             <h2 className="text-xl font-semibold mb-2">Подробный отчёт</h2>
                             <pre className="bg-slate-50 p-4 rounded-md text-xs font-mono whitespace-pre-wrap border">{calculationLog}</pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Основной интерфейс */}
            <div className="text-center mb-8 no-print">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Калькулятор параметров радиографического контроля</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">По ГОСТ Р 50.05.07-2018 (Приложение Г)</p>
            </div>

            {/* Форма ввода данных */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 no-print">
                <h2 className="text-xl font-bold mb-4">Исходные данные</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Схема просвечивания" name="scheme" value={inputs.scheme} onChange={handleChange}>
                        {Object.entries(schemeDetails).map(([key, {name, description}]) =>
                            <option key={key} value={key}>{`${name}${description ? ` (${description})` : ''}`}</option>
                        )}
                    </SelectField>
                    <InputField
                        label="Размер фокусного пятна Φ, мм"
                        name="d_focus"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={inputs.d_focus}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Радиационная толщина s, мм"
                        name="h_thickness"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={inputs.h_thickness}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Требуемая чувствительность K, мм"
                        name="z_sensitivity"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={inputs.z_sensitivity}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Наружный диаметр D, мм"
                        name="d_outer"
                        type="number"
                        step="1"
                        min="1"
                        value={inputs.d_outer}
                        onChange={handleChange}
                        disabled={isDiameterInputsDisabled}
                    />
                    <InputField
                        label="Внутренний диаметр d, мм"
                        name="d_inner"
                        type="number"
                        step="1"
                        min="1"
                        value={inputs.d_inner}
                        onChange={handleChange}
                        disabled={isDiameterInputsDisabled}
                    />
                </div>
                {alertMessage && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{alertMessage}</div>}
                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={calculate} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"><Calculator size={18} />Рассчитать</button>
                    <button onClick={resetForm} className="flex-1 bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"><RotateCcw size={18} />Сбросить</button>
                    <button onClick={() => setHelpVisible(true)} disabled={!calculationLog} className="flex-1 bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><FileText size={18} />Отчёт</button>
                    <button onClick={handlePrint} disabled={!results} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Printer size={18} />Печать</button>
                </div>
            </div>

            {/* Секция результатов */}
            {results && currentScheme && (
                 <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-fade-in no-print">
                     <h2 className="text-xl font-bold mb-4">Результаты расчёта</h2>
                     <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            {results}
                         </div>
                         <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                             {schemeImages[currentScheme] && <img src={schemeImages[currentScheme]} alt={`Схема ${schemeDetails[currentScheme].name}`} className="max-w-full h-auto max-h-72 object-contain rounded-md" />}
                             <p className="text-xs text-slate-500 mt-2">{schemeDetails[currentScheme].name}</p>
                         </div>
                     </div>
                 </div>
            )}

            {/* Модальное окно справки */}
            {helpVisible && calculationLog && currentScheme && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in no-print" onClick={() => setHelpVisible(false)}>
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                       <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                           <h2 className="text-lg font-bold">Справка о расчёте</h2>
                           <button onClick={() => setHelpVisible(false)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20}/></button>
                       </div>
                       <div className="p-6 overflow-y-auto">
                           <div className="flex justify-center mb-4">
                               {schemeImages[currentScheme] && <img src={schemeImages[currentScheme]} alt={`Схема ${schemeDetails[currentScheme].name}`} className="max-w-xs h-auto max-h-40 object-contain rounded-md border p-2 dark:border-slate-700" />}
                           </div>
                           <pre className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-md text-xs font-mono whitespace-pre-wrap">{calculationLog}</pre>
                       </div>
                       <div className="p-4 border-t dark:border-slate-700 flex gap-2">
                            <button onClick={downloadHelp} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"><Download size={16}/>Скачать TXT</button>
                       </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParametersCalculatorPage;