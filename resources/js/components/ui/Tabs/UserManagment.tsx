import { PropsWithChildren, ReactNode } from 'react';
import { 
    Search
} from "lucide-react"; 
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
import { Badge } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const users = [
    {
        id: 1,
        nombre: "Laureano Galán",
        email: "laureano@verdecampo.com",
        rol: "Administrador",
        ultimoAcceso: "2024-05-20 14:30",
        estado: "Activo",
        avatar: "https://github.com/shadcn.png"
    },
    {
        id: 2,
        nombre: "Martina Zuviría",
        email: "martina.z@agrotech.com",
        rol: "Agrónomo",
        ultimoAcceso: "2024-05-21 09:15",
        estado: "Activo",
        avatar: ""
    },
    {
        id: 3,
        nombre: "Juan Pedro Caseros",
        email: "jp.caseros@lotes.com",
        rol: "Operador",
        ultimoAcceso: "2024-05-18 18:45",
        estado: "Inactivo",
        avatar: ""
    },
    {
        id: 4,
        nombre: "Sofía Montes",
        email: "s.montes@verdecampo.com",
        rol: "Agrónomo",
        ultimoAcceso: "Hace 10 minutos",
        estado: "Activo",
        avatar: ""
    },
    {
        id: 5,
        nombre: "Ricardo Arrieta",
        email: "r.arrieta@maquinaria.com",
        rol: "Agrónomo",
        ultimoAcceso: "2024-04-30 11:20",
        estado: "Suspendido",
        avatar: ""
    }
    
];

interface UserManagmentProps {
    header?: ReactNode;
}


export default function UserManagment({header}: UserManagmentProps) {
    return (
 
        <>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Gestion de usuarios
            </h2>
        
            <InputGroup className="max-w-full">
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
            </InputGroup>            
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[150px]"></TableHead>
                    <TableHead className="w-[150px]">Nombre y apellido</TableHead>
                    <TableHead>Correo electronico</TableHead>
                    <TableHead className="w-[150px]" >Rol</TableHead>
                    <TableHead className="w-10 text-center">Ultimo acceso</TableHead>
                    <TableHead className="w-10 text-center">Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-black/5 shadow-sm">
                                    {/* Si el usuario tiene URL de imagen, la muestra */}
                                    <AvatarImage src={user.avatar} alt={user.nombre} />
                                    
                                    <AvatarFallback className="bg-green-100 text-green-700 font-bold text-xs uppercase">
                                        {user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
          
                            </div>
                        </TableCell>
                        <TableCell className='truncate table-fixed w-10'>{user.nombre}</TableCell>
                        <TableCell className='w-12 table-fixed'>{user.email}</TableCell>
                      <TableCell >
                            <Badge className={
                                user.rol === 'Administrador' ? 'bg-blue-500' : 
                                user.rol === 'Agrónomo' ? 'bg-green-700' : 'bg-orange-500' 
                                }>
                                {user.rol}
                          </Badge>
                        </TableCell> 
                        <TableCell >{user.ultimoAcceso}</TableCell>
                    <TableCell>
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id={`user-${user.id}`} 
                                    defaultChecked={user.estado === 'Activo'}
                                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                                />
                                <Label 
                                    htmlFor={`user-${user.id}`} 
                                    className="text-xs font-medium text-gray-500 min-w-[50px]"
                                >
                                    {user.estado}
                                </Label>
                            </div>
                        </div>
                    </TableCell>

                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                </TableFooter>
            </Table>
            
            {header && (
                <header className="mb-8 border-b border-black/5 pb-4">
                    <h1 className="text-2xl font-black text-[#0f2e1e] uppercase tracking-tight">
                        {header}
                    </h1>
                </header>
            )}
        </>

    )
}
