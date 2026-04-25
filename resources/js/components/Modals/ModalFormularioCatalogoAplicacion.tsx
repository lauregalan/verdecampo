import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/Modals/Modal";
import InputLabel from "@/components/InputLabel";
import TextInput from "@/components/TextInput";

interface OptionField {
    label: string;
    value: string;
}

interface FieldConfig {
    name: string;
    label: string;
    placeholder?: string;
    type?: "text" | "select";
    options?: OptionField[];
}

interface ModalFormularioCatalogoAplicacionProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (values: Record<string, string>) => Promise<string | null>;
    initialValues: Record<string, string>;
    fields: FieldConfig[];
    title: string;
    description: string;
    submitLabel: string;
}

export default function ModalFormularioCatalogoAplicacion({
    show,
    onClose,
    onSubmit,
    initialValues,
    fields,
    title,
    description,
    submitLabel,
}: ModalFormularioCatalogoAplicacionProps) {
    const [values, setValues] = useState<Record<string, string>>(initialValues);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!show) return;
        setValues(initialValues);
        setSubmitError(null);
    }, [initialValues, show]);

    const updateField = (name: string, value: string) => {
        setValues((current) => ({ ...current, [name]: value }));
        if (submitError) {
            setSubmitError(null);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setSubmitError(null);

        const errorMessage = await onSubmit(values);
        if (!errorMessage) {
            onClose();
        } else {
            setSubmitError(errorMessage);
        }

        setSaving(false);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="flex max-h-[90vh] flex-col rounded-2xl bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 px-6 pb-4 pt-5">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
                        <p className="mt-1 text-sm text-stone-500">{description}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    id="catalogo-aplicacion-form"
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
                >
                    {fields.map((field) => (
                        <div key={field.name}>
                            <InputLabel
                                htmlFor={`catalogo-${field.name}`}
                                value={field.label}
                            />

                            {field.type === "select" ? (
                                <select
                                    id={`catalogo-${field.name}`}
                                    value={values[field.name] ?? ""}
                                    onChange={(event) =>
                                        updateField(field.name, event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                                    required
                                >
                                    <option value="">
                                        {field.placeholder ?? "Seleccioná una opción"}
                                    </option>
                                    {field.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <TextInput
                                    id={`catalogo-${field.name}`}
                                    value={values[field.name] ?? ""}
                                    onChange={(event) =>
                                        updateField(field.name, event.target.value)
                                    }
                                    placeholder={field.placeholder}
                                    className="mt-2 w-full rounded-2xl border-stone-300 bg-stone-50 px-4 py-3"
                                    required
                                />
                            )}
                        </div>
                    ))}

                    {submitError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {submitError}
                        </div>
                    )}
                </form>

                <div className="flex justify-end gap-3 border-t border-stone-200 px-6 pb-5 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="catalogo-aplicacion-form"
                        disabled={saving}
                        className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    >
                        {saving ? "Guardando..." : submitLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
