import Checkbox from '@/components/Checkbox';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import TextInput from '@/components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { KeyRound, Mail, Sprout } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesion" />

            {status && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <div className="mb-7">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f2e1e] shadow-md">
                        <Sprout size={24} className="text-[#d2e7d9]" />
                    </div>
                    <span className="text-[38px] font-extrabold tracking-tight text-[#194230]">
                        VERDECAMPO
                    </span>
                </div>

                <h1 className="text-4xl font-extrabold leading-tight text-[#1f3f31]">
                    Iniciar Sesion
                </h1>
                <p className="mt-1 text-lg text-[#4d685a]">
                    Accede para administrar tus campos
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Correo Electronico" className="text-base font-semibold text-[#2f4d3f]" />
                    <div className="relative mt-1">
                        <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#577465]" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder='JuanPablo42@gmail.com'
                            className="block w-full rounded-xl border-[#4f6b5d] bg-[#eef4ee] py-2.5 pl-10 text-base focus:border-[#2f5f48] focus:ring-[#2f5f48]"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
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
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-[#2f4d3f]">
                            Recordarme
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-[#2f6e53] hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 w-full rounded-xl bg-[#2962ea] px-4 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-[#2053cd] disabled:opacity-60"
                >
                    Iniciar Sesion
                </button>

                <p className="pt-1 text-center text-base text-[#2f4d3f]">
                    ¿No tienes cuenta?{' '}
                    <Link href={route('register')} className="font-bold text-[#2f6e53] hover:underline">
                        Crear Cuenta
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
