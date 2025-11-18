import React, { useState } from 'react';
import { Calculator, RotateCcw, Ruler } from 'lucide-react';

const GeometricUnsharpnessCalculatorPage = () => {
  const [inputs, setInputs] = useState({
    focus_size: '2.0',
    object_to_detector: '10',
    focus_distance: '700',
    sensitivity: '', // необязательное поле
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);

  const calculateUnsharpness = (focusSize: number, objectToDetector: number, focusDistance: number) => {
    if (focusDistance <= objectToDetector) return null;
    const numerator = focusSize * objectToDetector;
    const denominator = focusDistance - objectToDetector;
    return numerator / denominator;
  };

  const checkGOSTCompliance = (unsharpness: number, sensitivity?: number) => {
    if (!sensitivity) return null;

    let maxAllowedUnsharpness: number;

    if (sensitivity <= 2) {
      // При чувствительности до 2 мм: нерезкость не должна превышать половины чувствительности
      maxAllowedUnsharpness = sensitivity / 2;
    } else {
      // При чувствительности более 2 мм: нерезкость не должна превышать 1 мм
      maxAllowedUnsharpness = 1.0;
    }

    return unsharpness <= maxAllowedUnsharpness;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const focusSize = parseFloat(inputs.focus_size);
    const objectToDetector = parseFloat(inputs.object_to_detector);
    const focusDistance = parseFloat(inputs.focus_distance);
    const sensitivity = inputs.sensitivity ? parseFloat(inputs.sensitivity) : undefined;

    if (isNaN(focusSize) || focusSize <= 0) newErrors.focus_size = 'Размер фокуса должен быть > 0';
    if (isNaN(objectToDetector) || objectToDetector <= 0) newErrors.object_to_detector = 'Расстояние должно быть > 0';
    if (isNaN(focusDistance) || focusDistance <= 0) newErrors.focus_distance = 'Фокусное расстояние должно быть > 0';

    if (sensitivity !== undefined && (isNaN(sensitivity) || sensitivity <= 0)) {
      newErrors.sensitivity = 'Чувствительность должна быть > 0';
    }

    if (!newErrors.focus_distance && focusDistance <= objectToDetector) {
      newErrors.focus_distance = 'Фокусное расстояние должно быть больше расстояния объект-приёмник';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(null);
    if (!validate()) return;

    const focusSize = parseFloat(inputs.focus_size);
    const objectToDetector = parseFloat(inputs.object_to_detector);
    const focusDistance = parseFloat(inputs.focus_distance);
    const sensitivity = inputs.sensitivity ? parseFloat(inputs.sensitivity) : undefined;

    const unsharpness = calculateUnsharpness(focusSize, objectToDetector, focusDistance);

    if (unsharpness === null) {
      setErrors({ focus_distance: 'Невозможно рассчитать: F должно быть > d' });
      return;
    }

    const gostCompliance = sensitivity ? checkGOSTCompliance(unsharpness, sensitivity) : null;

    setResults({
      focusSize,
      objectToDetector,
      focusDistance,
      sensitivity,
      unsharpness: unsharpness.toFixed(3),
      gostCompliance,
      maxAllowedUnsharpness: sensitivity ? (sensitivity <= 2 ? sensitivity / 2 : 1.0) : null
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleReset = () => {
    setResults(null);
    setErrors({});
    setInputs({
      focus_size: '2.0',
      object_to_detector: '10',
      focus_distance: '700',
      sensitivity: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
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
              <label htmlFor="focus_size" className="text-sm font-medium">Размер фокусного пятна (f), мм *</label>
              <input
                type="number"
                name="focus_size"
                value={inputs.focus_size}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 2.0"
              />
              {errors.focus_size && <p className="text-red-500 text-xs mt-1">{errors.focus_size}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Типичные значения: 1.0-4.0 мм для рентгеновских аппаратов
              </p>
            </div>

            <div>
              <label htmlFor="object_to_detector" className="text-sm font-medium">Расстояние объект-приёмник (d), мм *</label>
              <input
                type="number"
                name="object_to_detector"
                value={inputs.object_to_detector}
                onChange={handleChange}
                step="1"
                min="1"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 10"
              />
              {errors.object_to_detector && <p className="text-red-500 text-xs mt-1">{errors.object_to_detector}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Расстояние от объекта контроля до детектора (плёнки)
              </p>
            </div>

            <div>
              <label htmlFor="focus_distance" className="text-sm font-medium">Фокусное расстояние (F), мм *</label>
              <input
                type="number"
                name="focus_distance"
                value={inputs.focus_distance}
                onChange={handleChange}
                step="10"
                min="100"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 700"
              />
              {errors.focus_distance && <p className="text-red-500 text-xs mt-1">{errors.focus_distance}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Расстояние от источника излучения до детектора
              </p>
            </div>

            <div>
              <label htmlFor="sensitivity" className="text-sm font-medium">
                Требуемая чувствительность, мм
                <span className="text-slate-400 ml-1">(необязательно)</span>
              </label>
              <input
                type="number"
                name="sensitivity"
                value={inputs.sensitivity}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md mt-1"
                placeholder="Например: 2.0"
              />
              {errors.sensitivity && <p className="text-red-500 text-xs mt-1">{errors.sensitivity}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Для проверки соответствия ГОСТ 7512-82
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

                  {results.sensitivity && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Требуемая чувствительность:</span>
                        <span className="font-semibold">{results.sensitivity} мм</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Допустимая нерезкость по ГОСТ:</span>
                        <span className="font-semibold">{results.maxAllowedUnsharpness.toFixed(3)} мм</span>
                      </div>
                      <div className={`text-sm font-medium px-3 py-2 rounded-lg text-center mt-3 ${
                        results.gostCompliance
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {results.gostCompliance
                          ? 'Uг соответствует требованиям ГОСТ 7512-85'
                          : 'Uг не соответствует требованиям ГОСТ 7512-85'
                        }
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <p><strong>Формула:</strong> Uг = ({results.focusSize} × {results.objectToDetector}) / ({results.focusDistance} - {results.objectToDetector})</p>
                </div>
              </div>
            </div>
          )}

          {/* Блок с нормативами */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold mb-3">Нормативные требования ГОСТ 7512-82</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <span>
                  <strong>Соответствие:</strong> Геометрическая нерезкость изображений дефектов на снимках при расположении пленки
                  вплотную к контролируемому сварному соединению не должна превышать половины требуемой
                  чувствительности контроля при чувствительности до 2 мм и 1 мм — при чувствительности более 2 мм
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeometricUnsharpnessCalculatorPage;