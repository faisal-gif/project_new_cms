import Card from '@/Components/Card'
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import InputPassword from '@/Components/InputPassword';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm } from '@inertiajs/react';
import React from 'react'

function LoginForm({ canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };
    return (
        <>
            <Card className='rounded-2xl shadow-2xl p-4 lg:p-6 animate-fade-in'>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Selamat Datang
                    </h2>
                    <p className="text-muted-foreground">
                        Masuk ke akun Anda untuk melanjutkan
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Username atau Email" />

                        <TextInput
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            className="block w-full"
                            autoComplete="username"
                            placeholder="Masukan username atau email"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-2">
                        <InputLabel htmlFor="password" value="Password" />

                        <InputPassword
                            id="password"
                            name="password"
                            value={data.password}
                            className=" w-full"
                            autoComplete="current-password"
                            placeholder="Masukan password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center ">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                className='checkbox-xs'
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>

                          {/* {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="link link-primary text-xs"
                            >
                                Forgot your password?
                            </Link>
                        )} */}
                    </div>

                    <div className="mt-4">
                      

                        <PrimaryButton className="w-full my-2 rounded-lg" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            </Card>
        </>
    )
}

export default LoginForm