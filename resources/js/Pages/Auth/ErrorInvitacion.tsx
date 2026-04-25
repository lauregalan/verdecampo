import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Sprout, ArrowRight } from 'lucide-react';

interface Props {
    mensaje: string;
}

export default function ErrorInvitacion({ mensaje }: Props) {
    return (
        <GuestLayout>
            <Head title="Invitación Inválida" />

            <div className="mb-7">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2e1e] shadow-md">
                        <Sprout size={24} className="text-[#d2e7d9]" />
                    </div>
                    <span className="text-[38px] font-extrabold tracking-tight text-[#194230]">
                        VERDECAMPO
                    </span>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-[#c53030]">
                    Invitación Inválida
                </h1>
                <p className="mt-1 text-lg text-[#4d685a]">
                    No pudimos procesar tu invitación.
                </p>
            </div>

            <div className="rounded-xl border-2 border-[#f56565] bg-[#fff5f5] p-5">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#fc8181]">
                        <AlertCircle size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[#c53030]">Problema con tu invitación</h2>
                        <p className="mt-2 text-[#742a2a]">
                            {mensaje}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <p className="text-sm text-[#4d685a]">
                    Posibles razones:
                </p>
                <ul className="space-y-2 text-sm text-[#2f4d3f]">
                    <li className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2e7d52]"></span>
                        El enlace de invitación ha expirado (válido por 48 horas)
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2e7d52]"></span>
                        El correo de invitación no es válido
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2e7d52]"></span>
                        Tu cuenta fue creada de forma diferente
                    </li>
                </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3">
                <Link
                    href={route('login')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e7d52] px-4 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-[#1d5f3f]"
                >
                    Ir al Inicio de Sesión
                    <ArrowRight size={18} />
                </Link>
                
                <div className="text-center">
                    <p className="text-sm text-[#4d685a]">
                        ¿Necesitas ayuda?{' '}
                        <a href="mailto:soporte@verdecampo.com" className="font-semibold text-[#2e7d52] hover:underline">
                            Contacta a soporte
                        </a>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
