import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Atom, Calculator, FileText, RotateCcw } from 'lucide-react';

// Данные ТУ РГК 1-24
const apparatusData: Record<string, {type: 'П'|'И'; voltage: number; current: number|null; focus: number; thickness: number}> = {
  'МСТ-200':{type:'П',voltage:160,current:5,focus:1.5,thickness:20},
  'Арина-9':{type:'И',voltage:300,current:null,focus:2.5,thickness:50},
  'Арина-7':{type:'И',voltage:250,current:null,focus:2.5,thickness:40}
};

const halfLifeData: Record<string, number> = {
  'Ir-192':74,
  'Co-60':1924,
  'Se-75':120
};

// Номограммы для МСТ-200 (сталь, F=700мм, плёнка D7)
const nomogramsSteelConstantMST200: Record<string, number[]> = {
  '80':[2.5,7.0,5,40.0,7.5,300.0],
  '100':[2.5,2.0,5,5.5,7.5,15.0,10,40.0,15,350.0],
  '120':[2.5,1.2,5,2.25,7.5,3.25,10,9.0,15,38.0,20,150.0,25,650.0],
  '140':[5,1.25,7.5,2.0,10,3.5,15,10.0,20,30.0,25,95.0,30,290.0,35,850.0],
  '160':[7.5,1.25,10,1.8,15,4.5,20,11.0,25,25.0,30,60.0,35,150.0,40,350.0,45,900.0],
  '180':[10,1.0,15,2.3,20,4.8,25,10.0,30,21.0,35,45.0,40,95.0,45,200.0,50,420.0,55,900.0],
  '200':[15,1.5,20,2.8,25,5.0,30,10.0,35,20.0,40,35.0,45,67.0,50,140.0,55,250.2,60,480.0,65,1000.0]
};

// Номограммы для Арина-7 (сталь, F=500мм, плёнки: D7 + Pb 0,027 мм, F8+RCF, F8+NDT1200)
const nomogramsSteelPulseArina7: Record<string, number[]> = {
  'D7':[2.5,0.95,5,1.5,10,3.0,15,6.2,20,15.0],
  'F8+RCF':[2.5,0.24,5,0.32,10,0.7,15,1.6,20,3.2,25,6.8,30,15.0],
  'F8+NDT1200':[5,0.08,10,0.2,15,0.42,20,0.9,25,1.9,30,4.0,35,8.2]
};

// Номограммы для Арина-9 (сталь, F=700мм, плёнки: D7 + Pb 0,027 мм, F8+RCF, F8+NDT1200)
const nomogramsSteelPulseArina9: Record<string, number[]> = {
  'D7':[2.5,1.5,5,2.0,10,3.8,15,7.0,20,13.0],
  'F8+RCF':[2.5,0.36,5,0.49,10,0.9,15,1.8,20,3.0,25,5.6,30,10.0],
  'F8+NDT1200':[5,0.15,10,0.25,15,0.48,20,0.8,25,1.6,30,2.8,35,5.0,40,9.0]
};

// Факторы плёнок из Таблицы 8
const filmFactors: Record<string, Record<string, number>> = {
  constant:{
    'D2':8.7,'D4':2.6,'D5':1.6,'D7':1.0,'D8':0.7,
    'INDUSTREX Flex HR':2.4,'DR детектор':2.2
  },
  pulse:{
    'D2':10.6,'D4':3.1,'D5':1.8,'D7':1.0,'D8':0.7,
    'INDUSTREX Flex HR':2.9,'DR детектор':2.7
  },
  'Ir-192':{
    'D2':9.0,'D4':3.0,'D5':1.5,'D7':1.0,'D8':0.7,
    'INDUSTREX Flex HR':2.7,'DR детектор':2.6,
    'F8+RCF':0.07,'F8+NDT1200':0.035
  },
  'Co-60':{
    'D2':11.4,'D4':3.8,'D5':1.9,'D7':1.0,'D8':0.9,
    'INDUSTREX Flex HR':3.4,'DR детектор':3.3,
    'F8+RCF':0.09,'F8+NDT1200':0.044
  },
  'Se-75':{
    'D2':4.5,'D4':1.8,'D5':1.2,'D7':1.0,'D8':0.6,
    'INDUSTREX Flex HR':1.8,'DR детектор':1.7,
    'F8+RCF':0.04,'F8+NDT1200':0.02
  }
};

// Данные таблицы 7 - фактор экспозиции для плёнки D7
const table7Data = {
  h:[5,6,8,10,12,14,16,18,20,22,24,26,30,32,35,40,45,50,55,60],
  F:[100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000],
  values:[
    [0.5,1.1,1.9,3.0,4.3,5.9,7.7,9.7,12.0,14.5,17.3,20.3,23.5,27.0,30.7,34.7,38.9,43.3,48.0],
    [0.5,1.2,2.1,3.3,4.7,6.4,8.3,10.5,13.0,15.7,18.7,22.0,25.5,29.3,33.3,37.6,42.1,46.9,52.0],
    [0.6,1.4,2.4,3.8,5.4,7.4,9.6,12.2,15.0,18.2,21.6,25.4,29.4,33.8,38.4,43.4,48.6,54.2,60.0],
    [0.6,1.4,2.6,4.0,5.8,7.8,10.2,13.0,16.0,19.4,23.0,27.0,31.4,36.0,41.0,46.3,51.9,57.8,64.0],
    [0.8,1.7,3.0,4.7,6.8,9.2,12.0,15.2,18.8,22.7,27.0,31.7,36.8,42.2,48.0,54.2,60.8,67.7,75.0],
    [0.8,1.9,3.3,5.2,7.5,10.2,13.3,16.9,20.8,25.2,30.0,35.2,40.8,46.9,53.3,60.2,67.5,75.2,83.3],
    [0.9,2.1,3.8,5.9,8.5,11.6,15.1,19.1,23.6,28.6,34.0,40.0,46.3,53.2,60.5,68.3,76.6,85.3,94.6],
    [1.1,2.5,4.5,7.0,10.0,13.7,17.9,22.6,27.9,33.8,40.2,47.1,54.7,62.8,71.4,80.6,90.4,100.7,111.6],
    [1.2,2.7,4.8,7.5,10.8,14.7,19.2,24.3,30.0,36.3,43.2,50.7,58.8,67.6,76.9,86.8,97.3,108.4,120.1],
    [1.4,3.2,5.7,8.9,12.8,17.4,22.7,28.8,35.5,43.0,51.2,60.1,69.6,79.9,91.0,102.7,115.1,128.3,142.1],
    [1.6,3.6,6.3,9.9,14.3,19.4,25.4,32.1,39.7,48.0,57.1,67.0,77.7,89.2,101.5,114.6,128.5,143.2,158.7],
    [1.8,4.1,7.3,11.5,16.5,22.4,29.3,37.1,45.8,55.4,66.0,77.4,89.8,103.1,117.3,132.4,148.4,165.3,183.2],
    [2.4,5.4,9.6,15.0,21.6,29.4,38.5,48.7,60.1,72.7,86.5,101.5,117.8,135.2,153.8,173.7,194.7,216.9,240.3],
    [2.8,6.3,11.3,17.6,25.3,34.5,45.0,57.0,70.3,85.1,101.3,118.9,137.9,158.3,180.1,203.3,227.9,253.9,281.4],
    [3.2,7.3,12.9,20.2,29.0,39.5,51.6,65.3,80.6,97.5,116.1,136.2,158.0,181.4,206.3,232.9,261.2,291.0,322.4],
    [4.8,10.8,19.2,30.1,43.3,58.9,77.0,97.4,120.2,145.5,173.1,203.2,235.7,270.5,307.8,347.5,389.6,434.1,481.0],
    [6.8,15.3,27.3,42.6,61.3,83.5,109.0,138.0,170.3,206.1,245.3,287.9,333.9,383.3,436.1,492.3,551.9,614.9,681.3],
    [8.8,19.8,35.3,55.1,79.3,108.0,141.0,178.5,220.4,266.6,317.3,372.4,431.9,495.8,564.1,636.8,714.0,795.5,881.4],
    [10.0,22.5,40.0,62.6,90.1,122.6,160.1,202.7,250.2,302.8,360.3,422.9,490.4,563.0,640.6,723.1,810.7,903.3,1000.9],
    [11.8,26.6,47.3,73.8,106.3,144.7,189.0,239.3,295.4,357.4,425.3,499.2,578.9,664.6,756.1,853.6,957.0,1066.3,1181.5]
  ]
};

// --- Функции для расчетов ---

/**
 * Линейная интерполяция в номограммах
 */
function interpolateLinear(data: number[], thickness: number): number {
  // Проверка точного совпадения
  for (let i = 0; i < data.length - 1; i += 2) {
    if (thickness === data[i]) {
      return data[i + 1];
    }
  }

  for (let i = 0; i < data.length - 2; i += 2) {
    const t1 = data[i], e1 = data[i+1], t2 = data[i+2], e2 = data[i+3];
    if (thickness >= t1 && thickness <= t2) {
      return e1 + (thickness - t1) / (t2 - t1) * (e2 - e1);
    }
  }
  return thickness < data[0] ? data[1] : data[data.length - 1];
}

/**
 * Интерполяция из номограмм для постоянных аппаратов
 */
function interpolateFromNomogram(nomogramData: Record<string, number[]>, key: string | number, thickness: number): number {
  const data = nomogramData[key.toString()];
  if (!data) {
    console.warn(`Нет данных номограммы для ключа: ${key}`);
    return 1.0;
  }
  return interpolateLinear(data, thickness);
}

/**
 * Интерполяция из номограмм для импульсных аппаратов
 */
function interpolateFromPulseNomogram(nomogramData: Record<string, number[]>, filmType: string, thickness: number): number {
  if (!nomogramData[filmType]) {
    console.warn(`Нет данных номограммы для плёнки: ${filmType}`);
    return 1.0;
  }
  const data = nomogramData[filmType];
  return interpolateLinear(data, thickness);
}

/**
 * Расчет фактора экспозиции T по таблице 7
 */
function calculateExposureFactor(h: number, F: number): { value: number; calculation: string } {
  const hValues = table7Data.h;
  const FValues = table7Data.F;

  // Проверка точного совпадения
  const exactHIndex = hValues.findIndex(val => val === h);
  const exactFIndex = FValues.findIndex(val => val === F);

  if (exactHIndex !== -1 && exactFIndex !== -1) {
    const exactValue = table7Data.values[exactHIndex][exactFIndex];
    return {
      value: exactValue,
      calculation: `Точное совпадение: h=${h} мм, F=${F} мм → T=${exactValue}`
    };
  }

  // Функция для поиска индексов интерполяции
  const findIdx = (val: number, arr: number[]) => {
    if(val <= arr[0]) return {i1: 0, i2: 1, type: `Значение ${val} меньше минимального табличного, используется интерполяция между ${arr[0]} и ${arr[1]}`};
    if(val >= arr[arr.length-1]) return {i1: arr.length-2, i2: arr.length-1, type: `Значение ${val} больше максимального табличного, используется экстраполяция от ${arr[arr.length-2]} и ${arr[arr.length-1]}`};
    for(let i=0; i<arr.length-1; i++) {
      if(val >= arr[i] && val <= arr[i+1]) return {i1: i, i2: i+1, type: `Интерполяция между ${arr[i]} и ${arr[i+1]}`};
    }
    return {i1: arr.length-2, i2: arr.length-1, type: 'Резервный вариант'};
  }

  const {i1: hI1, i2: hI2, type: hCalc} = findIdx(h, hValues);
  const {i1: FI1, i2: FI2, type: FCalc} = findIdx(F, FValues);

  // Билинейная интерполяция
  const T11=table7Data.values[hI1][FI1], T12=table7Data.values[hI1][FI2];
  const T21=table7Data.values[hI2][FI1], T22=table7Data.values[hI2][FI2];

  // Интерполяция по F
  const h1F = (FI1 === FI2) ? T11 : T11 + (T12 - T11) * (F - FValues[FI1]) / (FValues[FI2] - FValues[FI1]);
  const h2F = (FI1 === FI2) ? T21 : T21 + (T22 - T21) * (F - FValues[FI1]) / (FValues[FI2] - FValues[FI1]);

  // Интерполяция по h
  const finalValue = (hI1 === hI2) ? h1F : h1F + (h2F - h1F) * (h - hValues[hI1]) / (hValues[hI2] - hValues[hI1]);

  const calculation = `Интерполяция по радиационной толщине h: ${hCalc}\n` +
    `Интерполяция по фокусному расстоянию F: ${FCalc}\n` +
    `Для h=${hValues[hI1]} мм: T=${T11} + (${T12} - ${T11}) × (${F} - ${FValues[FI1]}) / (${FValues[FI2]} - ${FValues[FI1]}) = ${h1F.toFixed(2)}\n` +
    `Для h=${hValues[hI2]} мм: T=${T21} + (${T22} - ${T21}) × (${F} - ${FValues[FI1]}) / (${FValues[FI2]} - ${FValues[FI1]}) = ${h2F.toFixed(2)}\n` +
    `Итоговое значение: T = ${h1F.toFixed(2)} + (${h2F.toFixed(2)} - ${h1F.toFixed(2)}) × (${h} - ${hValues[hI1]}) / (${hValues[hI2]} - ${hValues[hI1]}) = ${finalValue.toFixed(2)}`;

  return { value: finalValue, calculation };
}

/**
 * Коэффициент материала
 */
function getMaterialCoefficient(material: string): number {
  switch(material) {
    case 'steel': return 1.0;
    case 'aluminum': return 0.3;
    case 'titanium': return 0.7;
    default: return 1.0;
  }
}

/**
 * Название материала на русском
 */
const getMaterialName = (material: string) => ({
  steel: 'сталь',
  aluminum: 'алюминий',
  titanium: 'титан'
}[material] || material);

// --- React Компоненты ---

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ElementType;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 p-4 rounded-t-lg font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all duration-300 ${
      active
        ? 'bg-white dark:bg-slate-800 border-b-2 border-blue-600 text-blue-600'
        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`}
  >
    <Icon className={active ? 'text-blue-600' : 'text-slate-400'} size={18}/>
    {children}
  </button>
);

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  step?: string;
  min?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, ...props }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <input
      name={name}
      {...props}
      className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, ...props }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <select
      name={name}
      {...props}
      className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
    />
  </div>
);

// --- Основной компонент калькулятора ---

const ExposureCalculatorPage = () => {
  const [mode, setMode] = useState<'xray' | 'isotope'>('xray');
  const [result, setResult] = useState<number | null>(null);
  const [log, setLog] = useState<string | null>(null);

  const [xrayInputs, setXrayInputs] = useState({
    apparatusType: '',
    operationMode: 'constant' as 'constant' | 'pulse',
    voltage: '',
    current: '',
    radThickness: '',
    focusDistance: '',
    material: 'steel' as 'steel' | 'aluminum' | 'titanium',
    filmType: 'D7'
  });

  const [isotopeInputs, setIsotopeInputs] = useState({
    sourceType: 'Ir-192' as keyof typeof halfLifeData,
    activityMethod: 'current' as 'current' | 'passport',
    currentActivity: '10',
    passportActivity: '10',
    passportDate: new Date().toISOString().split('T')[0],
    radThickness: '20',
    focusDistance: '500',
    material: 'steel' as 'steel' | 'aluminum' | 'titanium',
    filmType: 'D7'
  });

  // Динамические опции для плёнок в зависимости от режима работы
  const xrayFilmOptions = useMemo(() => {
    if (xrayInputs.operationMode === 'pulse') {
      // Для импульсных аппаратов - все типы плёнок как для радионуклидных источников
      return Object.keys(filmFactors['Ir-192']);
    }
    // Для постоянных аппаратов - стандартный набор плёнок
    return Object.keys(filmFactors.constant);
  }, [xrayInputs.operationMode]);

  // Обработчик изменений для рентгеновских аппаратов
  const handleXrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;

    setXrayInputs(prev => {
      let newInputs = {...prev, [name]: value};

      if (name === 'apparatusType') {
        const data = apparatusData[value];
        if (data) {
          newInputs.operationMode = data.type === 'П' ? 'constant' : 'pulse';
          newInputs.voltage = String(data.voltage);
          newInputs.current = data.current ? String(data.current) : '';
          // Установка фокусного расстояния по умолчанию
          if (value === 'Арина-7') {
            newInputs.focusDistance = '500'; // Для Арина-7 базовое расстояние 500мм
          } else {
            newInputs.focusDistance = '700'; // Для остальных аппаратов 700мм
          }
          // Для импульсных аппаратов устанавливаем материал "сталь"
          if (newInputs.operationMode === 'pulse') {
            newInputs.material = 'steel';
          }
        }
      }
      return newInputs;
    });
  }

  // Обработчик изменений для радионуклидных источников
  const handleIsotopeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIsotopeInputs(prev => ({...prev, [name]: value}));
  };

  // Основная функция расчета
  const calculate = () => {
    let finalTime = 0;
    let calculationLog = '';

    try {
      if (mode === 'xray') {
        const { apparatusType, operationMode, material, filmType } = xrayInputs;
        const voltage = parseFloat(xrayInputs.voltage);
        const current = parseFloat(xrayInputs.current);
        const thickness = parseFloat(xrayInputs.radThickness);
        const focusDistance = parseFloat(xrayInputs.focusDistance);

        // Валидация входных данных
        if (!voltage || !thickness || !focusDistance) {
          throw new Error('Пожалуйста, заполните все обязательные поля');
        }
        if (operationMode === 'constant' && !current) {
          throw new Error('Необходимо указать величину анодного тока (мА)');
        }
        if (operationMode === 'pulse' && material !== 'steel') {
          throw new Error('Для импульсных аппаратов расчет возможен только для стали');
        }

        let baseExposure: number;
        let filmFactor: number;
        let adjustedExposure: number;
        let baseFocus: number;

        if (operationMode === 'pulse') {
          // РАСЧЕТ ДЛЯ ИМПУЛЬСНЫХ АППАРАТОВ
          calculationLog = `РАСЧЕТ ДЛЯ ${apparatusType}\n` +
            `Материал: ${getMaterialName(material)}\n` +
            `Тип плёнки: ${filmType}\n` +
            `Радиационная толщина: ${thickness} мм\n` +
            `Фокусное расстояние F: ${focusDistance} мм\n\n`;

          // Определение базового времени из соответствующих номограмм
          if (apparatusType === 'Арина-7') {
            baseFocus = 500; // Базовое расстояние для Арина-7
            if (filmType === 'D7' || filmType === 'F8+RCF' || filmType === 'F8+NDT1200') {
              baseExposure = interpolateFromPulseNomogram(nomogramsSteelPulseArina7, filmType, thickness);
              filmFactor = 1.0; // Фактор уже учтен в номограмме
              calculationLog += `1. Базовое время из номограммы Арина-7 (F₀=${baseFocus} мм) для ${filmType}: t₀ = ${baseExposure.toFixed(3)} мин\n`;
            } else {
              // Для других типов плёнок используем номограмму D7 и применяем фактор
              baseExposure = interpolateFromPulseNomogram(nomogramsSteelPulseArina7, 'D7', thickness);
              filmFactor = filmFactors['pulse'][filmType] || 1.0;
              calculationLog += `1. Базовое время из номограммы Арина-7 (F₀=${baseFocus} мм) для D7: t₀ = ${baseExposure.toFixed(3)} мин\n` +
                `2. Корректировка для плёнки ${filmType}: ω₁ = ${filmFactor}\n` +
                `t₁ = t₀ × ω₁ = ${baseExposure.toFixed(3)} × ${filmFactor} = ${(baseExposure * filmFactor).toFixed(3)} мин\n`;
            }
          } else if (apparatusType === 'Арина-9') {
            baseFocus = 700; // Базовое расстояние для Арина-9
            if (filmType === 'D7' || filmType === 'F8+RCF' || filmType === 'F8+NDT1200') {
              baseExposure = interpolateFromPulseNomogram(nomogramsSteelPulseArina9, filmType, thickness);
              filmFactor = 1.0; // Фактор уже учтен в номограмме
              calculationLog += `1. Базовое время из номограммы Арина-9 (F₀=${baseFocus} мм) для ${filmType}: t₀ = ${baseExposure.toFixed(3)} мин\n`;
            } else {
              // Для других типов плёнок используем номограмму D7 и применяем фактор
              baseExposure = interpolateFromPulseNomogram(nomogramsSteelPulseArina9, 'D7', thickness);
              filmFactor = filmFactors['pulse'][filmType] || 1.0;
              calculationLog += `1. Базовое время из номограммы Арина-9 (F₀=${baseFocus} мм) для D7: t₀ = ${baseExposure.toFixed(3)} мин\n` +
                `2. Корректировка для плёнки ${filmType}: ω₁ = ${filmFactor}\n` +
                `t₁ = t₀ × ω₁ = ${baseExposure.toFixed(3)} × ${filmFactor} = ${(baseExposure * filmFactor).toFixed(3)} мин\n`;
            }
          } else {
            throw new Error('Неизвестный тип импульсного аппарата');
          }

          adjustedExposure = baseExposure * filmFactor;

        } else {
          // РАСЧЕТ ДЛЯ ПОСТОЯННЫХ АППАРАТОВ (МСТ-200)
          calculationLog = `РАСЧЕТ ДЛЯ МСТ-200\n` +
            `Напряжение: ${voltage} кВ\n` +
            `Ток: ${current} мА\n` +
            `Материал: ${getMaterialName(material)}\n` +
            `Тип плёнки: ${filmType}\n` +
            `Радиационная толщина: ${thickness} мм\n` +
            `Фокусное расстояние: ${focusDistance} мм\n\n`;

          baseFocus = 700; // Базовое расстояние для МСТ-200

          // Определение базового времени из номограмм для МСТ-200
          baseExposure = interpolateFromNomogram(nomogramsSteelConstantMST200, voltage, thickness);
          calculationLog += `1. Базовое время из номограммы МСТ-200 (F₀=${baseFocus} мм): t₀ = ${baseExposure.toFixed(3)} мА·мин\n`;

          // Корректировка для типа плёнки
          filmFactor = filmFactors['constant'][filmType] || 1.0;
          adjustedExposure = baseExposure * filmFactor;

          calculationLog += `2. Корректировка для плёнки ${filmType}: ω₁ = ${filmFactor}\n` +
            `t₁ = ${baseExposure.toFixed(3)} × ${filmFactor} = ${adjustedExposure.toFixed(3)} мА·мин\n`;
        }

        // Корректировка для фокусного расстояния
        const focusCorrection = Math.pow(focusDistance / baseFocus, 2);
        const finalExposureMin = adjustedExposure * focusCorrection;

        calculationLog += `${operationMode === 'pulse' ? '2' : '3'}. Корректировка для фокусного расстояния:\n` +
          `Базовое расстояние F₀ = ${baseFocus} мм\n` +
          `Фактическое расстояние F = ${focusDistance} мм\n` +
          `(F/F₀)² = (${focusDistance}/${baseFocus})² = ${focusCorrection.toFixed(3)}\n` +
          `t = ${adjustedExposure.toFixed(3)} × ${focusCorrection.toFixed(3)} = ${finalExposureMin.toFixed(3)} ${operationMode === 'constant' ? 'мА·мин' : 'мин'}\n\n`;

        // Перевод в секунды
        if (operationMode === 'constant') {
          finalTime = (finalExposureMin / current) * 60;
          calculationLog += `4. Перевод в секунды:\n` +
            `t_сек = (t / I) × 60 = (${finalExposureMin.toFixed(3)} / ${current}) × 60 = ${finalTime.toFixed(0)} сек`;
        } else {
          finalTime = finalExposureMin * 60;
          calculationLog += `3. Перевод в секунды:\n` +
            `t_сек = t × 60 = ${finalExposureMin.toFixed(3)} × 60 = ${finalTime.toFixed(0)} сек`;
        }

      } else {
        // РАСЧЕТ ДЛЯ РАДИОНУКЛИДНЫХ ИСТОЧНИКОВ
        const { sourceType, activityMethod, passportDate, material, filmType } = isotopeInputs;
        const currentActivityVal = parseFloat(isotopeInputs.currentActivity);
        const passportActivity = parseFloat(isotopeInputs.passportActivity);
        const thickness = parseFloat(isotopeInputs.radThickness);
        const focusDistance = parseFloat(isotopeInputs.focusDistance);
        const halfLife = halfLifeData[sourceType];

        // Валидация входных данных
        if (!thickness || !focusDistance) {
          throw new Error('Пожалуйста, заполните все обязательные поля');
        }

        let activity = 0;
        let activityCalcLog = '';

        // Расчет текущей активности
        if (activityMethod === 'current') {
          if (!currentActivityVal) {
            throw new Error('Введите текущую активность источника');
          }
          activity = currentActivityVal;
          activityCalcLog = `Текущая активность: ${activity} Ки`;
        } else {
          if (!passportActivity || !passportDate) {
            throw new Error('Заполните все поля паспортных данных');
          }
          const timeElapsed = Math.floor((new Date().getTime() - new Date(passportDate).getTime()) / (1000 * 3600 * 24));
          activity = passportActivity * Math.exp(-0.69 * timeElapsed / halfLife);
          activityCalcLog = `Паспортная активность: ${passportActivity} Ки (на ${passportDate})\n` +
            `Время с даты паспорта: ${timeElapsed} дней\n` +
            `Период полураспада ${sourceType}: ${halfLife} дней\n` +
            `Текущая активность: A = ${passportActivity} × e^(-0.69 × ${timeElapsed} / ${halfLife}) = ${activity.toFixed(4)} Ки`;
        }

        // Определение фактора экспозиции T
        const TFactorResult = calculateExposureFactor(thickness, focusDistance);
        const TFactor = TFactorResult.value;

        // Определение коэффициента материала
        const materialCoeff = getMaterialCoefficient(material);

        // Определение фактора плёнки
        const filmFactor = filmFactors[sourceType][filmType] || 1.0;

        // Расчёт времени экспозиции
        finalTime = (TFactor * materialCoeff / activity) * 60 * filmFactor;

        calculationLog = `РАСЧЕТ ДЛЯ РАДИОНУКЛИДНОГО ИСТОЧНИКА ${sourceType}\n\n` +
          `1. РАСЧЕТ ТЕКУЩЕЙ АКТИВНОСТИ:\n${activityCalcLog}\n\n` +
          `2. ОПРЕДЕЛЕНИЕ ФАКТОРА ЭКСПОЗИЦИИ T:\n${TFactorResult.calculation}\n` +
          `Итоговое значение T = ${TFactor.toFixed(2)}\n\n` +
          `3. ОПРЕДЕЛЕНИЕ КОЭФФИЦИЕНТА МАТЕРИАЛА:\n` +
          `Материал: ${getMaterialName(material)}\n` +
          `Коэффициент K_м = ${materialCoeff}\n\n` +
          `4. ОПРЕДЕЛЕНИЕ ФАКТОРА ПЛЁНКИ:\n` +
          `Тип плёнки: ${filmType}\n` +
          `Коэффициент ω₁ = ${filmFactor}\n\n` +
          `5. РАСЧЁТ ВРЕМЕНИ ЭКСПОЗИЦИИ:\n` +
          `Формула: R = (T × K_м / A) × 60 × ω₁\n` +
          `Расчёт: R = (${TFactor.toFixed(2)} × ${materialCoeff} / ${activity.toFixed(4)}) × 60 × ${filmFactor}\n` +
          `Результат: R = ${finalTime.toFixed(0)} сек`;
      }

      setResult(finalTime);
      setLog(calculationLog);

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Произошла ошибка при расчете');
    }
  };

  // Сброс результатов
  const reset = () => {
    setResult(null);
    setLog(null);
  };

  // Форматирование времени
  const formatTime = (seconds: number | null) => {
    if(seconds === null || isNaN(seconds) || seconds < 0) return '-';
    const mins = Math.floor(seconds/60);
    const secs = Math.round(seconds%60);
    if (mins === 0) return `${secs} сек`;
    if (secs === 0) return `${mins} мин`;
    return `${mins} мин ${secs} сек`;
  };

  // Сброс при смене режима
  useEffect(() => {
    reset();
  }, [mode]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Калькулятор времени экспозиции
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
          По ТУ РГК 1-2024 и номограммам р/а
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <TabButton active={mode==='xray'} onClick={()=>setMode('xray')} icon={Zap}>
            Рентгеновские аппараты
          </TabButton>
          <TabButton active={mode==='isotope'} onClick={()=>setMode('isotope')} icon={Atom}>
            Радионуклидные источники
          </TabButton>
        </div>

        <div className="p-6">
          {mode === 'xray' ? (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div className="md:col-span-2">
                <SelectField
                  label="Тип аппарата"
                  name="apparatusType"
                  value={xrayInputs.apparatusType}
                  onChange={handleXrayChange}
                >
                  <option value="">Выберите модель  аппарата </option>
                  {Object.keys(apparatusData).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </SelectField>
              </div>

              <InputField
                label="Напряжение (кВ)"
                type="number"
                name="voltage"
                value={xrayInputs.voltage}
                onChange={handleXrayChange}
                min="50"
                step="1"
              />

              <InputField
                label="Ток (мА)"
                type="number"
                name="current"
                value={xrayInputs.current}
                onChange={handleXrayChange}
                disabled={xrayInputs.operationMode === 'pulse'}
                min="1"
                step="0.1"
              />

              <InputField
                label="Радиационная толщина (мм)"
                type="number"
                name="radThickness"
                value={xrayInputs.radThickness}
                onChange={handleXrayChange}
                min="1"
                step="0.1"
              />

              <InputField
                label="Фокусное расстояние F (мм) - расстояние от источника до детектора/плёнки"
                type="number"
                name="focusDistance"
                value={xrayInputs.focusDistance}
                onChange={handleXrayChange}
                min="100"
                step="1"
              />

              <SelectField
                label="Материал объекта"
                name="material"
                value={xrayInputs.material}
                onChange={handleXrayChange}
              >
                <option value="steel">Сталь</option>
                <option value="aluminum" disabled>Алюминий/Магний (в разработке)</option>
                <option value="titanium" disabled>Титан (в разработке)</option>
              </SelectField>

              <div className="md:col-span-2">
                <SelectField 
                  label="Тип плёнки/детектора" 
                  name="filmType" 
                  value={xrayInputs.filmType} 
                  onChange={handleXrayChange}
                >
                  {xrayFilmOptions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </SelectField>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <SelectField 
                label="Тип источника" 
                name="sourceType" 
                value={isotopeInputs.sourceType} 
                onChange={handleIsotopeChange}
              >
                {Object.keys(halfLifeData).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </SelectField>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Период полураспада
                </label>
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-center h-full flex items-center justify-center">
                  {halfLifeData[isotopeInputs.sourceType]} дней
                </div>
              </div>
              
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="activityMethod" 
                      value="current" 
                      checked={isotopeInputs.activityMethod === 'current'} 
                      onChange={handleIsotopeChange}
                    />
                    Текущая активность
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="activityMethod" 
                      value="passport" 
                      checked={isotopeInputs.activityMethod === 'passport'} 
                      onChange={handleIsotopeChange}
                    />
                    Паспортные данные
                  </label>
                </div>

                {isotopeInputs.activityMethod === 'current' ? (
                  <InputField 
                    label="Текущая активность (Кюри)"
                    type="number" 
                    name="currentActivity" 
                    value={isotopeInputs.currentActivity} 
                    onChange={handleIsotopeChange} 
                    min="0.1"
                    step="0.1"
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    <InputField 
                      label="Паспортная активность (Кюри)"
                      type="number" 
                      name="passportActivity" 
                      value={isotopeInputs.passportActivity} 
                      onChange={handleIsotopeChange} 
                      min="0.1"
                      step="0.1"
                    />
                    <InputField 
                      label="Дата по паспорту" 
                      type="date" 
                      name="passportDate" 
                      value={isotopeInputs.passportDate} 
                      onChange={handleIsotopeChange} 
                    />
                  </div>
                )}
              </div>

              <InputField 
                label="Радиационная толщина (мм)" 
                type="number" 
                name="radThickness" 
                value={isotopeInputs.radThickness} 
                onChange={handleIsotopeChange} 
                min="1"
                step="0.1"
              />

              <InputField 
                label="Фокусное расстояние F (мм) - расстояние от источника до детектора/плёнки"
                type="number" 
                name="focusDistance" 
                value={isotopeInputs.focusDistance} 
                onChange={handleIsotopeChange} 
                min="100"
                step="1"
              />

              <SelectField 
                label="Материал объекта" 
                name="material" 
                value={isotopeInputs.material} 
                onChange={handleIsotopeChange}
              >
                <option value="steel">Сталь</option>
                <option value="aluminum">Алюминий/Магний</option>
                <option value="titanium">Титан</option>
              </SelectField>

              <SelectField 
                label="Тип плёнки/детектора" 
                name="filmType" 
                value={isotopeInputs.filmType} 
                onChange={handleIsotopeChange}
              >
                {Object.keys(filmFactors[isotopeInputs.sourceType] || {}).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </SelectField>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={calculate} 
              className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Calculator size={20}/>
              Рассчитать время экспозиции
            </button>
            <button 
              onClick={reset} 
              className="flex-1 bg-slate-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={20}/>
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">
            Результаты расчёта
          </h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-blue-900/30 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-8 text-center shadow-lg">
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
              Расчётное время экспозиции:
            </p>
            <p className="text-5xl md:text-6xl font-extrabold text-blue-600 dark:text-blue-400 my-4">
              {formatTime(result)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              F - расстояние от источника излучения до детектора/плёнки
            </p>
          </div>

          {log && (
            <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText size={20}/>
                Подробный расчёт
              </h3>
              <pre className="text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-4 rounded border">
                {log}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
          <strong>Внимание!</strong> Данный калькулятор является инструментом для приблизительных расчётов на основе соответвующих номограмм.
          При проведении реальных работ выполняйте тестовые измерения в соответствии с нормами и правилами.
        </p>
      </div>
    </div>
  );
}

export default ExposureCalculatorPage;