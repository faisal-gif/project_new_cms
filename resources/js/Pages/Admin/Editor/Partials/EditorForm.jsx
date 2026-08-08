import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import { Link, useForm } from '@inertiajs/react'
import Select from 'react-select'

export default function EditorForm({ editor = null, users = [], roles = [] }) {
    const isEdit = !!editor
    const roleOptions = roles.map((r) => ({ value: r, label: r }))

    const { data, setData, post, processing, errors } = useForm({
        name: editor?.name || '',
        status: editor?.status ?? '1',
        // akun
        user_id: editor?.user_id || null,
        create_user: false,
        full_name: '',
        username: '',
        email: '',
        password: '',
        roles: ['editor'],
        // nasional / daerah
        description: editor?.description || '',
        image: null,
        no_whatsapp: editor?.no_whatsapp || '',
        create_nasional: false,
        create_daerah: false,
        ...(isEdit ? { _method: 'PUT' } : {}),
    })

    const submit = (e) => {
        e.preventDefault()
        const url = isEdit
            ? route('admin.editors.update', editor.id)
            : route('admin.editors.store')
        post(url, { forceFormData: true })
    }

    const showNasional = editor?.has_nasional || data.create_nasional
    const showDaerah = editor?.has_daerah || data.create_daerah

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Akun & Status */}
            <Card title="Akun & Status">
                <div className="mt-4 space-y-4">
                    <div className="w-full lg:w-60">
                        <InputSelect
                            label="Status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            options={[
                                { label: 'Aktif', value: '1' },
                                { label: 'Non-aktif', value: '0' },
                            ]}
                        />
                        <InputError message={errors.status} className="mt-2" />
                    </div>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={data.create_user}
                            onChange={(e) => setData('create_user', e.target.checked)}
                        />
                        Buat akun user baru
                    </label>

                    {data.create_user ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border rounded-lg p-4 bg-base-200/40">
                            <div>
                                <InputLabel value="Nama Lengkap" className="mb-2 font-bold" />
                                <TextInput className="mt-1 block w-full" value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} />
                                <InputError message={errors.full_name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Username" className="mb-2 font-bold" />
                                <TextInput className="mt-1 block w-full" value={data.username} onChange={(e) => setData('username', e.target.value)} />
                                <InputError message={errors.username} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Email" className="mb-2 font-bold" />
                                <TextInput type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="password" value="Password" className="mb-2 font-bold" />
                                <InputPassword
                                    id="password"
                                    name="password"
                                    className="w-full"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                            <div className="lg:col-span-2">
                                <InputLabel value="Role" className="mb-2 font-bold" />
                                <Select
                                    isMulti
                                    options={roleOptions}
                                    value={roleOptions.filter((o) => data.roles.includes(o.value))}
                                    onChange={(vals) => setData('roles', vals.map((v) => v.value))}
                                    placeholder="Pilih role..."
                                />
                                <InputError message={errors.roles} className="mt-2" />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <InputLabel value="Taut ke User (opsional)" className="mb-2 font-bold" />
                            <Select
                                options={users}
                                isClearable
                                placeholder="Pilih user..."
                                value={users.find((u) => u.value === data.user_id) || null}
                                onChange={(o) => setData('user_id', o ? o.value : null)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Kelola akun user lebih detail di menu{' '}
                                <Link href={route('admin.users.index')} className="text-primary underline">Users</Link>.
                            </p>
                            <InputError message={errors.user_id} className="mt-2" />
                        </div>
                    )}
                </div>
            </Card>

            {/* Nama (cascade) */}
            <Card title="Data Editor">
                <div className="mt-4">
                    <InputLabel htmlFor="name" value="Nama" className="mb-2 font-bold" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Berlaku otomatis di master, nasional, & daerah. Alias nasional dibuat dari nama.
                    </p>
                    <InputError message={errors.name} className="mt-2" />
                </div>
            </Card>

            {/* Nasional */}
            <Card title="Editor Nasional">
                <div className="mt-4 space-y-4">
                    {!editor?.has_nasional && (
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={data.create_nasional}
                                onChange={(e) => setData('create_nasional', e.target.checked)}
                            />
                            Buat data editor nasional
                        </label>
                    )}
                    {showNasional && (
                        <>
                            <div>
                                <InputLabel value="Deskripsi" className="mb-2 font-bold" />
                                <InputTextarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="h-24"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Foto" className="mb-2 font-bold" />
                                <InputImage
                                    value={data.image}
                                    existingImage={editor?.image}
                                    targetHeight={400}
                                    targetWidth={400}
                                    onChange={(file) => setData('image', file)}
                                />
                                <InputError message={errors.image} className="mt-2" />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Daerah */}
            <Card title="Editor Daerah">
                <div className="mt-4 space-y-4">
                    {!editor?.has_daerah && (
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={data.create_daerah}
                                onChange={(e) => setData('create_daerah', e.target.checked)}
                            />
                            Buat data editor daerah
                        </label>
                    )}
                    {showDaerah && (
                        <div>
                            <InputLabel htmlFor="no_whatsapp" value="No. WhatsApp" className="mb-2 font-bold" />
                            <TextInput
                                id="no_whatsapp"
                                className="mt-1 block w-full"
                                value={data.no_whatsapp}
                                onChange={(e) => setData('no_whatsapp', e.target.value)}
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.no_whatsapp} className="mt-2" />
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={processing}>
                    {isEdit ? 'Simpan Perubahan' : 'Simpan'}
                </button>
            </div>
        </form>
    )
}
