import { PropsWithChildren, ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import TabItem from "@/Components/Frames/TabItem";

interface AuthenticatedLayoutProps {
    header?: ReactNode;
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const { url } = usePage();
    const currentPath = url.split("?")[0];

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-fondo-agro bg-cover bg-center bg-no-repeat p-4">
            <div className="m-1 h-[93vh] w-full max-w-8xl rounded-xl bg-white/50 p-1.5 shadow-2xl">
                <div className="flex h-full">
                    <div className="flex h-full w-64 flex-col rounded-xl rounded-tr-none bg-[#0f2e1e] p-6 text-white shadow-xl">
                        <div className="mb-10 flex items-center gap-3">
                            <ApplicationLogo className="h-8 w-8 fill-white" />
                            <span className="text-xl font-bold tracking-tight">
                                Verdecampo
                            </span>
                        </div>

                        <nav className="space-y-2">
                            <TabItem
                                label="Dashboard"
                                href="/dashboard"
                                active={currentPath.startsWith("/dashboard")}
                            />
                            <TabItem
                                label="Mis Campos"
                                href="/campo"
                                active={currentPath.startsWith("/campo")}
                            />
                            <TabItem
                                label="Gestion de Personal"
                                href="/personal"
                                active={currentPath.startsWith("/personal")}
                            />
                            <TabItem
                                label="Maquinaria"
                                href="/maquinaria"
                                active={currentPath.startsWith("/maquinaria")}
                            />
                            <TabItem
                                label="Informes"
                                href="/informes"
                                active={currentPath.startsWith("/informes")}
                            />
                            <TabItem
                                label="Configuracion"
                                href="/configuracion"
                                active={currentPath.startsWith("/configuracion")}
                            />
                            <TabItem
                                label="Ayuda"
                                href="/ayuda"
                                active={currentPath.startsWith("/ayuda")}
                            />
                        </nav>
                    </div>

                    <main className="custom-scrollbar flex-1 overflow-y-auto">
                        {header}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
