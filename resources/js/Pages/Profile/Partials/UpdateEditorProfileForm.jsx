import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import InputImage from '@/Components/InputImage';
import InputTextarea from '@/Components/InputTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function UpdateEditorProfileForm({ editor, className = '' }) {
    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: editor.name || '',
            alias: editor.alias || '',
            description: editor.description || '',
            image: null,
            no_whatsapp: editor.no_whatsapp || '',
        });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.editor.update'), { forceFormData: true });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profil Editor
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Kelola data editor kamu. Mengubah <strong>Nama</strong> akan berlaku
                    otomatis di editor master, nasional, dan daerah.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Nama — cascade ke semua */}
                <div>
                    <InputLabel htmlFor="name" value="Nama (berlaku di semua)" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Field Nasional */}
                {editor.has_nasional && (
                    <>
                        <div>
                            <InputLabel htmlFor="alias" value="Alias (Nasional)" />
                            <TextInput
                                id="alias"
                                className="mt-1 block w-full"
                                value={data.alias}
                                onChange={(e) => setData('alias', e.target.value)}
                            />
                            <InputError className="mt-2" message={errors.alias} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Deskripsi (Nasional)" />
                            <InputTextarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="h-24"
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div>
                            <InputLabel value="Foto (Nasional)" />
                            <div className="mt-1">
                                <InputImage
                                    value={data.image}
                                    existingImage={editor.image}
                                    targetHeight={400}
                                    targetWidth={400}
                                    onChange={(file) => setData('image', file)}
                                />
                            </div>
                            <InputError className="mt-2" message={errors.image} />
                        </div>
                    </>
                )}

                {/* Field Daerah */}
                {editor.has_daerah && (
                    <div>
                        <InputLabel htmlFor="no_whatsapp" value="No. WhatsApp (Daerah)" />
                        <TextInput
                            id="no_whatsapp"
                            className="mt-1 block w-full"
                            value={data.no_whatsapp}
                            onChange={(e) => setData('no_whatsapp', e.target.value)}
                            placeholder="08xxxxxxxxxx"
                        />
                        <InputError className="mt-2" message={errors.no_whatsapp} />
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                    {recentlySuccessful && (
                        <p className="text-sm text-gray-600">Tersimpan.</p>
                    )}
                </div>
            </form>
        </section>
    );
}
