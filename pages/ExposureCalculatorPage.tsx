import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Atom, Calculator, FileText, RotateCcw } from 'lucide-react';

// Данные из оригинального HTML файла
const apparatusData: Record<string, {type: 'П'|'И'; voltage: number; current: number|null; focus: number; thickness: number}> = {
  'RayCraft GD-160':{type:'П',voltage:160,current:5,focus:0.8,thickness:18},
  'Smart 225':{type:'П',voltage:225,current:4,focus:1.5,thickness:45},
  'Eresco 32 MF4-C':{type:'П',voltage:200,current:3,focus:0.4,thickness:32},
  'Isovolt 225 M2':{type:'П',voltage:225,current:3,focus:0.4,thickness:30},
  'РПД-150':{type:'П',voltage:150,current:3,focus:0.8,thickness:20},
  'РПД-250':{type:'П',voltage:250,current:5,focus:3.0,thickness:60},
  'РПД-250-П':{type:'П',voltage:250,current:5,focus:3.0,thickness:50},
  'MAPT-200':{type:'П',voltage:200,current:2,focus:2.2,thickness:40},
  'Памир-200':{type:'И',voltage:200,current:null,focus:3.0,thickness:40},
  'Арина-7':{type:'И',voltage:250,current:null,focus:2.5,thickness:40},
  'Арион-300':{type:'И',voltage:300,current:null,focus:2.3,thickness:60},
  'Арина-9':{type:'И',voltage:300,current:null,focus:2.5,thickness:50}
};

const halfLifeData: Record<string, number> = {
  'Ir-192':74,
  'Co-60':1924,
  'Se-75':120
};

// Номограммы для постоянных аппаратов (сталь, F=1000мм, плёнка D7)
const nomogramsSteelConstant: Record<string, number[]> = {
  '100':[2,3.0,2.5,4.0,3,5.0,4,8.5,4.5,11.0,5,13.0,5.5,20.0,6,24.0,7,41.0,7.5,55.0,8,73.0,8.5,100.0],
  '120':[2,1.4,3,2.25,4,3.25,5,4.8,6,7.0,6.5,8.5,7,10.2,8,13.5,8.5,18.0,9,21.0,9.5,26.0,10,31.5,11,44.0,11.5,53.0,12,62.5,13,91.0],
  '140':[3,1.25,4,1.5,5,2.1,7,3.4,8,4.4,9,5.6,10,7.3,11,9.2,12,10.8,14,17.0,15,21.5,16,28.2,17,34.0,18,43.0,19,54.0,20,70.5,21,87.5],
  '160':[7,1.7,8,2.2,9,2.7,10,3.3,11,4.2,12,5.1,13,6.2,14,7.5,15,9.3,16,10.4,17,12.5,18,16.0,19,20.7,20,24.0,21,31.0,22,38.0,23,46.0,24,57.0,25,71.0,26,87.0,26.5,100.0],
  '180':[8,1.25,9,1.45,10,1.8,12,2.5,14,3.5,15,4.25,17,6.0,18,7.0,20,9.5,22,12.0,23,14.0,24,18.0,25,21.0,26,24.2,27,30.5,28,34.0,29,41.0,30,49.0,31,57.0,32,68.0,33,80.5,34,93.0],
  '200':[12,1.5,13,1.8,15,2.4,16,3.0,18,4.0,19,4.5,20,5.25,21,6.1,22,7.2,23,8.2,24,9.5,25,10.6,26,11.7,27,13.3,28,16.2,29,20.2,30,21.9,31,26.0,32,30.8,33,34.5,34,41.0,35,49.0,36,56.0,37,64.5,38,75.0,39,90.0],
  '220':[15,1.4,17,2.0,19,2.4,20,2.9,22,3.5,24,4.5,26,5.8,27,6.5,28,7.4,29,8.4,30,9.4,32,11.0,33,12.1,34,13.8,35,16.3,36,20.0,37,21.3,38,23.5,39,28.0,40,31.0],
  '240':[18,1.45,19,1.75,20,2.0,21,2.25,22,2.4,23,2.7,24,3.2,25,3.4,26,4.0,28,5.0,30,6.1,31,6.8,32,7.5,33,8.4,34,9.5,35,10.4,36,11.0,37,12.0,38,13.35,39,15.5,40,18.3],
  '260':[21,1.25,23,1.5,24,1.75,24,1.75,25,2.1,26,2.25,27,2.45,29,3.2,30,3.4,31,3.9,32,4.55,33,4.8,34,5.3,35,6.0,36,6.6,37,7.4,38,8.25,39,9.25]
};

// Номограммы для алюминия (постоянные аппараты)
const nomogramsAluminumConstant: Record<string, number[]> = {
  '50':[2,10.6,3,17.0,4,30.0,5,47.0,6,77.0,6.5,100.0],
  '70':[2,2.4,3,3.2,4,3.8,5,4.6,6,5.7,7,7.2,8,8.8,9,10.3,10,12.0,11,14.8,12,20.0,13,22.3,14,29.0,15,33.0,16,41.0,17,50.8,18,61.0,19,73.0,20,90.7],
  '90':[5,1.6,6,1.9,7,2.2,8,2.5,9,3.1,10,3.4,11,4.0,12,4.4,13,5.2,14,5.8,15,6.7,16,7.5,17,8.75,18,10.1,19,10.75,20,11.8,21,13.3,22,15.8,23,20.0,24,21.2,25,23.8,26,29.0,27,31.9,28,37.0,29,41.8,30,50.0,31,54.0,32,62.5,33,71.0,34,81.0,35,94.0],
  '110':[5,1.0,7,1.25,9,1.5,10,1.75,11,2.0,12,2.2,13,2.4,14,2.6,15,3.0,16,3.25,17,3.5,18,4.0,19,4.3,20,4.75,21,5.25,22,5.75,23,6.3,24,7.1,25,7.75,26,8.5,27,9.4,28,10.3,29,10.8,30,11.5,31,12.5,32,13.8,33,15.7,34,18.4,35,20.5,36,21.6,37,23.5,38,27.0,39,30.5,40,32.0],
  '130':[10,1.0,13,1.3,15,1.5,16,1.75,17,1.9,19,2.25,20,2.8,22,3.0,23,3.5,24,3.4,25,3.8,26,4.2,27,4.5,28,5.0,31,6.4,32,7.1,33,7.5,34,8.25,35,9.1,36,10.0,37,10.5,38,10.9,39,11.7,40,12.4]
};

// Номограммы для импульсных аппаратов (сталь, F=300мм)
const nomogramsSteelPulse: Record<string, number[]> = {
  'D7':[3,1.07,4,1.18,5,1.35,6,1.7,7,2.3,8,2.6,9,2.95,10,3.5,11,4.2,12,4.8,13,5.7,14,6.6,15,7.7,16,9.0,17,11.0,18,14.0,19,16.0],
  'F8+RCF':[3,0.28,4,0.34,5,0.38,6,0.45,7,0.53,8,0.62,9,0.73,10,0.85,11,1.0,12,1.07,13,1.17,14,1.34,15,1.7,16,2.2,17,2.6,18,2.95,19,3.5,20,4.1,21,4.8,22,5.7,23,6.5,24,7.7,25,9.0,26,11.0,27,14.0,28,16.0],
  'F8+NDT1200':[3,0.015,4,0.06,5,0.11,6,0.14,7,0.16,8,0.18,9,0.2,10,0.24,11,0.28,12,0.33,13,0.38,14,0.45,15,0.52,16,0.6,17,0.73,18,0.85,19,1.0,20,1.075,21,1.17,22,1.33,23,1.7,24,2.2,25,2.6,26,3.0,27,3.55,28,4.2,29,4.8,30,5.7,31,6.7,32,7.7,33,9.0,34,12.0,35,14.0]
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
          newInputs.focusDistance = String(newInputs.operationMode === 'constant' ? 1000 : 300);
          // Для импульсных аппаратов устанавливаем материал "сталь"
          if (newInputs.operationMode === 'pulse') {
            newInputs.material = 'steel';
          }
        }
      } else if (name === 'operationMode') {
        newInputs.focusDistance = String(value === 'constant' ? 1000 : 300);
        if (value === 'pulse') {
          newInputs.current = '';
          newInputs.material = 'steel'; // Для импульсных аппаратов только сталь
        }
        // Обеспечиваем валидный тип плёнки после смены режима
        const currentValidOptions = value === 'pulse' ? Object.keys(filmFactors['Ir-192']) : Object.keys(filmFactors.constant);
        if (!currentValidOptions.includes(newInputs.filmType)) {
          newInputs.filmType = 'D7';
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
        const { operationMode, material, filmType } = xrayInputs;
        const voltage = parseFloat(xrayInputs.voltage);
        const current = parseFloat(xrayInputs.current);
        const thickness = parseFloat(xrayInputs.radThickness);
        const focusDistance = parseFloat(xrayInputs.focusDistance);

        // Валидация входных данных
        if (!voltage || !thickness || !focusDistance) {
          throw new Error('Пожалуйста, заполните все обязательные поля');
        }
        if (operationMode === 'constant' && !current) {
          throw new Error('Для постоянного режима необходимо указать ток');
        }
        if (operationMode === 'pulse' && material !== 'steel') {
          throw new Error('Для импульсных аппаратов расчет возможен только для стали');
        }

        let baseExposure: number;
        let filmFactor: number;
        let adjustedExposure: number;
        let titaniumCoefficient = 1.0;

        if (operationMode === 'pulse') {
          // РАСЧЕТ ДЛЯ ИМПУЛЬСНЫХ АППАРАТОВ (ТОЛЬКО СТАЛЬ)
          calculationLog = `РАСЧЕТ ДЛЯ ИМПУЛЬСНЫХ АППАРАТОВ\n` +
            `Материал: ${getMaterialName(material)}\n` +
            `Тип плёнки: ${filmType}\n` +
            `Радиационная толщина: ${thickness} мм\n` +
            `Фокусное расстояние: ${focusDistance} мм\n\n`;

          // Определение базового времени из номограмм импульсных аппаратов
          if (filmType === 'D7' || filmType === 'F8+RCF' || filmType === 'F8+NDT1200') {
            baseExposure = interpolateFromPulseNomogram(nomogramsSteelPulse, filmType, thickness);
            filmFactor = 1.0; // Фактор уже учтен в номограмме
            calculationLog += `1. Базовое время из номограммы для ${filmType}: t₀ = ${baseExposure.toFixed(3)} мин\n`;
          } else {
            // Для других типов плёнок используем номограмму D7 и применяем фактор
            baseExposure = interpolateFromPulseNomogram(nomogramsSteelPulse, 'D7', thickness);
            filmFactor = filmFactors['pulse'][filmType] || 1.0;
            calculationLog += `1. Базовое время из номограммы для D7: t₀ = ${baseExposure.toFixed(3)} мин\n` +
              `2. Корректировка для плёнки ${filmType}: ω₁ = ${filmFactor}\n` +
              `t₁ = t₀ × ω₁ = ${baseExposure.toFixed(3)} × ${filmFactor} = ${(baseExposure * filmFactor).toFixed(3)} мин\n`;
          }

          adjustedExposure = baseExposure * filmFactor;

        } else {
          // РАСЧЕТ ДЛЯ ПОСТОЯННЫХ АППАРАТОВ
          calculationLog = `РАСЧЕТ ДЛЯ ПОСТОЯННЫХ АППАРАТОВ\n` +
            `Напряжение: ${voltage} кВ\n` +
            `Ток: ${current} мА\n` +
            `Материал: ${getMaterialName(material)}\n` +
            `Тип плёнки: ${filmType}\n` +
            `Радиационная толщина: ${thickness} мм\n` +
            `Фокусное расстояние: ${focusDistance} мм\n\n`;

          // Определение базового времени из номограмм
          const nomogram = material === 'steel' || material === 'titanium' ? nomogramsSteelConstant : nomogramsAluminumConstant;
          baseExposure = interpolateFromNomogram(nomogram, voltage, thickness);
          
          // Корректировка для титана
          if (material === 'titanium') {
            titaniumCoefficient = 0.7;
            calculationLog += `1. Базовое время из номограммы для стали: t₀ = ${baseExposure.toFixed(3)} мА·мин\n` +
              `2. Корректировка для титана: K_Ti = 0.7\n` +
              `t₀_Ti = t₀ × K_Ti = ${baseExposure.toFixed(3)} × 0.7 = ${(baseExposure * titaniumCoefficient).toFixed(3)} мА·мин\n`;
          } else {
            calculationLog += `1. Базовое время из номограммы: t₀ = ${baseExposure.toFixed(3)} мА·мин\n`;
          }

          // Корректировка для типа плёнки
          filmFactor = filmFactors['constant'][filmType] || 1.0;
          adjustedExposure = baseExposure * titaniumCoefficient * filmFactor;
          
          calculationLog += `${material === 'titanium' ? '3' : '2'}. Корректировка для плёнки ${filmType}: ω₁ = ${filmFactor}\n` +
            `t₁ = ${(baseExposure * titaniumCoefficient).toFixed(3)} × ${filmFactor} = ${adjustedExposure.toFixed(3)} мА·мин\n`;
        }

        // Корректировка для фокусного расстояния
        const baseFocus = operationMode === 'constant' ? 1000 : 300;
        const focusCorrection = Math.pow(focusDistance / baseFocus, 2);
        const finalExposureMin = adjustedExposure * focusCorrection;

        calculationLog += `${operationMode === 'pulse' ? '2' : '4'}. Корректировка для фокусного расстояния:\n` +
          `Базовое расстояние F_u = ${baseFocus} мм\n` +
          `Фактическое расстояние F = ${focusDistance} мм\n` +
          `(F/F_u)² = (${focusDistance}/${baseFocus})² = ${focusCorrection.toFixed(3)}\n` +
          `t = ${adjustedExposure.toFixed(3)} × ${focusCorrection.toFixed(3)} = ${finalExposureMin.toFixed(3)} ${operationMode === 'constant' ? 'мА·мин' : 'мин'}\n\n`;

        // Перевод в секунды
        if (operationMode === 'constant') {
          finalTime = (finalExposureMin / current) * 60;
          calculationLog += `5. Перевод в секунды:\n` +
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
          По ТУ РГК 1-2024 (пункты 4.1, 4.2 и 4.3)
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <TabButton active={mode==='xray'} onClick={()=>setMode('xray')} icon={Zap}>
            Рентген-аппараты
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
                  <option value="">Выберите аппарат или введите параметры</option>
                  {Object.keys(apparatusData).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </SelectField>
              </div>

              <SelectField 
                label="Режим работы" 
                name="operationMode" 
                value={xrayInputs.operationMode} 
                onChange={handleXrayChange}
              >
                <option value="constant">Постоянный (П)</option>
                <option value="pulse">Импульсный (И)</option>
              </SelectField>

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
                label="Фокусное расстояние (мм)" 
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
                disabled={xrayInputs.operationMode === 'pulse'}
              >
                <option value="steel">Сталь</option>
                <option value="aluminum">Алюминий/Магний</option>
                <option value="titanium">Титан</option>
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
                    label="Текущая активность (Ки)" 
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
                      label="Паспортная активность (Ки)" 
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
                label="Фокусное расстояние (мм)" 
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
              F - расстояние от источника излучения до детектора (плёнки)
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
          <strong>Внимание!</strong> Данный калькулятор является инструментом для предварительных расчётов. 
          При проведении реальных работ обязательно руководствуйтесь полным текстом ТУ РГК 1-2024 
          и соблюдайте все требования безопасности.
        </p>
      </div>
    </div>
  );
}

export default ExposureCalculatorPage;