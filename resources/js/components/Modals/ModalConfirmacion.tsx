import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalConfirmacionProps {
    show: boolean;
    titulo: string;
    mensaje: string;
    onConfirmar: () => void;
    onCancelar: () => void;
    textoConfirmar?: string;
    textoCancelar?: string;
}

export default function ModalConfirmacion({
    show,
    titulo,
    mensaje,
    onConfirmar,
    onCancelar,
    textoConfirmar = "Eliminar",
    textoCancelar = "Cancelar",
}: ModalConfirmacionProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && onCancelar()}>
            <DialogContent
                className={[
                    // Fondo y borde
                    "max-w-md rounded-2xl border border-stone-200 bg-[#fdf8f0] p-6 shadow-xl",
                    // Animación de entrada — igual a Modal.tsx: fade + scale
                    "duration-300",
                    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-[2%]",
                    // Animación de salida
                    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-[2%]",
                ].join(" ")}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2} />
                        </div>
                        <DialogTitle className="text-base font-bold text-stone-800">
                            {titulo}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <DialogDescription className="text-sm leading-relaxed text-stone-600 pt-1 pl-1">
                    {mensaje}
                </DialogDescription>

                <DialogFooter className="gap-2 pt-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={onCancelar}
                        className="rounded-xl border-green-600 bg-white text-green-700 hover:bg-green-50 hover:text-green-800"
                    >
                        {textoCancelar}
                    </Button>
                    <Button
                        onClick={onConfirmar}
                        className="rounded-xl bg-green-700 text-white hover:bg-green-800 active:scale-95"
                    >
                        {textoConfirmar}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
