import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import React from 'react'

// Form dipakai bersama oleh Create & Edit. `lockedSlug` diisi slug saat Edit
// (slug tidak bisa diubah agar link publik lama tetap hidup).
function EventForm({ form, submit, public_url, submitLabel, lockedSlug = null }) {
    const { data, setData, processing, errors } = form;

    // Preview slug: saat create pakai perkiraan dari name; saat edit pakai slug terkunci.
    const previewSlug = lockedSlug || (data.name || '')
        .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    return (
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-4">
            <div className="lg:col-span-4 w-full">
                <InputLabel htmlFor="name" value="Nama Event" className="mb-2 font-bold" />
                <TextInput
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Contoh: Lomba Menulis Kopi Times 2026"
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="lg:col-span-2 w-full">
                <InputSelect
                    label="Jenis Event"
                    value={data.category}
                    onChange={(e) => setData('category', e.target.value)}
                    options={[
                        { label: 'Event', value: 'event' },
                        { label: 'Public Event (buka form publik)', value: 'public_event' },
                        { label: 'Lomba', value: 'lomba' },
                    ]}
                />
                <InputError message={errors.category} className="mt-2" />
            </div>

            <div className="lg:col-span-6 w-full">
                <InputLabel htmlFor="description" value="Deskripsi / Aturan Event" className="mb-2 font-bold" />
                <textarea
                    id="description"
                    rows="4"
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                    className="textarea textarea-bordered mt-1 block w-full rounded-md shadow-sm"
                    placeholder="Keterangan / aturan event. Untuk public_event ini tampil ke pengirim berita."
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            {/* URL publik siap-bagikan (hanya relevan untuk public_event) */}
            {data.category === 'public_event' && previewSlug && (
                <div className="lg:col-span-6 w-full">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                        <span className="font-semibold text-green-800">URL publik: </span>
                        <span className="break-all text-green-700">{public_url}/kirim-berita/{previewSlug}</span>
                        {!lockedSlug && (
                            <p className="mt-1 text-xs text-green-700/80">Slug final dibuat otomatis & unik saat disimpan.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="lg:col-span-2 w-full">
                <InputLabel htmlFor="quota" value="Kuota Kiriman" className="mb-2 font-bold" />
                <TextInput
                    id="quota"
                    type="number"
                    min="0"
                    value={data.quota}
                    onChange={(e) => setData('quota', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.quota} className="mt-2" />
            </div>

            <div className="lg:col-span-2 w-full">
                <InputLabel htmlFor="starts_at" value="Mulai" className="mb-2 font-bold" />
                <TextInput
                    id="starts_at"
                    type="datetime-local"
                    value={data.starts_at || ''}
                    onChange={(e) => setData('starts_at', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.starts_at} className="mt-2" />
            </div>

            <div className="lg:col-span-2 w-full">
                <InputLabel htmlFor="ends_at" value="Selesai" className="mb-2 font-bold" />
                <TextInput
                    id="ends_at"
                    type="datetime-local"
                    value={data.ends_at || ''}
                    onChange={(e) => setData('ends_at', e.target.value)}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.ends_at} className="mt-2" />
            </div>

            <div className="lg:col-span-6 w-full mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={!!data.enabled}
                        onChange={(e) => setData('enabled', e.target.checked)}
                    />
                    <div>
                        <span className="font-bold text-gray-700">Aktifkan Event</span>
                        <p className="text-sm text-gray-500">Wajib isi waktu mulai & selesai bila diaktifkan. Untuk public_event, form publik hanya terbuka saat aktif & dalam rentang waktu.</p>
                    </div>
                </label>
                <InputError message={errors.enabled} className="mt-2" />
            </div>

            <div className="lg:col-span-6 flex flex-row justify-end mt-4 pt-4 border-t border-gray-100">
                <button type="submit" className="btn btn-primary" disabled={processing}>
                    {processing ? 'Menyimpan...' : submitLabel}
                </button>
            </div>
        </form>
    )
}

export default EventForm
