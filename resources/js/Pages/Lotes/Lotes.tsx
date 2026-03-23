import { Button } from "@/components/ui/button"
import { Head } from "@inertiajs/react";
import Body from "@/components/ui/Tabs/Body";
import { useState, useCallback, useEffect } from "react";
//import Combobox from "@/components/ui/combobox";
//import Combobox from "@/components/ui/combobox";
interface Lote {
    id: number;
    nombre: string;
    caracteristicas: string;
    estado: string;
    longitud: number;
    latitud: number;
    idCampo: number;
    ph: number;
    napa: number;
}

export default function Lotes() {
    
    const campos = [
        { id: 1, nombre: "Campo A" },
        { id: 2, nombre: "Campo B" },
        { id: 3, nombre: "Campo C" },
    ];

    const cultivos = [
        { id: 1, nombre: "Trigo" },
        { id: 2, nombre: "Maíz" },
        { id: 3, nombre: "Soja" },
    ];

    const campanias = [
        { id: 1, nombre: "Campaña 2023" },
        { id: 2, nombre: "Campaña 2024" },
        { id: 3, nombre: "Campaña 2025" },
    ];
    
    const estados = [
        { id: 1, nombre: "Produccion" },
        { id: 2, nombre: "Barbecho" },
        { id: 3, nombre: "Preparacio" },
    ];

    const [lotes, setLotes] = useState<Lote[]>([]);
    const [showFormulario, setShowFormulario] = useState(false);

    const GetLotes = useCallback(async () => {
        try {
            const response = await fetch('/api/lotes');
            const data = await response.json();
            setLotes(data);
        } catch (error) {
            console.error('Error fetching lots:', error);
        }
    }, []);

    useEffect(() => {
        GetLotes();
    }, [GetLotes]);
    
    const [campoSeleccionado, setCampoSeleccionado] = useState("");

    return (
        <Body>
            <Head title="Gestion de Lotes" />
            <div className="min-h-full bg-[#f9f4ea] p-8 font-sans">
                <div className="mx-auto mb-10 max-w-7xl">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestion de Lotes
                    </h1>
                </div>

                

                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-sm">
                        <div className="text-gray-900">You are logged in!</div>
                    </div>
                </div>
            </div>

           
        </Body>
    );
}














