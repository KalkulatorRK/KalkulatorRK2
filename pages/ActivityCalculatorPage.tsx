import React, { useState, useEffect, useRef } from 'react';
import { Radiation, Calculator, RotateCcw, Printer, Download, EyeOff } from 'lucide-react';

// Constants
const SE75_HALF_LIFE = 119.78;
const IR192_HALF_LIFE = 73.83;
const CONVERSION_FACTOR_IR192 = 0.34;
const CONVERSION_FACTOR_SE75 = 0.27;
const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

// Helper functions
const calculateActivity = (sourceType: 'Se-75' | 'Ir-192', activity: number, releaseDate: Date, targetDate: Date) => {
    const halfLife = sourceType === "Se-75" ? SE75_HALF_LIFE : IR192_HALF_LIFE;
    const deltaDays = (targetDate.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
    const remainingActivity = activity * Math.pow(0.5, deltaDays / halfLife);
    const raEquiv = remainingActivity * (sourceType === "Se-75" ? CONVERSION_FACTOR_SE75 : CONVERSION_FACTOR_IR192);
    return { remainingActivity, raEquiv };
};

const formatDateWithYear = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const formatDateWithTextMonth = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    return `${day} ${monthNames[date.getMonth()]}`;
};

interface CalculationData {
    sourceType: 'Se-75' | 'Ir-192';
    activity: number;
    releaseDate: Date;
    startDate: Date;
    endDate: Date;
    sourceNumber: string;
    deviceNumber: string;
}

interface TableRowData {
    date: string;
    activity: string;
    activityCi: string;
}

type GroupedColumns = Array<Array<Array<TableRowData>>>;


const ActivityCalculatorPage = () => {
    const [inputs, setInputs] = useState({
        source_number: '',
        device_number: '',
        source_type: 'Se-75' as 'Se-75' | 'Ir-192',
        activity: 10,
        release_date: '',
        start_date: '',
        end_date: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [results, setResults] = useState<any>(null);
    const [tableData, setTableData] = useState<GroupedColumns | null>(null);

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const today = new Date();
        const releaseDate = new Date();
        releaseDate.setDate(today.getDate() - 30);
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);

        setInputs(prev => ({
            ...prev,
            release_date: releaseDate.toISOString().split('T')[0],
            start_date: today.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
        }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!inputs.source_number) newErrors.source_number = 'Обязательное поле';
        if (!inputs.device_number) newErrors.device_number = 'Обязательное поле';
        if (inputs.activity <= 0) newErrors.activity = 'Активность должна быть > 0';
        
        const releaseDate = new Date(inputs.release_date);
        const startDate = new Date(inputs.start_date);
        const endDate = new Date(inputs.end_date);

        if (releaseDate > new Date()) newErrors.release_date = 'Дата выпуска не может быть в будущем';
        if (startDate < releaseDate) newErrors.start_date = 'Дата начала не может быть раньше даты выпуска';
        if (endDate < startDate) newErrors.end_date = 'Дата окончания не может быть раньше даты начала';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setResults(null);
        setTableData(null);
        if (!validate()) return;

        const data: CalculationData = {
            sourceType: inputs.source_type,
            sourceNumber: inputs.source_number,
            deviceNumber: inputs.device_number,
            activity: Number(inputs.activity),
            releaseDate: new Date(inputs.release_date),
            startDate: new Date(inputs.start_date),
            endDate: new Date(inputs.end_date),
        };

        const startResult = calculateActivity(data.sourceType, data.activity, data.releaseDate, data.startDate);
        const endResult = calculateActivity(data.sourceType, data.activity, data.releaseDate, data.endDate);

        setResults({
            ...data,
            startActivity: startResult.raEquiv.toFixed(2),
            endActivity: endResult.raEquiv.toFixed(2),
        });
    };

    const handleGenerateTable = () => {
        if (!results) return;
        
        const { sourceType, activity, releaseDate, startDate, endDate } = results;
        const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const rowsPerColumn = 40;
        const columnsPerRow = 5;

        const allData: TableRowData[] = Array.from({ length: daysCount }, (_, i) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const result = calculateActivity(sourceType, activity, releaseDate, currentDate);
            return {
                date: formatDateWithTextMonth(currentDate),
                activity: result.raEquiv.toFixed(2),
                activityCi: result.remainingActivity.toFixed(2),
            };
        });

        const totalColumns = Math.ceil(daysCount / rowsPerColumn);
        const grouped: GroupedColumns = [];

        for (let colGroup = 0; colGroup < Math.ceil(totalColumns / columnsPerRow); colGroup++) {
            const columnRow: Array<Array<TableRowData>> = [];
            for (let col = 0; col < Math.min(columnsPerRow, totalColumns - colGroup * columnsPerRow); col++) {
                const colIndex = colGroup * columnsPerRow + col;
                const startIndex = colIndex * rowsPerColumn;
                const endIndex = Math.min(startIndex + rowsPerColumn, daysCount);
                columnRow.push(allData.slice(startIndex, endIndex));
            }
            grouped.push(columnRow);
        }
        setTableData(grouped);
    };

    const handleDownloadCsv = () => {
        if (!tableData) return;
        const allRows = tableData.flat(2);
        const headers = ['Дата', 'Активность (гр.-экв. радия)', 'Активность (Ки)'];
        const csvContent = [headers.join(','), ...allRows.map(row => `${row.date},${row.activity},${row.activityCi}`)].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `activity_table_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setResults(null);
        setTableData(null);
        setErrors({});
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Калькулятор активности источника</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Расчёт для источников Иридий-192 и Селен-75</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="source_number" className="text-sm font-medium">Номер источника</label>
                                <input type="text" name="source_number" value={inputs.source_number} onChange={handleChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"/>
                                {errors.source_number && <p className="text-red-500 text-xs mt-1">{errors.source_number}</p>}
                            </div>
                            <div>
                                <label htmlFor="device_number" className="text-sm font-medium">Номер дефектоскопа</label>
                                <input type="text" name="device_number" value={inputs.device_number} onChange={handleChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"/>
                                {errors.device_number && <p className="text-red-500 text-xs mt-1">{errors.device_number}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Тип источника</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <label className={`p-3 text-center rounded-md cursor-pointer transition-colors ${inputs.source_type === 'Se-75' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'}`}>
                                    <input type="radio" name="source_type" value="Se-75" checked={inputs.source_type === 'Se-75'} onChange={handleChange} className="sr-only" />
                                    Se-75
                                </label>
                                <label className={`p-3 text-center rounded-md cursor-pointer transition-colors ${inputs.source_type === 'Ir-192' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'}`}>
                                    <input type="radio" name="source_type" value="Ir-192" checked={inputs.source_type === 'Ir-192'} onChange={handleChange} className="sr-only" />
                                    Ir-192
                                </label>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="activity" className="text-sm font-medium">Паспортная активность (Ки)</label>
                                <input type="number" name="activity" value={inputs.activity} onChange={handleChange} step="0.01" min="0.01" className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"/>
                                {errors.activity && <p className="text-red-500 text-xs mt-1">{errors.activity}</p>}
                            </div>
                            <div>
                                <label htmlFor="release_date" className="text-sm font-medium">Дата выпуска</label>
                                <input type="date" name="release_date" value={inputs.release_date} onChange={handleChange} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"/>
                                {errors.release_date && <p className="text-red-500 text-xs mt-1">{errors.release_date}</p>}
                            </div>
                        </div>
                         <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">Период расчёта</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start_date" className="text-sm font-medium">С</label>
                                    <input type="date" name="start_date" value={inputs.start_date} onChange={handleChange} className="w-full p-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"/>
                                     {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label htmlFor="end_date" className="text-sm font-medium">По</label>
                                    <input type="date" name="end_date" value={inputs.end_date} onChange={handleChange} className="w-full p-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md"/>
                                     {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"><Calculator size={18}/>Рассчитать</button>
                            <button type="button" onClick={handleReset} className="bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"><RotateCcw size={18}/>Сбросить</button>
                        </div>
                    </form>
                </div>

                <div className="space-y-4">
                    {results && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                            <h2 className="text-xl font-bold mb-4">Результаты расчёта</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Тип источника:</span><span className="font-semibold">{results.sourceType}</span></div>
                                <div className="flex justify-between"><span>Номер источника:</span><span className="font-semibold">{results.sourceNumber}</span></div>
                                <div className="flex justify-between"><span>Номер дефектоскопа:</span><span className="font-semibold">{results.deviceNumber}</span></div>
                                <div className="flex justify-between"><span>Паспортная активность:</span><span className="font-semibold">{results.activity} Ки</span></div>
                                <div className="flex justify-between"><span>Дата выпуска:</span><span className="font-semibold">{formatDateWithYear(results.releaseDate)}</span></div>
                                <div className="flex justify-between"><span>Период:</span><span className="font-semibold">{formatDateWithYear(results.startDate)} - {formatDateWithYear(results.endDate)}</span></div>
                                <div className="flex justify-between border-t pt-2 mt-2 border-slate-200 dark:border-slate-700"><span>Активность на начало:</span><span className="font-bold text-blue-600 dark:text-blue-400">{results.startActivity} гр.-экв. радия</span></div>
                                <div className="flex justify-between"><span>Активность на конец:</span><span className="font-bold text-blue-600 dark:text-blue-400">{results.endActivity} гр.-экв. радия</span></div>
                            </div>
                            <button onClick={handleGenerateTable} className="mt-4 w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition">Создать таблицу для печати</button>
                        </div>
                    )}
                </div>
            </div>

            {tableData && (
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-fade-in">
                    <div className="flex flex-wrap gap-2 mb-4 no-print">
                        <button onClick={handlePrint} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"><Printer size={18}/>Печать</button>
                        <button onClick={handleDownloadCsv} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"><Download size={18}/>Скачать CSV</button>
                        <button onClick={() => setTableData(null)} className="flex-1 bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"><EyeOff size={18}/>Скрыть таблицу</button>
                    </div>
                    <div ref={printRef} id="print-area">
                        <div className="print-only">
                             <div className="text-center mb-2">
                                <h2 className="text-base font-bold mb-1">Таблица активности источника</h2>
                                <div className="text-xs">
                                    <p>
                                        <strong>Дефектоскоп:</strong> {results.deviceNumber} | <strong>Источник №:</strong> {results.sourceNumber} ({results.sourceType})
                                    </p>
                                    <p>
                                        <strong>Паспорт:</strong> {results.activity} Ки от {formatDateWithYear(results.releaseDate)} | <strong>Период:</strong> {formatDateWithYear(results.startDate)} - {formatDateWithYear(results.endDate)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {tableData.map((columnRow, i) => (
                            <div key={i} className="md:flex md:gap-4 print:flex print:gap-2">
                                {columnRow.map((column, j) => (
                                    <div key={j} className="flex-1 mb-4 md:mb-0 print:mb-0">
                                        <table className="w-full border-collapse text-xs print:text-[8px]">
                                            <thead>
                                                <tr className="bg-slate-200 dark:bg-slate-700">
                                                    <th className="border p-1 font-semibold text-left" style={{width: '40%'}}>Дата</th>
                                                    <th className="border p-1 font-semibold text-right" style={{width: '30%'}}>Активность (гр.-экв. радия)</th>
                                                    <th className="border p-1 font-semibold text-right" style={{width: '30%'}}>Активность (Ки)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {column.map((row, k) => (
                                                    <tr key={k} className={`border-b dark:border-slate-700 ${k % 2 !== 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                                        <td className="p-1 border-x dark:border-slate-700">{row.date}</td>
                                                        <td className="p-1 border-x dark:border-slate-700 text-right font-mono">{row.activity}</td>
                                                        <td className="p-1 border-x dark:border-slate-700 text-right font-mono">{row.activityCi}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                    .print-only { display: block !important; }
                    .print\\:text-\\[8px\\] { font-size: 8px; }
                    .print\\:flex { display: flex; }
                    .print\\:gap-2 { gap: 0.5rem; }
                    .print\\:mb-0 { margin-bottom: 0; }
                    .bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                }
                .print-only { display: none; }
            `}</style>
        </div>
    );
};

export default ActivityCalculatorPage;