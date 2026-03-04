import { PropsWithChildren, ReactNode } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo'; //
import TabItem from '@/Components/Frames/TabItem';


interface AuthenticatedLayoutProps {
    header?: ReactNode;
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    return (
    <div className="flex items-center justify-center min-h-screen w-full bg-fondo-agro bg-cover bg-center bg-no-repeat p-4">
        <div>
            
        </div>
        <div className="m-1 w-full max-w-8xl h-[93vh] bg-white/50 p-1.5 rounded-xl shadow-2xl">
            
            {/* acá arranca la parte de las tabs, la idea es modificar el frame segun los permisos que tenga el usuario */}
            <div className="w-64 h-full rounded-xl rounded-tr-none bg-[#0f2e1e] text-white p-6 flex flex-col shadow-xl">
                <div className="flex items-center gap-3 mb-10">
                    <ApplicationLogo className="w-8 h-8 fill-white" />
                    <span className="text-xl font-bold tracking-tight">Verdecampo</span>
                </div>

                <nav className="space-y-2">
                    <TabItem label="Dashboard" active={false} />
                    <TabItem label="Mis Lotes" active={false} />
                    <TabItem label="Gestión de Personal" active={true} />
                    <TabItem label="Maquinaria" active={false} />
                    <TabItem label="Informes" active={false} />
                    <TabItem label="Configuración" active={false} />
                    <TabItem label="Ayuda" active={false} />
                </nav>
            </div>

            {/* Contenedor para el contenido con scroll*/}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {children}
            </main>
            
        </div>
    </div>
    );
}