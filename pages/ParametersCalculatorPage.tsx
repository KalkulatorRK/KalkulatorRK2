import React, { useState, useRef, ChangeEvent, ReactNode } from 'react';
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

// Типы для пропсов компонентов
interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    step?: string;
    min?: string;
}

interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    children: ReactNode;
}

interface ResultItemProps {
    label: string;
    value: string | number;
}

interface WarningAlertProps {
    message: string;
}

interface InfoAlertProps {
    message: string;
}

// Компонент поля ввода с плейсхолдером
const InputField = ({ label, name, value, onChange, disabled = false, placeholder = "введите числовое значение", ...props }: InputFieldProps) => (
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
const SelectField = ({ label, name, value, onChange, children }: SelectFieldProps) => (
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
const ResultItem = ({ label, value }: ResultItemProps) => (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{value}</p>
    </div>
);

// Компонент предупреждения
const WarningAlert = ({ message }: WarningAlertProps) => (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
            <p className="text-amber-800 text-sm font-medium">Внимание!</p>
            <p className="text-amber-700 text-sm mt-1">{message}</p>
        </div>
    </div>
);

// Компонент информационного сообщения
const InfoAlert = ({ message }: InfoAlertProps) => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">{message}</p>
    </div>
);

// Типы для состояния
interface InputsState {
    scheme: string;
    d_focus: string;
    h_thickness: string;
    z_sensitivity: string;
    d_outer: string;
    d_inner: string;
    film_length: string; // новое поле для длины снимка
}

// Основной компонент калькулятора параметров
const ParametersCalculatorPage = () => {
    // Состояние для хранения входных данных - теперь все поля пустые
    const [inputs, setInputs] = useState<InputsState>({
        scheme: '4_6',
        d_focus: '',
        h_thickness: '',
        z_sensitivity: '',
        d_outer: '',
        d_inner: '',
        film_length: '', // новое поле для длины снимка
    });

    // Состояния для результатов и UI
    const [results, setResults] = useState<ReactNode | null>(null);
    const [calculationLog, setCalculationLog] = useState<string | null>(null);
    const [helpVisible, setHelpVisible] = useState(false);
    const [currentScheme, setCurrentScheme] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState('');

    // Ref для печати
    const printRef = useRef<HTMLDivElement>(null);

    // Обработчик изменения полей ввода
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            film_length: '',
        });
        setResults(null);
        setCalculationLog(null);
        setHelpVisible(false);
        setCurrentScheme(null);
        setAlertMessage('');
    };

    // Определяем, должны ли быть отключены поля диаметров
    const isDiameterInputsDisabled = inputs.scheme === '4_6';

    // Определяем, должно ли быть отключено поле радиационной толщины
    const isThicknessInputDisabled = ['5a', '5b', '5v', '5g', '5d', '5e', '5zh', '5z'].includes(inputs.scheme);

    // Определяем, должно ли быть активно поле длины снимка
    const isFilmLengthInputActive = inputs.scheme === '5b';

    // Построение текста справки для отчёта
    const buildHelpText = (logData: { steps: string[], resultsData: Record<string, any> }) => {
        const lines = [];
        const {scheme} = inputs;
        const Φ = parseFloat(inputs.d_focus);
        const s = parseFloat(inputs.h_thickness);
        const K = parseFloat(inputs.z_sensitivity);
        const D = parseFloat(inputs.d_outer);
        const d = parseFloat(inputs.d_inner);
        const l = parseFloat(inputs.film_length);

        // Заголовок и основная информация
        lines.push(`Технический отчёт`);
        lines.push(`Дата: ${new Date().toLocaleString()}`);
        lines.push(`Схема: ${schemeDetails[scheme].name}`);
        lines.push('------------------------------------');
        lines.push('');
        lines.push('Исходные данные:');
        lines.push(`  Φ (Размер фокусного пятна) = ${Φ} мм`);

        // Добавляем радиационную толщину только если она используется в расчёте
        if (!isThicknessInputDisabled) {
            lines.push(`  s (Радиационная толщина) = ${s} мм`);
        }

        lines.push(`  K (Требуемая чувствительность) = ${K} мм`);

        // Добавляем диаметры только если они используются в расчёте
        if (scheme !== '4_6') {
            lines.push(`  D (Наружный диаметр) = ${D} мм`);
            lines.push(`  d (Внутренний диаметр) = ${d} мм`);
            lines.push(`  m (Отношение диаметров d/D) = ${(d / D).toFixed(4)}`);
        }

        // Добавляем длину снимка для схемы 5б
        if (scheme === '5b') {
            lines.push(`  l (Длина снимка) = ${l} мм`);
            lines.push(`  b (l/d) = ${(l / d).toFixed(4)}`);
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
            case '5b':
                lines.push('  f ≥ 0,5C(1 - m√(1 - b²))D');
                lines.push('  q = (b(2n + 1)) / √((2n + 1 - m√(1 - b²))² + m²b²)');
                lines.push('  N = 180° / (arcsin(qm) - arcsin(qm/(2n + 1)))');
                lines.push('  (расчёт по ГОСТ 7512-82 Приложение 4 п. 4)');
                break;
            case '5v': lines.push('  f = C * D'); break;
            case '5g': lines.push('  f = 0.5 * (1.5 * C * (D - d) - D)'); break;
            case '5d': lines.push('  f = 0.5 * (C * (1.4 * D - d) - D)'); break;
            case '5zh':
                lines.push('  f ≥ 0,5C(1 - m)D');
                lines.push('  r = √(1 - (0,25⋅C²(1 - m²))/(m²(C + 1)))');
                lines.push('  N ≥ 180° / (arcsin(rm) + arcsin(rm/(2n - m)))');
                lines.push('  (расчёт по методике ГОСТ 7512-82 для схемы 3ж)');
                break;
        }
        if (scheme !== '5e' && scheme !== '5z' && scheme !== '5b') {
           lines.push('  C = (2 * Φ) / K, (где C ≥ 4)');
        }
        if (scheme === '5b') {
            lines.push('  C = (2 * Φ) / K, (где C ≥ 4)');
            lines.push('  b = l/d');
            lines.push('  m = d/D');
            lines.push('  n - геометрический параметр');
        }
        if (scheme === '5zh') {
            lines.push('  C = (2 * Φ) / K, (где C ≥ 4)');
            lines.push('  m = d/D');
            lines.push('  n - геометрический параметр');
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

        // Добавляем информацию о методике для схемы 5б
        if (scheme === '5b') {
            lines.push('');
            lines.push('ПРИМЕЧАНИЕ:');
            lines.push('Расчёт для чертежа 3б выполнен по методике ГОСТ 7512-82 Приложение 4 п. 4');
        }

        // Добавляем информацию о методике для схемы 5zh
        if (scheme === '5zh') {
            lines.push('');
            lines.push('ПРИМЕЧАНИЕ:');
            lines.push('Для схемы черт. 3ж (5ж по ГОСТ 7512-82) определяют максимально возможное');
            lines.push('(исходя из внутреннего диаметра контролируемого изделия и размеров радиационной');
            lines.push('или коллимирующей головки гамма-дефектоскопа или размеров излучателя');
            lines.push('рентгеновского аппарата) расстояние f (по диаметру изделия) которое должно');
            lines.push('быть не менее величины рассчитанного f');
        }

        lines.push('');
        lines.push('Примечание: Для окончательных решений сверяйтесь с актуальной методической документацией.');

        return lines.join('\n');
    };

    // Функция расчёта для схемы 5б по ГОСТ 7512-82
const calculateScheme5b = (Φ: number, K: number, D: number, d: number, l: number, log: { steps: string[], resultsData: Record<string, any> }) => {
    // Основные параметры
    const m = d / D;
    let currentL = l; // начинаем с введенного значения l
    let foundSolution = false;
    let optimalN = 0;
    let optimalF = 0;
    let optimalQ = 0;
    let optimalL = l;
    let usedAutoAdjustment = false;

    log.steps.push(`Расчёт основных параметров:`);
    log.steps.push(`  m = d / D = ${d} / ${D} = ${m.toFixed(4)}`);

    // Проверка ограничения l < d
    if (currentL >= d) {
        log.steps.push(`Ошибка: l (${currentL} мм) ≥ d (${d} мм) - длина снимка должна быть меньше внутреннего диаметра`);
        return (
            <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                <p className="font-bold">❌ Ошибка в исходных данных</p>
                <p>Длина снимка l ({currentL} мм) должна быть меньше внутреннего диаметра d ({d} мм)</p>
            </div>
        );
    }

    // Итерационный подбор с корректировкой l
    for (let iteration = 0; iteration < 10; iteration++) {
        const b = currentL / d;
        const C = Math.max((2 * Φ) / K, 4);

        // Минимальное расстояние f для текущего l
        const currentF = 0.5 * C * (1 - m * Math.sqrt(1 - b * b)) * D;

        if (iteration === 0) {
            log.steps.push(`  Исходные параметры: l = ${currentL.toFixed(1)} мм, b = l/d = ${b.toFixed(4)}`);
            log.steps.push(`  C = max(2Φ/K, 4) = max(${(2 * Φ).toFixed(2)}/${K}, 4) = ${C.toFixed(4)}`);
            log.steps.push(`  f_min = 0,5C(1 - m√(1 - b²))D = ${currentF.toFixed(1)} мм`);
        } else {
            log.steps.push(`\nИтерация ${iteration}: l = ${currentL.toFixed(1)} мм, b = ${b.toFixed(4)}`);
        }

        // Перебираем возможные значения n (геометрический параметр)
        for (let n = 1; n <= 5; n++) {
            const denominator = Math.sqrt(Math.pow((2 * n + 1 - m * Math.sqrt(1 - b * b)), 2) + m * m * b * b);
            const q = (b * (2 * n + 1)) / denominator;

            const maxQ = Math.sqrt(1 - 0.2 * Math.pow((2.6 - 1 / m), 2));

            log.steps.push(`  Проверка для n = ${n}: q = ${q.toFixed(4)}, maxQ = ${maxQ.toFixed(4)}`);

            if (q <= maxQ) {
                // Расчёт количества экспозиций
                const angle1 = Math.asin(q * m) * 180 / Math.PI;
                const angle2 = Math.asin(q * m / (2 * n + 1)) * 180 / Math.PI;
                const N = 180 / (angle1 - angle2);

                const roundedN = Math.ceil(N);

                log.steps.push(`  ✓ Условие выполняется!`);
                log.steps.push(`  N = 180° / (arcsin(qm) - arcsin(qm/(2n+1))) = ${N.toFixed(2)} → ${roundedN} экспозиций`);

                optimalN = roundedN;
                optimalF = currentF;
                optimalQ = q;
                optimalL = currentL;
                foundSolution = true;

                // Запоминаем, что использовали автоматический подбор
                if (iteration > 0) {
                    usedAutoAdjustment = true;
                    log.steps.push(`  Автоматически подобрана длина снимка: ${optimalL.toFixed(1)} мм`);
                }
                break;
            } else {
                log.steps.push(`  ✗ Условие не выполняется: q > maxQ`);
            }
        }

        if (foundSolution) {
            break;
        }

        // Если решение не найдено - уменьшаем l на 10% для следующей итерации
        const newL = currentL * 0.9;
        if (newL < 50) { // Минимальная практическая длина снимка
            log.steps.push(`  Достигнута минимальная длина снимка (50 мм). Решение не найдено.`);
            break;
        }
        log.steps.push(`  Решение не найдено. Уменьшаем l с ${currentL.toFixed(1)} до ${newL.toFixed(1)} мм`);
        currentL = newL;
    }

    if (!foundSolution) {
        log.steps.push(`\nРешение не найдено после всех итераций.`);
        return (
            <div className="text-amber-700 bg-amber-100 p-4 rounded-lg">
                <p className="font-bold">⚠️ Решение не найдено</p>
                <p>Для заданных параметров не удалось найти решение, удовлетворяющее условиям ГОСТ.</p>
                <p className="mt-2">Рекомендуется:</p>
                <ul className="list-disc list-inside mt-1">
                    <li>Уменьшить длину снимка l (попробуйте значение менее ${(currentL).toFixed(0)} мм)</li>
                    <li>Увеличить расстояние f</li>
                    <li>Использовать источник с меньшим фокусным пятном</li>
                </ul>
            </div>
        );
    }

    const L = (Math.PI * D) / optimalN;

    log.resultsData = {
        'Коэффициент C': Math.max((2 * Φ) / K, 4),
        'Длина снимка l': `${optimalL.toFixed(1)} мм`,
        'Минимальное расстояние f': `${optimalF.toFixed(1)} мм`,
        'Экспозиций N': optimalN,
        'Длина участка L': `${L.toFixed(0)} мм`,
        'Коэффициент q': optimalQ.toFixed(4),
        'Коэффициент b': (optimalL / d).toFixed(4)
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ResultItem label="Коэффициент C:" value={Math.max((2 * Φ) / K, 4).toFixed(2)} />
                <ResultItem label="Длина снимка l:" value={`${optimalL.toFixed(1)} мм`} />
                <ResultItem label="Расстояние f, не менее:" value={`${optimalF.toFixed(1)} мм`} />
                <ResultItem label="Экспозиций N:" value={optimalN} />
                <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
                <ResultItem label="Коэффициент q:" value={optimalQ.toFixed(4)} />
            </div>

            <InfoAlert message="Расчёт для чертежа 3б выполнен по методике ГОСТ 7512-82 Приложение 4 п. 4" />

            {usedAutoAdjustment && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">✅ Автоматический подбор параметров</p>
                    <p className="text-green-700 text-sm mt-1">
                        Для выполнения условий ГОСТ длина снимка автоматически уменьшена с <strong>{l.toFixed(1)} мм</strong> до <strong>{optimalL.toFixed(1)} мм</strong>.
                    </p>
                </div>
            )}
        </>
    );
};

   // Функция расчёта для схемы 5zh по методике ГОСТ
   const calculateScheme5zh = (Φ: number, K: number, D: number, d: number, log: { steps: string[], resultsData: Record<string, any> }) => {
       const m = d / D;
       const C = Math.max((2 * Φ) / K, 4);

       log.steps.push(`Расчёт основных параметров:`);
       log.steps.push(`  m = d / D = ${d} / ${D} = ${m.toFixed(4)}`);
       log.steps.push(`  C = max(2Φ/K, 4) = max(${(2 * Φ).toFixed(2)}/${K}, 4) = ${C.toFixed(4)}`);

       // Минимальное требуемое расстояние f
       const f_min_required = 0.5 * C * (1 - m) * D;
       log.steps.push(`  Минимальное требуемое f = 0,5C(1 - m)D = 0,5 * ${C.toFixed(4)} * (1 - ${m.toFixed(4)}) * ${D} = ${f_min_required.toFixed(1)} мм`);

       // Проверка возможности размещения источника внутри трубы
       if (f_min_required > d) {
           log.steps.push(`  Условие не выполняется: f (${f_min_required.toFixed(1)} мм) > d (${d} мм)`);
           return (
               <div className="text-red-700 bg-red-100 p-4 rounded-lg">
                   <p className="font-bold">❌ Условие не выполняется</p>
                   <p>f ≥ {f_min_required.toFixed(1)} мм &gt; d = {d} мм</p>
                   <p className="mt-2">Необходимо использовать источник с меньшими размерами фокусного пятна.</p>
               </div>
           );
       }

       log.steps.push(`  Условие выполнено: f (${f_min_required.toFixed(1)} мм) ≤ d (${d} мм)`);

       // Расчёт вспомогательного коэффициента r
       const numerator = 0.25 * Math.pow(C, 2) * (1 - Math.pow(m, 2));
       const denominator = Math.pow(m, 2) * (C + 1);
       const r = Math.sqrt(1 - numerator / denominator);

       log.steps.push(`  Расчёт коэффициента r:`);
       log.steps.push(`    r = √(1 - (0,25⋅C²(1 - m²))/(m²(C + 1)))`);
       log.steps.push(`    r = √(1 - (0,25⋅${C.toFixed(4)}²(1 - ${m.toFixed(4)}²))/(${m.toFixed(4)}²(${C.toFixed(4)} + 1)))`);
       log.steps.push(`    r = √(1 - ${numerator.toFixed(4)} / ${denominator.toFixed(4)})`);
       log.steps.push(`    r = √(1 - ${(numerator / denominator).toFixed(4)})`);
       log.steps.push(`    r = √(${(1 - numerator / denominator).toFixed(4)}) = ${r.toFixed(4)}`);

       // Поиск минимального количества экспозиций N
       let optimalN = Infinity;
       let optimalN_for_n = 0;

       log.steps.push(`  Поиск минимального количества экспозиций N:`);

       for (let n = 1; n <= 5; n++) {
           const angle1 = Math.asin(r * m) * 180 / Math.PI;
           const angle2 = Math.asin(r * m / (2 * n - m)) * 180 / Math.PI;

           const N = 180 / (angle1 + angle2); // ИСПРАВЛЕНИЕ: заменил - на +
           const roundedN = Math.ceil(N);

           log.steps.push(`    n = ${n}: N ≥ 180° / (arcsin(rm) + arcsin(rm/(2n - m)))`); // ИСПРАВЛЕНИЕ: заменил - на +
           log.steps.push(`        = 180° / (${angle1.toFixed(2)}° + ${angle2.toFixed(2)}°)`);
           log.steps.push(`        = 180° / ${(angle1 + angle2).toFixed(2)}° = ${N.toFixed(2)} → ${roundedN} экспозиций`);

           if (roundedN < optimalN) {
               optimalN = roundedN;
               optimalN_for_n = n;
           }
       }

       if (optimalN === Infinity) {
           log.steps.push(`  Решение не найдено для n от 1 до 5`);
           return (
               <div className="text-amber-700 bg-amber-100 p-4 rounded-lg">
                   <p className="font-bold">⚠️ Решение не найдено</p>
                   <p>Для заданных параметров не удалось найти решение, удовлетворяющее условиям ГОСТ.</p>
                   <p className="mt-2">Рекомендуется использовать источник с меньшим фокусным пятном.</p>
               </div>
           );
       }

       const angle = 360 / optimalN;
       const L = (Math.PI * D) / optimalN;

       log.steps.push(`  Оптимальное решение: n = ${optimalN_for_n}, N = ${optimalN} экспозиций`);
       log.steps.push(`  Угол между экспозициями: 360° / ${optimalN} = ${angle.toFixed(1)}°`);
       log.steps.push(`  Длина участка L: π * ${D} / ${optimalN} = ${L.toFixed(0)} мм`);

       log.resultsData = {
           'Коэффициент C': C.toFixed(2),
           'Минимальное расстояние f': `${f_min_required.toFixed(1)} мм`,
           'Коэффициент r': r.toFixed(4),
           'Экспозиций N': optimalN,
           'Угол между экспозициями': `${angle.toFixed(1)}°`,
           'Длина участка L': `${L.toFixed(0)} мм`,
           'Геометрический параметр n': optimalN_for_n
       };

       return (
           <>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   <ResultItem label="Коэффициент C:" value={C.toFixed(2)} />
                   <ResultItem label="Минимальное расстояние f:" value={`${f_min_required.toFixed(1)} мм`} />
                   <ResultItem label="Коэффициент r:" value={r.toFixed(4)} />
                   <ResultItem label="Экспозиций N:" value={optimalN} />
                   <ResultItem label="Угол между экспозициями:" value={`${angle.toFixed(1)}°`} />
                   <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
               </div>

               <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                   <p className="text-blue-800 text-sm font-medium">📝 Примечание для схемы 3ж</p>
                   <p className="text-blue-700 text-sm mt-1">
                       Для схемы черт. 3ж (5ж по ГОСТ 7512-82) определяют максимально возможное (исходя из внутреннего диаметра контролируемого изделия и размеров радиационной или коллимирующей головки гамма-дефектоскопа или размеров излучателя рентгеновского аппарата) расстояние f (по диаметру изделия) которое должно быть не менее величины рассчитанного f.
                   </p>
               </div>
           </>
       );
   };

    // Основная функция расчёта
    const calculate = () => {
        const Φ = parseFloat(inputs.d_focus);
        const s = parseFloat(inputs.h_thickness);
        const K = parseFloat(inputs.z_sensitivity);
        const D = parseFloat(inputs.d_outer);
        const d = parseFloat(inputs.d_inner);
        const l = parseFloat(inputs.film_length);

        // Валидация входных данных
        if (isNaN(Φ) || isNaN(K) || Φ <=0 || K<=0) {
            setAlertMessage('Пожалуйста, заполните все обязательные поля корректными положительными числовыми значениями.');
            return;
        }

        // Для схем, где используется радиационная толщина, проверяем её корректность
        if (!isThicknessInputDisabled && (isNaN(s) || s <= 0)) {
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

        // Для схемы 5б проверяем длину снимка
        if (inputs.scheme === '5b') {
            if (isNaN(l) || l <= 0) {
                setAlertMessage('Пожалуйста, введите длину снимка l.');
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

        let resultNode: ReactNode = null;

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

                // ИСПРАВЛЕННАЯ ФОРМУЛА: 0,7c(D-d)
                const f = 0.7 * C * (D - d);
                log.steps.push(`Расчёт f: f = 0,7 * C * (D - d) = 0,7 * ${C.toFixed(4)} * (${D} - ${d}) = ${f.toFixed(3)} мм`);

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
                const L = (Math.PI * D) / N;
                log.resultsData = { f: `${f.toFixed(1)} мм`, N, 'Угол': `${angle.toFixed(0)}°`, L: `${L.toFixed(0)} мм` };
                resultNode = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ResultItem label="Коэфф. C:" value={C.toFixed(2)} />
                        <ResultItem label="Расстояние от источника до поверхности сварного шва f: не менее" value={`${f.toFixed(1)} мм`} />
                        <ResultItem label="Экспозиций N:" value={N} />
                        <ResultItem label="Угол между экспозициями:" value={`${angle.toFixed(0)}°`} />
                        <ResultItem label="Длина участка L:" value={`${L.toFixed(0)} мм`} />
                    </div>
                );
                break;
            }

            case '5b': {
                // Схема 5б - трубы с другим размещением (новая методика по ГОСТ 7512-82)
                resultNode = calculateScheme5b(Φ, K, D, d, l, log);
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
                // Схема 5ж - для труб с внутренним размещением (новая методика по ГОСТ)
                resultNode = calculateScheme5zh(Φ, K, D, d, log);
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
                        disabled={isThicknessInputDisabled}
                        placeholder={isThicknessInputDisabled ? "не используется" : "введите числовое значение"}
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
                        placeholder={isDiameterInputsDisabled ? "не используется" : "введите числовое значение"}
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
                        placeholder={isDiameterInputsDisabled ? "не используется" : "введите числовое значение"}
                    />
                    <InputField
                        label="Длина снимка l, мм"
                        name="film_length"
                        type="number"
                        step="1"
                        min="1"
                        value={inputs.film_length}
                        onChange={handleChange}
                        disabled={!isFilmLengthInputActive}
                        placeholder={!isFilmLengthInputActive ? "не используется" : "введите длину снимка"}
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