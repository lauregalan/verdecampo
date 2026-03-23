import { PropsWithChildren } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar"
import Sidebar from "@/components/ui/Tabs/Sidebar"; // El componente que armamos antes
import Header from "@/components/ui/Tabs/Header"; // Donde pusiste los Breadcrumbs y el Avatar

export default function Authenticated({
    children,
}: PropsWithChildren) {
    
    return (
        <SidebarProvider defaultOpen={true}>
        <div className="flex items-center justify-center h-screen w-full bg-fondo-agro bg-cover bg-center bg-no-repeat p-2">
            
            <div className="flex w-full max-w-8xl h-full bg-white/40 backdrop-blur-[2px] rounded-3xl shadow-2xl overflow-hidden relative border border-white/20">
                
                <Sidebar /> 

                <div className="flex-1 flex flex-col min-w-0 h-full">
                    {/* Header: También debería ser transparente o glass */}
                    <Header/>

                    <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-transparent">
                        {children}
                    </main>
                </div>
            </div>
            
        </div>
            
        </SidebarProvider>
    );
}