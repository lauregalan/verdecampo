import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const monthFormatter = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
});

const displayDateFormatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const normalizeDateInput = (value: string) => value.slice(0, 10);

const parseDateInput = (value?: string | null) => {
    if (!value) return null;
    const [year, month, day] = normalizeDateInput(value).split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const toDateInput = (date: Date) =>
    [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

const addMonths = (date: Date, amount: number) =>
    new Date(date.getFullYear(), date.getMonth() + amount, 1);

const buildCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Ajustar para lunes = 0, domingo = 6
    const startDay = (firstDay.getDay() + 6) % 7;

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return days;
};

const parseManualDateInput = (input: string): string | null => {
    const cleaned = input.trim();
    const match = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);

    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

    return toDateInput(date);
};

interface CalendarDatePickerProps {
    value: string;
    minDate?: string;
    maxDate?: string;
    disabled?: boolean;
    disableOutOfRange?: boolean;
    restrictNavigationToRange?: boolean;
    placeholder?: string;
    disabledLabel?: string;
    onChange: (value: string) => void;
}

export default function CalendarDatePicker({
    value,
    minDate,
    maxDate,
    disabled = false,
    disableOutOfRange = true,
    restrictNavigationToRange = false,
    placeholder = "Selecciona una fecha",
    disabledLabel = "Selecciona una fecha",
    onChange,
}: CalendarDatePickerProps) {
    const selectedDate = parseDateInput(value);
    const min = parseDateInput(minDate);
    const max = parseDateInput(maxDate);
    const [open, setOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState<Date>(
        selectedDate ?? new Date(),
    );

    // Inicializar el input manual con el formato DD/MM/YYYY
    const [manualInput, setManualInput] = useState(
        value ? value.split('-').reverse().join('/') : ""
    );

    // Sincronizar input cuando cambia el valor externo (ej: cambio de fecha desde fuera)
    useEffect(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                setManualInput(`${parts[2]}/${parts[1]}/${parts[0]}`);
            }
        } else {
            setManualInput("");
        }
        if (selectedDate) setVisibleMonth(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Sincronización en tiempo real con el calendario
    useEffect(() => {
        const parsed = parseManualDateInput(manualInput);
        if (parsed) {
            const date = parseDateInput(parsed);
            if (date) setVisibleMonth(date); // Actualiza el calendario mientras el usuario escribe
        }
    }, [manualInput]);

    const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
    const selectedLabel = selectedDate
        ? displayDateFormatter.format(selectedDate)
        : disabled
          ? disabledLabel
          : placeholder;

    const canGoPrevious =
        !restrictNavigationToRange ||
        !min ||
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1) >
            new Date(min.getFullYear(), min.getMonth(), 1);

    const canGoNext =
        !restrictNavigationToRange ||
        !max ||
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1) <
            new Date(max.getFullYear(), max.getMonth(), 1);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={disabled}
                    className="mt-1 flex w-full items-center justify-between rounded-md border border-green-700 bg-white px-3 py-2 text-left text-sm shadow-sm transition focus:border-green-800 focus:outline-none focus:ring-1 focus:ring-green-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                >
                    <span>{selectedLabel}</span>
                    <CalendarDays size={16} className="text-green-800" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 bg-white p-3" side="bottom" sideOffset={8}>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-stone-700">
                            Ingresa la fecha (DD/MM/YYYY)
                        </label>
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => {
                                setManualInput(e.target.value);
                                const parsed = parseManualDateInput(e.target.value);
                                if (parsed) {
                                    onChange(parsed); // Actualiza el valor en tiempo real
                                }
                            }}
                            onKeyDown={(e) => {
                                // Mantenemos el Enter por si el usuario quiere cerrar el calendario rápido
                                if (e.key === 'Enter') {
                                    const parsed = parseManualDateInput(manualInput);
                                    if (parsed) {
                                        onChange(parsed);
                                        setOpen(false);
                                    }
                                }
                            }}
                            placeholder="DD/MM/YYYY"
                            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-green-700 focus:ring-1 focus:ring-green-700"
                        />
                    </div>

                    <div className="border-t border-stone-200 pt-3">
                        <div className="mb-3 flex items-center justify-between">
                            <button
                                type="button"
                                disabled={!canGoPrevious}
                                onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                                className="rounded-md p-1 text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="text-sm font-semibold capitalize text-stone-900">
                                {monthFormatter.format(visibleMonth)}
                            </div>
                            <button
                                type="button"
                                disabled={!canGoNext}
                                onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                                className="rounded-md p-1 text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-500">
                            {["LU", "MA", "MI", "JU", "VI", "SA", "DO"].map((day) => (
                                <div key={day} className="py-1">{day}</div>
                            ))}
                        </div>

                        <div className="mt-1 grid grid-cols-7 gap-1">
                            {days.map((date, index) => {
                                if (!date) return <div key={`empty-${index}`} />;

                                const dateValue = toDateInput(date);
                                const isSelected = value === dateValue;
                                const isBeforeMin = minDate && dateValue < minDate;
                                const isAfterMax = maxDate && dateValue > maxDate;
                                const isDisabled = disableOutOfRange && Boolean(isBeforeMin || isAfterMax);
                                const isInRange = (!minDate || dateValue >= minDate) && (!maxDate || dateValue <= maxDate);

                                return (
                                    <button
                                        key={dateValue}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => {
                                            onChange(dateValue);
                                            setOpen(false);
                                        }}
                                        className={[
                                            "h-8 rounded-md text-sm transition",
                                            isSelected
                                                ? "bg-green-700 font-semibold text-white"
                                                : isInRange
                                                  ? "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                                                  : "bg-stone-50 text-stone-500 hover:bg-stone-100",
                                            isDisabled ? "cursor-not-allowed opacity-75" : "",
                                        ].join(" ")}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
