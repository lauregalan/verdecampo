import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Target, Sprout, SproutIcon, TrendingUp } from 'lucide-react';

// Datos de ejemplo para el Donut de Superficie
const surfaceData = [
  { name: 'En Producción', value: 3800, color: '#166534' }, // emerald-800 (tu verde oscuro)
  { name: 'Barbecho', value: 984, color: '#a8a29e' }, // stone-400
];

// Datos de ejemplo para las Barras de Cultivo
const cropData = [
  { name: 'Soja', ha: 2100 },
  { name: 'Maíz', ha: 1200 },
  { name: 'Trigo', ha: 500 },
];

export const ProductoSumary: React.FC = () => {
  const totalHa = surfaceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-stone-50 rounded-xl border border-stone-100 shadow-sm">
      
      {/* 1. Widget de Superficie Total (Donut) */}
      <div className="bg-white p-5 rounded-lg border border-stone-100 shadow-inner flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3 self-start">
          <Target className="size-5 text-emerald-700" />
          <h3 className="text-lg font-semibold text-stone-900">Superficie Total</h3>
        </div>
        <div className="relative size-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={surfaceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {surfaceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-stone-950">{totalHa.toLocaleString('es-AR')}</span>
            <span className="text-sm font-medium text-stone-500">Ha Totales</span>
          </div>
        </div>
        <div className="flex gap-4 text-xs mt-3">
            {surfaceData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{backgroundColor: item.color}}/>
                    <span className="text-stone-600">{item.name}: {item.value} Ha</span>
                </div>
            ))}
        </div>
      </div>

      {/* 2. Widget de Distribución de Cultivos (Barras Horizontales) */}
      <div className="bg-white p-5 rounded-lg border border-stone-100 shadow-inner">
        <div className="flex items-center gap-2 mb-5">
          <SproutIcon className="size-5 text-emerald-700" />
          <h3 className="text-lg font-semibold text-stone-900">Distribución de Cultivos</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cropData} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-xs font-medium text-stone-700" />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{border: 'none', borderRadius: '8px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="ha" fill="#166534" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Widget de Salud Ambiental (Puntuación) */}
      <div className="bg-white p-5 rounded-lg border border-stone-100 shadow-inner flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-emerald-700" />
          <h3 className="text-lg font-semibold text-stone-900">Salud Ambiental Promedio</h3>
        </div>
        <div className="flex flex-col items-center gap-1 py-4">
            <span className="text-6xl font-extrabold text-emerald-800">8.2<span className="text-3xl text-stone-300">/10</span></span>
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Excelente</span>
        </div>
        <p className="text-xs text-stone-500 text-center px-4">Índice basado en humedad de suelo, nutrientes y datos climáticos recientes de todos tus campos.</p>
      </div>

    </div>
  );
};