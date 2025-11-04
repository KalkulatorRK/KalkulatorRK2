import React, { useState, useEffect, useRef } from 'react';
import { Calculator, RotateCcw, Printer, Download, EyeOff, Ruler } from 'lucide-react';

interface CalculationData {
  focusSize: number;      // f - размер фокусного пятна (мм)
  objectToDetector: number; // d - расстояние объект-приёмник (мм)
  focusDistance: number;  // F - фокусное расстояние (мм)
}

interface TableRowData {
  focusSize: string;
  objectToDetector: string;
  focusDistance: string;
  unsharpness: string;
}

type GroupedColumns = Array<Array<Array<TableRowData>>>;

const GeometricUnsharpnessCalculatorPage = () => {
  const [inputs, setInputs] = useState({
    focus_size: '2.0',
    object_to_detector: '10',
    focus_distance: '700',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [tableData, setTableData] = useState<GroupedColumns | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const calculateUnsharpness = (focusSize: number, objectToDetector: number, focusDistance: number) => {
    if (focusDistance <= objectToDetector) return null;
    const numerator = focusSize * objectToDetector;
    const denominator = focusDistance - objectToDetector;
    return numerator / denominator;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const focusSize = parseFloat(inputs.focus_size);
    const objectToDetector = parseFloat(inputs.object_to_detector);
    const focusDistance = parseFloat(inputs.focus_distance);

    if (isNaN(focusSize) || focusSize <= 0) newErrors.focus_size = 'Размер фокуса должен быть > 0';
    if (isNaN(objectToDetector) || objectToDetector <= 0) newErrors.object_to_detector = 'Расстояние должно быть > 0';
    if (isNaN(focusDistance) || focusDistance <= 0) newErrors.focus_distance = 'Фокусное расстояние должно быть > 0';

    if (!newErrors.focus_distance && focusDistance <= objectToDetector) {
      newErrors.focus_distance = 'Фокусное расстояние должно быть больше расстояния объект-приёмник';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(null);
    setTableData(null);
    if (!validate()) return;

    const focusSize = parseFloat(inputs.focus_size);
    const objectToDetector = parseFloat(inputs.object_to_detector);
    const focusDistance = parseFloat(inputs.focus_distance);

    const unsharpness = calculateUnsharpness(focusSize, objectToDetector, focusDistance);

    if (unsharpness === null) {
      setErrors({ focus_distance: 'Невозможно рассчитать: F должно быть > d' });
      return;
    }

    setResults({
      focusSize,
      objectToDetector,
      focusDistance,
      unsharpness: unsharpness.toFixed(3),
      interpretation: getInterpretation(unsharpness)
    });
  };

  const getInterpretation = (unsharpness: number) => {
    if (unsharpness < 0.2) return 'Отличное качество';
    if (unsharpness < 0.4) return 'Приемлемое качество';
    return 'Требует оптимизации';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleGenerateTable = () => {
    if (!results) return;

    const baseFocusSize = results.focusSize;
    const baseObjectToDetector = results.objectToDetector;
    const baseFocusDistance = results.focusDistance;

    const variations = [-0.5, -0.2, 0, 0.2, 0.5];
    const allData: TableRowData[] = [];

    // Вариации по размеру фокусного пятна
    variations.forEach(variation => {
      const focusSize = baseFocusSize + variation;
      if (focusSize > 0) {
        const unsharpness = calculateUnsharpness(focusSize, baseObjectToDetector, baseFocusDistance);
        if (unsharpness !== null) {
          allData.push({
            focusSize: focusSize.toFixed(1),
            objectToDetector: baseObjectToDetector.toString(),
            focusDistance: baseFocusDistance.toString(),
            unsharpness: unsharpness.toFixed(3)
          });
        }
      }
    });

    // Вариации по расстоянию объект-детектор
    variations.forEach(variation => {
      const objectToDetector = baseObjectToDetector + variation * 5;
      if (objectToDetector > 0 && objectToDetector < baseFocusDistance) {
        const unsharpness = calculateUnsharpness(baseFocusSize, objectToDetector, baseFocusDistance);
        if (unsharpness !== null) {
          allData.push({
            focusSize: baseFocusSize.toFixed(1),
            objectToDetector: objectToDetector.toString(),
            focusDistance: baseFocusDistance.toString(),
            unsharpness: unsharpness.toFixed(3)
          });
        }
      }
    });

    // Вариации по фокусному расстоянию
    variations.forEach(variation => {
      const focusDistance = baseFocusDistance + variation * 100;
      if (focusDistance > baseObjectToDetector) {
        const unsharpness = calculateUnsharpness(baseFocusSize, baseObjectToDetector, focusDistance);
        if (unsharpness !== null) {
          allData.push({
            focusSize: baseFocusSize.toFixed(1),
            objectToDetector: baseObjectToDetector.toString(),
            focusDistance: focusDistance.toString(),
            unsharpness: unsharpness.toFixed(3)
          });
        }
      }
    });

    // Группировка для таблицы
    const rowsPerColumn = 15;
    const columnsPerRow = 3;
    const totalColumns = Math.ceil(allData.length / rowsPerColumn);
    const grouped: GroupedColumns = [];

    for (let colGroup = 0; colGroup < Math.ceil(totalColumns / columnsPerRow); colGroup++) {
      const columnRow: Array<Array<TableRowData>> = [];
      for (let col = 0; col < Math.min(columnsPerRow, totalColumns - colGroup * columnsPerRow); col++) {
        const colIndex = colGroup * columnsPerRow + col;
        const startIndex = colIndex * rowsPerColumn;
        const endIndex = Math.min(startIndex + rowsPerColumn, allData.length);
        columnRow.push(allData.slice(startIndex, endIndex));
      }
      grouped.push(columnRow);
    }
    setTableData(grouped);
  };

  const handleDownloadCsv = () => {
    if (!tableData) return;
    const allRows = tableData.flat(2);
    const headers = ['Размер фокуса (мм)', 'Расстояние объект-детектор (мм)', 'Фокусное расстояние (мм)', 'Геометрическая нерезкость (мм)'];
    const csvContent = [headers.join(','), ...allRows.map(row =>
      `${row.focusSize},${row.objectToDetector},${row.focusDistance},${row.unsharpness}`
    )].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `unsharpness_table_${new Date().toISOString().slice(0, 10)}.csv`);
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
    setInputs({
      focus_size: '2.0',
      object_to_detector: '10',
      focus_distance: '700',
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Калькулятор геометрической нерезкости</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Расчёт по формуле: Uг = (f × d) / (F - d)</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Ruler size={16} />
                Параметры контроля
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                f - размер фокусного пятна, d - расстояние объект-приёмник, F - фокусное расстояние
              </p>
            </div>

            <div>
              <label htmlFor="focus_size" className="text-sm font-medium">Размер фокусного пятна (f), мм</label>
              <input
                type="number"
                name="focus_size"
                value={inputs.focus_size}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 2.0"
              />
              {errors.focus_size && <p className="text-red-500 text-xs mt-1">{errors.focus_size}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Типичные значения: 1.0-4.0 мм для рентгеновских аппаратов
              </p>
            </div>

            <div>
              <label htmlFor="object_to_detector" className="text-sm font-medium">Расстояние объект-приёмник (d), мм</label>
              <input
                type="number"
                name="object_to_detector"
                value={inputs.object_to_detector}
                onChange={handleChange}
                step="1"
                min="1"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 10"
              />
              {errors.object_to_detector && <p className="text-red-500 text-xs mt-1">{errors.object_to_detector}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Расстояние от объекта контроля до детектора (плёнки)
              </p>
            </div>

            <div>
              <label htmlFor="focus_distance" className="text-sm font-medium">Фокусное расстояние (F), мм</label>
              <input
                type="number"
                name="focus_distance"
                value={inputs.focus_distance}
                onChange={handleChange}
                step="10"
                min="100"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 700"
              />
              {errors.focus_distance && <p className="text-red-500 text-xs mt-1">{errors.focus_distance}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Расстояние от источника излучения до детектора
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Calculator size={18} />
                Рассчитать
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Сбросить
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {results && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Результаты расчёта</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Размер фокусного пятна (f):</span>
                  <span className="font-semibold">{results.focusSize} мм</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Расстояние объект-приёмник (d):</span>
                  <span className="font-semibold">{results.objectToDetector} мм</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Фокусное расстояние (F):</span>
                  <span className="font-semibold">{results.focusDistance} мм</span>
                </div>
                <div className="border-t pt-3 mt-2 border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Геометрическая нерезкость:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {results.unsharpness} мм
                    </span>
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full text-center ${
                    results.interpretation === 'Отличное качество'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : results.interpretation === 'Приемлемое качество'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {results.interpretation}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <p><strong>Формула:</strong> Uг = ({results.focusSize} × {results.objectToDetector}) / ({results.focusDistance} - {results.objectToDetector})</p>
                </div>
              </div>
              <button
                onClick={handleGenerateTable}
                className="mt-4 w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition"
              >
                Создать таблицу вариаций для печати
              </button>
            </div>
          )}

          {/* Блок с нормативами */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold mb-3">Нормативные требования ГОСТ 7512-85</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span><strong>{""}</strong> - геометрическая нерезкосгь изображений дефектов на снимках при расположении пленки
                                                      вплотную к контролируемому сварному соединению не должна превышать половины требуемой
                                                      чувствительности контроля при чувствительности до 2 мм и 1 мм — при чувствительности более 2 мм;</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span><strong></strong> - относительное увеличение размеров изображений дефектов, расположенных со стороны
                                          источника излучения (по отношению к дефектам, расположенным со стороны пленки), не должно
                                          превышать 1,25;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tableData && (
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-fade-in">
          <div className="flex flex-wrap gap-2 mb-4 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              Печать
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Скачать CSV
            </button>
            <button
              onClick={() => setTableData(null)}
              className="flex-1 bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
            >
              <EyeOff size={18} />
              Скрыть таблицу
            </button>
          </div>
          <div ref={printRef} id="print-area">
            <div className="print-only">
              <div className="text-center mb-4">
                <h2 className="text-base font-bold mb-1">Таблица геометрической нерезкости</h2>
                <div className="text-xs">
                  <p>Расчёт по формуле: Uг = (f × d) / (F - d)</p>
                  <p>Базовые параметры: f = {results.focusSize} мм, d = {results.objectToDetector} мм, F = {results.focusDistance} мм</p>
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
                          <th className="border p-1 font-semibold text-center">f (мм)</th>
                          <th className="border p-1 font-semibold text-center">d (мм)</th>
                          <th className="border p-1 font-semibold text-center">F (мм)</th>
                          <th className="border p-1 font-semibold text-center">Uг (мм)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {column.map((row, k) => (
                          <tr key={k} className={`border-b dark:border-slate-700 ${k % 2 !== 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                            <td className="p-1 border-x dark:border-slate-700 text-center font-mono">{row.focusSize}</td>
                            <td className="p-1 border-x dark:border-slate-700 text-center font-mono">{row.objectToDetector}</td>
                            <td className="p-1 border-x dark:border-slate-700 text-center font-mono">{row.focusDistance}</td>
                            <td className="p-1 border-x dark:border-slate-700 text-center font-mono">{row.unsharpness}</td>
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

export default GeometricUnsharpnessCalculatorPage;