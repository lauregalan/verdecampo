import React from 'react';
import { Sun, CloudRain, Cloud, Thermometer, Snowflake, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WeatherData {
    temperatura_max: number[];
    temperatura_min: number[];
    precipitacion: number[];
    codigo_clima: number[];
    fechas: string[];
}

interface LocalWeatherCardProps {
    clima?: WeatherData;
}

const getWeatherIcon = (code: number) => {
    if (code === 0) return Sun;
    if (code >= 1 && code <= 3) return Cloud;
    if (code >= 45 && code <= 48) return Cloud; // fog
    if (code >= 51 && code <= 67) return CloudRain; // drizzle/rain
    if (code >= 71 && code <= 77) return Snowflake; // snow
    if (code >= 80 && code <= 82) return CloudRain; // rain showers
    if (code >= 85 && code <= 86) return Snowflake; // snow showers
    if (code >= 95) return Zap; // thunderstorm
    return Sun; // default
};

const getWeatherColor = (code: number) => {
    if (code === 0) return 'text-amber-500';
    if (code >= 1 && code <= 3) return 'text-stone-400';
    if (code >= 45 && code <= 48) return 'text-stone-400'; // fog
    if (code >= 51 && code <= 82) return 'text-blue-500'; // rain
    if (code >= 71 && code <= 86) return 'text-blue-300'; // snow
    if (code >= 95) return 'text-purple-500'; // thunderstorm
    return 'text-amber-500';
};

export const LocalWeatherCard: React.FC<LocalWeatherCardProps> = ({ clima }) => {
    if (!clima || !clima.temperatura_max.length) {
        return (
            <Card className="flex flex-col overflow-hidden border-stone-200 bg-white shadow-sm rounded-3xl h-full">
                <div className="flex flex-1 flex-col items-center justify-center p-6">
                    <span className="text-sm text-stone-500">Datos del clima no disponibles</span>
                </div>
            </Card>
        );
    }

    const today = new Date();
    const todayIndex = clima.fechas.findIndex(fecha => {
        const date = new Date(fecha);
        return date.toDateString() === today.toDateString();
    });

    const currentTemp = todayIndex >= 0 ? Math.round((clima.temperatura_max[todayIndex] + clima.temperatura_min[todayIndex]) / 2) : 24;
    const currentCode = todayIndex >= 0 ? clima.codigo_clima[todayIndex] : 0;
    const CurrentIcon = getWeatherIcon(currentCode);

    const forecast = clima.fechas.slice(0, 3).map((fecha, index) => {
        const date = new Date(fecha);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase();
        const temp = Math.round((clima.temperatura_max[index] + clima.temperatura_min[index]) / 2);
        const code = clima.codigo_clima[index];
        const Icon = getWeatherIcon(code);
        const color = getWeatherColor(code);

        return {
            day: dayName,
            icon: Icon,
            temp: `${temp}°`,
            color
        };
    });

    return (
        <Card className="flex flex-col overflow-hidden border-stone-200 bg-white shadow-sm rounded-3xl h-full">
            {/* Cuerpo: Temperatura Actual */}
            <div className="flex flex-1 flex-col items-center justify-center p-6">
                <div className="flex items-center gap-3">
                    <CurrentIcon className="size-8 text-amber-500 animate-pulse-slow" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        Clima Actual
                    </span>
                </div>
                
                <div className="mt-2 flex items-baseline">
                    <span className="text-7xl font-black tracking-tighter text-stone-900">{currentTemp}</span>
                    <span className="text-4xl font-light text-stone-300">°C</span>
                </div>
                
                <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-stone-500">
                    <Thermometer size={14} />
                    <span>Máx: {clima.temperatura_max[todayIndex] || 26}°C</span>
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