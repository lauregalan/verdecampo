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

const buildCalendarDays = (visibleMonth: Date) => {
    const firstDay = new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
        1,
    );
    const daysInMonth = new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + 1,
        0,
    ).getDate();
    const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

    return [
        ...Array.from({ length: mondayFirstOffset }, () => null),
        ...Array.from(
            { length: daysInMonth },
            (_, index) =>
                new Date(
                    visibleMonth.getFullYear(),
                    visibleMonth.getMonth(),
                    index + 1,
                ),
        ),
    ];
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
        selectedDate ?? min ?? new Date(),
    );

    useEffect(() => {
        setVisibleMonth(selectedDate ?? min ?? new Date());
    }, [minDate, value]);

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
            <PopoverContent align="start" className="w-72 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                    <button
                        type="button"
                        disabled={!canGoPrevious}
                        onClick={() =>
                            setVisibleMonth((current) =>
                                addMonths(current, -1),
                            )
                        }
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
                        onClick={() =>
                            setVisibleMonth((current) => addMonths(current, 1))
                        }
                        className="rounded-md p-1 text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-500">
                    {["LU", "MA", "MI", "JU", "VI", "SA", "DO"].map((day) => (
                        <div key={day} className="py-1">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} />;
                        }

                        const dateValue = toDateInput(date);
                        const isSelected = value === dateValue;
                        const isBeforeMin = minDate && dateValue < minDate;
                        const isAfterMax = maxDate && dateValue > maxDate;
                        const isDisabled =
                            disableOutOfRange &&
                            Boolean(isBeforeMin || isAfterMax);
                        const isInRange =
                            (!minDate || dateValue >= minDate) &&
                            (!maxDate || dateValue <= maxDate);

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
                                    isDisabled
                                        ? "cursor-not-allowed opacity-75"
                                        : "",
                                ].join(" ")}
                            >
                                {date.getDate()}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
