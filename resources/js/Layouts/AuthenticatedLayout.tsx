import { PropsWithChildren, ReactNode } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar"
import Sidebar from "@/components/ui/Tabs/Sidebar"; // El componente que armamos antes
import Header from "@/components/ui/Tabs/Header"; // Donde pusiste los Breadcrumbs y el Avatar

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex items-center justify-center min-h-screen w-full bg-fondo-agro bg-cover bg-center bg-no-repeat p-4">
                
                <div className="m-1 flex w-full max-w-8xl h-[93vh] bg-white/80 p-1.5 rounded-xl shadow-2xl overflow-hidden">
                    
                    <Sidebar/>
                    <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full">

                        <Header/>
                        
                        <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            {children}
                        </main>
                        
                    </div>
                </div>
                
            </div>
            
        </SidebarProvider>
    );
}