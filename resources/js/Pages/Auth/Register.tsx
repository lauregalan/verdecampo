import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { KeyRound, Mail, Sprout, User } from 'lucide-react';

export default function Register({emailInvitado}: {emailInvitado?: string}) {
    const queryParams = new URLSearchParams(window.location.search);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: emailInvitado,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registro" />

            <div className="mb-7 flex flex-col items-center justify-center">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2e1e] shadow-md">
                        <Sprout size={24} className="text-[#d2e7d9]" />
                    </div>
                    <span className="text-[38px] font-extrabold tracking-tight text-[#194230]">
                        VERDECAMPO
                    </span>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-[#1f3f31]">
                    Registrar Cuenta
                </h1>
                <p className="mt-1 text-lg text-[#4d685a]">
                    Administra tus campos con Verdecampo
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">

                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#d2e7d9] text-[#2f5f48] shadow-md border-2 border-[#4f6b5d]">
                        <User size={40} strokeWidth={1.5} />
                    </div>
                    
                    <p className="text-sm font-medium text-[#4d685a]">Completando registro para:</p>
                    <p className="text-xl font-bold tracking-tight text-[#194230] mt-1 break-all">
                        {data.email || 'correo@ejemplo.com'}
                    </p>
                </div>


                <div>
                    <InputLabel htmlFor="password" value="Contrasena" className="text-base font-semibold text-[#2f4d3f]" />
                    <div className="relative mt-1">
                        <KeyRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#577465]" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder='**********'
                            className="block w-full rounded-xl border-[#4f6b5d] bg-[#eef4ee] py-2.5 pl-10 text-base focus:border-[#2f5f48] focus:ring-[#2f5f48]"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contrasena" className="text-base font-semibold text-[#2f4d3f]" />
                    <div className="relative mt-1">
                        <KeyRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#577465]" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder='**********'
                            className="block w-full rounded-xl border-[#4f6b5d] bg-[#eef4ee] py-2.5 pl-10 text-base focus:border-[#2f5f48] focus:ring-[#2f5f48]"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 w-full rounded-xl bg-[#2962ea] px-4 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-[#2053cd] disabled:opacity-60"
                >
                    Registrarme
                </button>

                <p className="pt-1 text-center text-base text-[#2f4d3f]">
                    ¿Ya tienes cuenta?{' '}
                    <Link href={route('login')} className="font-bold text-[#2f6e53] hover:underline">
                        Iniciar Sesion
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
