import React from 'react';
import { Sun, CloudRain, Cloud, Thermometer } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const LocalWeatherCard = () => {
    // Datos de ejemplo
    const forecast = [
        { day: 'Lun', icon: Sun, temp: '28°', color: 'text-amber-500' },
        { day: 'Mar', icon: Cloud, temp: '24°', color: 'text-stone-400' },
        { day: 'Mié', icon: CloudRain, temp: '20°', color: 'text-blue-500' },
    ];

    return (
        <Card className="flex flex-col overflow-hidden border-stone-200 bg-white shadow-sm rounded-3xl h-full">
            {/* Cuerpo: Temperatura Actual */}
            <div className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="flex items-center gap-3">
                    <Sun className="size-8 text-amber-500 animate-pulse-slow" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        Clima Actual
                    </span>
                </div>
                
                <div className="mt-2 flex items-baseline">
                    <span className="text-7xl font-black tracking-tighter text-stone-900">24</span>
                    <span className="text-4xl font-light text-stone-300">°C</span>
                </div>
                
                <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-stone-500">
                    <Thermometer size={14} />
                    <span>ST: 26°C</span>
                </div>
            </div>

            {/* Footer: Pronóstico 3 días */}
            <div className="grid grid-cols-3 border-t border-stone-100 bg-stone-50/50 p-4">
                {forecast.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 border-stone-200 last:border-0 [&:not(:last-child)]:border-r">
                        <span className="text-[10px] font-bold uppercase text-stone-400">
                            {item.day}
                        </span>
                        <item.icon className={`size-5 ${item.color}`} strokeWidth={2} />
                        <span className="text-xs font-bold text-stone-700">
                            {item.temp}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};