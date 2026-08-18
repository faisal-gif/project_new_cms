import Card from '@/Components/Card'
import { Button } from '@/Components/ui/button';
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import { useForm } from '@inertiajs/react'
import Select from 'react-select'

export default function WriterForm({ writer = null, networks = [], nasionals = [], daerahs = [] }) {
    const isEdit = !!writer

    const { data, setData, post, processing, errors } = useForm({
        name: writer?.name || '',
        email: writer?.email || '',
        password: '',
        no_whatsapp: writer?.no_whatsapp || '',
        date_exp: writer?.date_exp || '',
        network_id: writer?.network_id || null,
        status: writer?.status ?? '1',
        // nasional (journalist)
        nasional_id: null,
        daerah_id: null,
        bio: writer?.bio || '',
        region: writer?.region || '',
        image: null,
        create_nasional: false,
        create_daerah: false,
        ...(isEdit ? { _method: 'PUT' } : {}),
    })

    const submit = (e) => {
        e.preventDefault()
        const url = isEdit ? route('admin.writers.update', writer.id) : route('admin.writers.store')
        post(url, { forceFormData: true })
    }

    const showNasional = writer?.has_nasional || data.create_nasional || !!data.nasional_id

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Akun Writer (master) */}
            <Card title="Data Penulis">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama" className="mb-2 font-bold" />
                        <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <p className="text-xs text-gray-500 mt-1">Berlaku di master, nasional, & daerah. Slug nasional dibuat dari nama.</p>
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div className="w-full lg:w-60">
                        <InputSelect
                            label="Status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            options={[{ label: 'Aktif', value: '1' }, { label: 'Non-aktif', value: '0' }]}
                        />
                        <InputError message={errors.status} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="email" value="Email" className="mb-2 font-bold" />
                        <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="password" value={isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password'} className="mb-2 font-bold" />
                        <InputPassword id="password" name="password" className="w-full" autoComplete="new-password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="no_whatsapp" value="No. WhatsApp" className="mb-2 font-bold" />
                        <TextInput id="no_whatsapp" className="mt-1 block w-full" value={data.no_whatsapp} onChange={(e) => setData('no_whatsapp', e.target.value)} placeholder="08xxxxxxxxxx" />
                        <InputError message={errors.no_whatsapp} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="date_exp" value="Tanggal Kadaluarsa" className="mb-2 font-bold" />
                        <TextInput id="date_exp" type="date" className="mt-1 block w-full" value={data.date_exp} onChange={(e) => setData('date_exp', e.target.value)} />
                        <InputError message={errors.date_exp} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel value="Network" className="mb-2 font-bold" />
                        <Select
                            options={networks}
                            isClearable
                            placeholder="Pilih network..."
                            value={networks.find((n) => n.value === data.network_id) || null}
                            onChange={(o) => setData('network_id', o ? o.value : null)}
                        />
                        <InputError message={errors.network_id} className="mt-2" />
                    </div>
                </div>
            </Card>

            {/* Nasional (journalist) */}
            <Card title="Penulis Nasional">
                <div className="mt-4 space-y-4">
                    {!writer?.has_nasional && (
                        <div className="space-y-2">
                            <div>
                                <InputLabel value="Taut ke penulis nasional yang sudah ada" className="mb-1 text-sm" />
                                <Select
                                    options={nasionals}
                                    isClearable
                                    isDisabled={data.create_nasional}
                                    placeholder="Pilih akun nasional..."
                                    value={nasionals.find((n) => n.value === data.nasional_id) || null}
                                    onChange={(o) => setData('nasional_id', o ? o.value : null)}
                                />
                                <InputError message={errors.nasional_id} className="mt-2" />
                            </div>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" checked={data.create_nasional} disabled={!!data.nasional_id} onChange={(e) => setData('create_nasional', e.target.checked)} />
                                atau buat data penulis nasional baru
                            </label>
                        </div>
                    )}
                    {showNasional && (
                        <>
                            <div>
                                <InputLabel value="Region" className="mb-2 font-bold" />
                                <TextInput className="mt-1 block w-full" value={data.region} onChange={(e) => setData('region', e.target.value)} />
                                <InputError message={errors.region} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Bio" className="mb-2 font-bold" />
                                <InputTextarea value={data.bio} onChange={(e) => setData('bio', e.target.value)} className="h-24" />
                                <InputError message={errors.bio} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel value="Foto" className="mb-2 font-bold" />
                                <InputImage value={data.image} existingImage={writer?.image} targetHeight={400} targetWidth={400} onChange={(file) => setData('image', file)} />
                                <InputError message={errors.image} className="mt-2" />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Daerah (writers) */}
            <Card title="Penulis Daerah">
                <div className="mt-4 space-y-2">
                    {writer?.has_daerah ? (
                        <p className="text-sm text-gray-600">Data penulis daerah sudah ada & mengikuti nama di atas.</p>
                    ) : (
                        <>
                            <div>
                                <InputLabel value="Taut ke penulis daerah yang sudah ada" className="mb-1 text-sm" />
                                <Select
                                    options={daerahs}
                                    isClearable
                                    isDisabled={data.create_daerah}
                                    placeholder="Pilih akun daerah..."
                                    value={daerahs.find((d) => d.value === data.daerah_id) || null}
                                    onChange={(o) => setData('daerah_id', o ? o.value : null)}
                                />
                                <InputError message={errors.daerah_id} className="mt-2" />
                            </div>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" checked={data.create_daerah} disabled={!!data.daerah_id} onChange={(e) => setData('create_daerah', e.target.checked)} />
                                atau buat data penulis daerah baru (menyalin email, no. WhatsApp, network dari master)
                            </label>
                        </>
                    )}
                </div>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing}>
                    {isEdit ? 'Simpan Perubahan' : 'Simpan'}
                </Button>
            </div>
        </form>
    )
}
