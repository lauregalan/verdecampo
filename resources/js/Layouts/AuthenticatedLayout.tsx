import { PropsWithChildren } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar"
import Sidebar from "@/components/ui/Tabs/Sidebar"; // El componente que armamos antes
import Header from "@/components/ui/Tabs/Header"; // Donde pusiste los Breadcrumbs y el Avatar

export default function Authenticated({
    children,
}: PropsWithChildren) {
    
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex items-center justify-center min-h-full w-full bg-fondo-agro bg-cover bg-center bg-no-repeat p-1">
                
                <div className="m-1 flex w-full max-w-8xl h-full bg-white/80 p-0.5 rounded-xl shadow-2xl overflow-hidden relative">
                    <Sidebar /> {/* La sidebar ahora se quedará aquí dentro */}
                    <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full">
                        <Header />
                        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            {children}
                        </main>
                    </div>
                </div>
                
            </div>
            
        </SidebarProvider>
    );
}