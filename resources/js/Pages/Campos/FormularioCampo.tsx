import { FormEvent, useCallback, useState } from 'react';
import Modal from '@/components/Modal';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import MapaInteractivo, { Coord } from './MapaInteractivo';
import type { CampoDraft, StatusColor } from './types';
import { X } from 'lucide-react';

interface FormularioCampoProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (campo: CampoDraft) => void;
}

const STATUS_OPTIONS: { label: string; value: string; color: StatusColor }[] = [
    { label: 'En Producción', value: 'En Produccion', color: 'verde' },
    { label: 'En Preparación', value: 'En Preparacion', color: 'naranja' },
    { label: 'En Barbecho', value: 'En Barbecho', color: 'violeta' },
];

const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400';

export default function FormularioCampo({
    show,
    onClose,
    onSubmit,
}: FormularioCampoProps) {
    // --- Estado del formulario ---
    const [name, setName] = useState('');
    const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
    const [statusColor, setStatusColor] = useState<StatusColor>(STATUS_OPTIONS[0].color);
    const [lastCrop, setLastCrop] = useState('');
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [surface, setSurface] = useState<number>(0);
    const [polygon, setPolygon] = useState<Coord[]>([]);

    // --- Handlers del mapa ---
    const handleCenterChange = useCallback((lat: number, lng: number) => {
        setLatitude(parseFloat(lat.toFixed(6)));
        setLongitude(parseFloat(lng.toFixed(6)));
    }, []);

    const handleAreaChange = useCallback((ha: number) => {
        setSurface(ha);
    }, []);

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const match = STATUS_OPTIONS.find((o) => o.value === value);
        if (match) setStatusColor(match.color);
    };

    // --- Reset ---
    const resetForm = () => {
        setName('');
        setStatus(STATUS_OPTIONS[0].value);
        setStatusColor(STATUS_OPTIONS[0].color);
        setLastCrop('');
        setLatitude(0);
        setLongitude(0);
        setSurface(0);
        setPolygon([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // --- Submit ---
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const nuevoCampo: CampoDraft = {
            name,
            surface: `${surface} Ha`,
            status,
            lastCrop,
            statusColor,
            imageUrl: PLACEHOLDER_IMAGE,
            latitude,
            longitude,
            polygon,
        };

        onSubmit(nuevoCampo);
        resetForm();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="2xl">
            <form onSubmit={handleSubmit} className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Registrar nuevo campo
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Nombre */}
                    <div>
                        <InputLabel htmlFor="campo-nombre" value="Nombre del campo" />
                        <TextInput
                            id="campo-nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: La Aurora - Lote 1"
                            className="mt-1 w-full"
                            required
                        />
                    </div>

                    {/* Estado y Último cultivo (side by side) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="campo-status" value="Estado" />
                            <select
                                id="campo-status"
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="campo-cultivo" value="Último cultivo" />
                            <TextInput
                                id="campo-cultivo"
                                value={lastCrop}
                                onChange={(e) => setLastCrop(e.target.value)}
                                placeholder="Ej: Maíz"
                                className="mt-1 w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Mapa interactivo */}
                    <div>
                        <InputLabel value="Ubicación y área del campo" />
                        <p className="mb-2 text-xs text-gray-500">
                            Hacé clic en el mapa para dibujar el perímetro de tu campo.
                        </p>
                        <MapaInteractivo
                            polygon={polygon}
                            onPolygonChange={setPolygon}
                            onCenterChange={handleCenterChange}
                            onAreaChange={handleAreaChange}
                        />
                    </div>

                    {/* Latitud, Longitud, Superficie (en fila) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="campo-lat" value="Latitud" />
                            <TextInput
                                id="campo-lat"
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="campo-lng" value="Longitud" />
                            <TextInput
                                id="campo-lng"
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="campo-superficie" value="Superficie (Ha)" />
                            <TextInput
                                id="campo-superficie"
                                type="number"
                                step="0.01"
                                min="0"
                                value={surface}
                                onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-[#1d4ed8] px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700"
                    >
                        Registrar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
