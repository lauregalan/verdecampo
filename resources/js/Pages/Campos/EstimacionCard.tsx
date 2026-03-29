import React from 'react';
import { TrendingUp, Target, CalendarDays, Zap } from 'lucide-react';


const SparklineGraph = () => {
  const data = [10, 15, 25, 40, 35, 50, 65, 60, 75, 85, 80, 95];
  
  // Configuraciones del SVG
  const width = 200;
  const height = 60;
  const padding = 5;
  
  // Escalar puntos de datos a coordenadas SVG
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (value / 100) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  // Coordenadas para cerrar el área del gradiente
  const fillPoints = `${padding},${height} ${points} ${width - padding},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        {/* Gradiente de fondo (Verde suave a transparente) */}
        <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      
      {/* Área coloreada */}
      <polyline
        fill="url(#fillGradient)"
        points={fillPoints}
        stroke="none"
      />
      
      {/* Línea de tendencia (Verde esmeralda) */}
      <polyline
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="drop-shadow-sm"
      />
      
      {/* Punto final destacado */}
      <circle
        cx={padding + (width - 2 * padding)}
        cy={height - padding - (data[data.length - 1] / 100) * (height - 2 * padding)}
        r="3"
        fill="#ffffff"
        stroke="#059669"
        strokeWidth="1.5"
      />
    </svg>
  );
};

// === COMPONENTE DE LA CARD PRINCIPAL ===
export const EstimacionCard: React.FC = () => {
  // Datos de ejemplo que vendrían de tu API
  const yieldData = {
    proyeccionCosecha: "3.5", // tn/Ha
    totalEstimado: "1,667", // tn
    probabilidadExito: 85, // %
    fechaCosechaCercana: "15 May - 30 May"
  };

  return (
    <div className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-md font-sans">
      
      {/* CABECERA DE LA CARD */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">Rendimiento Estimado</h3>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Campaña Soja 24/25</p>
          </div>
        </div>
        
        {/* Badge de Probabilidad técnico */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-100 shadow-inner">
          <Zap size={12} className="text-emerald-500" />
          {yieldData.probabilidadExito}% Éxito
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: Gráfico y Proyección */}
      <div className="flex items-end gap-6 mb-6">
        
        {/* El Gráfico de Tendencia */}
        <div className="flex-1 min-w-0 bg-stone-50 rounded-xl border border-stone-100 p-2 shadow-inner">
          <SparklineGraph />
        </div>

        {/* Dato Destacado de Proyección */}
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-1">Proyección de cosecha</p>
          <p className="text-5xl font-black text-emerald-600 tracking-tightest">
            {yieldData.proyeccionCosecha}
          </p>
          <p className="text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full inline-block mt-1">
            tn / Ha
          </p>
        </div>
      </div>

      {/* DETALLES ADICIONALES (Grid inferior) */}
      <div className="grid grid-cols-2 gap-4 pt-5 border-t border-stone-100 bg-stone-50/50 rounded-xl p-4 mt-2 shadow-inner">
        
        {/* Total Estimado */}
        <div className="flex items-center gap-3">
          <Target className="size-5 text-stone-400" />
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wide">Total Estimado</p>
            <p className="text-lg font-bold text-stone-900">{yieldData.totalEstimado} tn</p>
          </div>
        </div>

        {/* Ventana de Cosecha */}
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-stone-400" />
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wide">Ventana de Cosecha</p>
            <p className="text-sm font-semibold text-stone-800">{yieldData.fechaCosechaCercana}</p>
          </div>
        </div>
      </div>

    </div>
  );
};