import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Undo2, Trash2 } from 'lucide-react';

/** Coordenada [latitud, longitud] */
export type Coord = [number, number];

interface MapaInteractivoProps {
    /** Puntos del polígono actuales (controlado desde fuera) */
    polygon: Coord[];
    /** Callback cuando cambia el polígono */
    onPolygonChange: (coords: Coord[]) => void;
    /** Callback con el centroide del polígono */
    onCenterChange: (lat: number, lng: number) => void;
    /** Callback con el área calculada en hectáreas */
    onAreaChange: (hectareas: number) => void;
}

/**
 * Calcula el área de un polígono en m² usando la fórmula de Shoelace
 * aplicada a coordenadas geográficas (aproximación con cos(lat)).
 */
function calcularAreaM2(coords: Coord[]): number {
    if (coords.length < 3) return 0;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371000; // radio terrestre en metros

    // Convertir a metros planos (proyección equirectangular)
    const latMedia = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const cosLat = Math.cos(toRad(latMedia));

    const puntos = coords.map(([lat, lng]) => ({
        x: toRad(lng) * R * cosLat,
        y: toRad(lat) * R,
    }));

    // Shoelace
    let area = 0;
    for (let i = 0; i < puntos.length; i++) {
        const j = (i + 1) % puntos.length;
        area += puntos[i].x * puntos[j].y;
        area -= puntos[j].x * puntos[i].y;
    }

    return Math.abs(area) / 2;
}

/** Calcula el centroide de un polígono. */
function calcularCentroide(coords: Coord[]): Coord {
    if (coords.length === 0) return [0, 0];
    const lat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const lng = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    return [lat, lng];
}

/** Componente interno que captura clics en el mapa. */
function ClickHandler({ onMapClick }: { onMapClick: (coord: Coord) => void }) {
    useMapEvents({
        click(e) {
            onMapClick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function MapaInteractivo({
    polygon,
    onPolygonChange,
    onCenterChange,
    onAreaChange,
}: MapaInteractivoProps) {
    // Centro inicial del mapa: Argentina (Buenos Aires aprox)
    const centroInicial: LatLngExpression = useMemo(() => [-34.6, -58.4], []);

    const handleMapClick = useCallback(
        (coord: Coord) => {
            onPolygonChange([...polygon, coord]);
        },
        [polygon, onPolygonChange],
    );

    const handleUndo = useCallback(() => {
        if (polygon.length > 0) {
            onPolygonChange(polygon.slice(0, -1));
        }
    }, [polygon, onPolygonChange]);

    const handleClear = useCallback(() => {
        onPolygonChange([]);
    }, [onPolygonChange]);

    // Cada vez que cambia el polígono, recalcular centro y área
    useEffect(() => {
        if (polygon.length >= 3) {
            const [lat, lng] = calcularCentroide(polygon);
            onCenterChange(lat, lng);
            const areaM2 = calcularAreaM2(polygon);
            const hectareas = areaM2 / 10000;
            onAreaChange(parseFloat(hectareas.toFixed(2)));
        } else {
            onCenterChange(0, 0);
            onAreaChange(0);
        }
    }, [polygon, onCenterChange, onAreaChange]);

    return (
        <div className="relative">
            <MapContainer
                center={centroInicial}
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: '320px', width: '100%', borderRadius: '0.75rem' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickHandler onMapClick={handleMapClick} />

                {polygon.length >= 3 && (
                    <Polygon
                        positions={polygon as LatLngExpression[]}
                        pathOptions={{
                            color: '#1d4ed8',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.25,
                            weight: 2,
                        }}
                    />
                )}

                {/* Vértices individuales (visibles desde el primer clic) */}
                {polygon.map((coord, idx) => (
                    <CircleMarker
                        key={idx}
                        center={coord as LatLngExpression}
                        radius={6}
                        pathOptions={{
                            color: '#1d4ed8',
                            fillColor: '#ffffff',
                            fillOpacity: 1,
                            weight: 2,
                        }}
                    />
                ))}
            </MapContainer>

            {/* Controles del mapa */}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={handleUndo}
                    disabled={polygon.length === 0}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Undo2 size={14} />
                    Deshacer
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={polygon.length === 0}
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Trash2 size={14} />
                    Limpiar
                </button>
            </div>

            {polygon.length > 0 && polygon.length < 3 && (
                <p className="mt-1 text-xs text-amber-600">
                    Hacé clic en al menos 3 puntos para definir el área del campo.
                </p>
            )}
        </div>
    );
}
