import { PropsWithChildren, ReactNode } from 'react';
import { 
    LayoutDashboard, 
    Sprout, 
    Settings, 
    LogOut, 
    User,
    ChevronUp, // Útil para el menú de usuario
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
import { Checkbox } from '@headlessui/react';



// ya saco esta cagada
const invoices = [
  {
    status: true,
    invoice: "INV001",
    email: "Laure@mail.dom",
    lastConnection: "1/2/2026",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    status: true,
    invoice: "INV002",
    email: "Laure@mail.dom",
    lastConnection: "1/2/2026",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    status: false,
    invoice: "INV003",
    email: "Laure@mail.dom",
    lastConnection: "1/2/2026",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    status: false,
    invoice: "INV004",
    email: "Laure@mail.dom",
    lastConnection: "1/2/2026",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    status: true,
    invoice: "INV005",
    email: "Laure@mail.dom",
    lastConnection: "1/2/2026",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    status: false,
    invoice: "INV006",
    email: "asdasdfasdfasdfklasd;j-fixedtable-fixedtable-fixed;",
    lastConnection: "1/2/2026",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    status: true,
    invoice: "INV007",
    email: "Laure@mail.dom",
    lastConnection: "1/2/2026",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

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
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[150px]">Nombre y apellido</TableHead>
                    <TableHead>Correo electronico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="w-10 text-center">Ultimo acceso</TableHead>
                    <TableHead className="w-10 text-center">Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="truncate table-fixed w-20 font-medium">{invoice.invoice}</TableCell>
                        <TableCell className='truncate table-fixed w-10'>{invoice.email}</TableCell>
                        <TableCell className='w-12 table-fixed'>{invoice.paymentMethod}</TableCell>
                        <TableCell className="w-20 text-center">{invoice.lastConnection}</TableCell>
                        <TableCell className="w-18 text-center">
                          {<input type="checkbox"
                            className="size-4 accent-green-600 cursor-pointer"
                            checked={invoice.status}>
                              </input>}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    {/*<TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>*/}
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
