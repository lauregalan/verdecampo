import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
    id: string;
    header: ReactNode;
    headerClassName?: string;
    cellClassName?: string;
    cell: (row: T) => ReactNode;
}

export interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    from?: number;
    to?: number;
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    keyExtractor: (row: T) => string | number;
    loading?: boolean;
    emptyMessage?: string;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    tableClassName?: string;
    className?: string;
}

function getPageNumbers(current: number, last: number): (number | null)[] {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

    const pages: (number | null)[] = [1];
    if (current > 3) pages.push(null);

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < last - 2) pages.push(null);
    pages.push(last);

    return pages;
}

function PaginationControls({
    pagination,
    onPageChange,
}: {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
}) {
    const { currentPage, lastPage, total, from, to } = pagination;
    const pages = getPageNumbers(currentPage, lastPage);

    return (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-500">
                {from != null && to != null
                    ? `Mostrando ${from}–${to} de ${total}`
                    : `${total} resultados`}
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={16} />
                </button>

                {pages.map((page, i) =>
                    page === null ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-gray-400 select-none">
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition",
                                page === currentPage
                                    ? "bg-green-700 text-white"
                                    : "text-gray-700 hover:bg-gray-100",
                            )}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Página siguiente"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    loading = false,
    emptyMessage = "No hay datos para mostrar.",
    pagination,
    onPageChange,
    tableClassName,
    className,
}: DataTableProps<T>) {
    return (
        <div className={className}>
            <Table className={tableClassName}>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.id} className={col.headerClassName}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="py-10 text-center text-sm text-gray-500"
                            >
                                Cargando...
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="py-10 text-center text-sm text-gray-500"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={keyExtractor(row)}>
                                {columns.map((col) => (
                                    <TableCell key={col.id} className={col.cellClassName}>
                                        {col.cell(row)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {pagination && onPageChange && pagination.lastPage > 1 && (
                <PaginationControls pagination={pagination} onPageChange={onPageChange} />
            )}
        </div>
    );
}
