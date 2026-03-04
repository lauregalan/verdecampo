import React from 'react';
import { Pencil, MapPin, Eye, Plus } from 'lucide-react';

export type StatusColor = 'verde' | 'naranja' | 'violeta';

export interface Card{
  name: string,
  surface: string,
  status: string,
  lastCrop: string,
  statusColor: StatusColor,
  imageUrl: string
}


export default function(){
   const Campos : Card[] = [
    {
      name: "La Aurora - Lote 1",
      surface: "80 Ha",
      status: "En Producción",
      lastCrop: "Maíz",
      statusColor: "verde",
      imageUrl: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Campo Verde - Lote 2",
      surface: "120 Ha",
      status: "En Preparación",
      lastCrop: "Trigo",
      statusColor: "naranja",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "El Retiro - Lote 3",
      surface: "150 Ha",
      status: "En Barbecho",
      lastCrop: "Girasol",
      statusColor: "violeta",
      imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f9f4ea] p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Campos</h1>
        <button className="flex items-center gap-2 bg-[#1d4ed8] text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md">
          <Plus size={20} />
          Nuevo Campo
        </button>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {Campos.map((campo, index) => (
          <FieldCard key={index} {...campo} />
        ))}
      </div>
    </div>
  ); 
}

const FieldCard = ({ name, surface, status, lastCrop, imageUrl, statusColor }: Card) => {
  // Mapeo de colores para los tags de estado según el diseño
  const statusStyles = {
    verde: "bg-green-600 text-white",
    naranja: "bg-orange-400 text-white",
    violeta: "bg-purple-600 text-white",
  };

  return (
    <div className="bg-[#fdf8f0] rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{name}</h3>
      
      {/* Imagen del Lote */}
      <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Información del Lote */}
      <div className="space-y-3 flex-grow">
        <div>
          <p className="text-gray-700 font-medium">Superficie: {surface}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${statusStyles[statusColor]}`}>
            {status}
          </span>
        </div>
        
        <p className="text-gray-700 font-medium pt-2">
          Último Cultivo: <span className="font-normal">{lastCrop}</span>
        </p>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-4 mt-6 text-gray-600">
        <button className="hover:text-blue-600 transition-colors"><Pencil size={20} /></button>
        <button className="hover:text-blue-600 transition-colors"><MapPin size={20} /></button>
        <button className="hover:text-blue-600 transition-colors"><Eye size={20} /></button>
      </div>
    </div>
  );
};