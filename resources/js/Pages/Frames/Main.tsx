import { PropsWithChildren, ReactNode} from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
    LayoutDashboard, 
    Sprout, 
    Settings, 
    LogOut,
    ChevronUp // Útil para el menú de usuario
} from "lucide-react"; 
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"
import { Link, usePage } from '@inertiajs/react';

 // despues mover a un componente, datos de prueba
const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]


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
        <SidebarProvider defaultOpen={true}>
            <div className="flex items-center justify-center min-h-screen w-full bg-fondo-agro bg-cover bg-center bg-no-repeat p-4">
                
                <div className="m-1 flex w-full max-w-8xl h-[93vh] bg-white/50 p-1.5 rounded-xl shadow-2xl overflow-hidden">
                    
                    {/* SIDEBAR */}
                    <Sidebar 
                        className="w-80 h-full rounded-xl rounded-tr-none bg-[#0f2e1e] text-white flex flex-col shadow-xl border-none"
                        collapsible="none"
                    >
                        {/* HEADER */}
                        <SidebarHeader className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <Sprout size={22} className="text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-wide">VERDECAMPO</span>
                            </div>
                        </SidebarHeader>

                        {/* CONTENT */}
                        <SidebarContent className="px-4">
                            <SidebarGroup>
                                <SidebarGroupLabel className="text-green-500/50 text-lg uppercase font-black mb-4 px-2">
                                    Gestión
                                </SidebarGroupLabel>
                                
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentPath === "/dashboard"}
                                            className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                        >
                                            <Link href="/dashboard">
                                                <LayoutDashboard size={18} />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentPath === "/campo"}
                                            className="hover:bg-white/10 text-green-50 w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                                        >
                                            <Link href="/campo">
                                                <Sprout size={18} />
                                                <span className="font-medium">Mis campos</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroup>
                        </SidebarContent>

                        {/* FOOTER CON DROPDOWN (Opciones de usuario) */}
                        <SidebarFooter className="p-4 mt-auto border-t border-white/10">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuButton className="h-12 hover:bg-white/10 w-full flex items-center gap-3 p-2 rounded-xl transition">
                                                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold">
                                                    L
                                                </div>
                                                <div className="flex flex-col items-start text-sm">
                                                    <span className="font-bold">Laureano</span>
                                                    <span className="text-[10px] opacity-50 text-green-200">Admin</span>
                                                </div>
                                                <ChevronUp size={14} className="ml-auto opacity-50" />
                                            </SidebarMenuButton>
                                        </DropdownMenuTrigger>
                                        
                                        <DropdownMenuContent side="top" align="center" className="w-56 bg-[#0f2e1e] border-white/10 text-white rounded-xl shadow-2xl mb-2">
                                            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-2">
                                                <Settings size={16} /> Configuración
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-red-500/20 text-red-400 cursor-pointer flex gap-2">
                                                <LogOut size={16} /> Cerrar Sesión
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
         
                    </Sidebar>
                    
                    {/* MAIN CONTENT */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <InputGroup className="max-w-full mb-6">
                            <InputGroupInput placeholder="Search..." />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                            <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
                        </InputGroup>
                        <Table>
                            <TableCaption>A list of your recent invoices.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Nombre y apellido</TableHead>
                                    <TableHead>Correo electronico</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                    <TableHead className="text-right">Ultimo acceso</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.invoice}>
                                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                        <TableCell>{invoice.paymentStatus}</TableCell>
                                        <TableCell>{invoice.paymentMethod}</TableCell>
                                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3}>Total</TableCell>
                                    <TableCell className="text-right">$2,500.00</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        {header && (
                            <header className="mb-8 border-b border-black/5 pb-4">
                                <h1 className="text-2xl font-black text-[#0f2e1e] uppercase tracking-tight">
                                    {header}
                                </h1>
                            </header>
                        )}
                        
                        <div className="w-full">
                            {children}
                        </div>
                    </main>
                    
                </div>
            </div>
        </SidebarProvider>
    );
}
