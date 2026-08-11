import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'

/**
 * Fieldset kelola data editor (master + nasional + daerah) di dalam form User.
 * Simetris dengan form Editor master; memakai key ber-prefix `editor_`.
 */
export default function EditorFieldset({ data, setData, errors, editor = null }) {
    const showNasional = editor?.has_nasional || data.create_nasional
    const showDaerah = editor?.has_daerah || data.create_daerah

    return (
        <Card title="Data Editor (opsional)">
            <div className="mt-4 space-y-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={data.manage_editor}
                        onChange={(e) => setData('manage_editor', e.target.checked)}
                    />
                    Kelola data editor untuk user ini
                </label>

                {data.manage_editor && (
                    <div className="space-y-4 border rounded-lg p-4 bg-base-200/40">
                        <div>
                            <InputLabel htmlFor="editor_name" value="Nama Editor" className="mb-2 font-bold" />
                            <TextInput
                                id="editor_name"
                                className="mt-1 block w-full"
                                value={data.editor_name}
                                onChange={(e) => setData('editor_name', e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Berlaku di master, nasional, & daerah. Alias nasional dibuat dari nama.
                            </p>
                            <InputError message={errors.editor_name} className="mt-2" />
                        </div>

                        {/* Nasional */}
                        <div className="border-t pt-4">
                            <div className="font-semibold text-sm mb-2">Editor Nasional</div>
                            {!editor?.has_nasional && (
                                <label className="flex items-center gap-2 mb-3">
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
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel value="Deskripsi" className="mb-2 font-bold" />
                                        <InputTextarea
                                            value={data.editor_description}
                                            onChange={(e) => setData('editor_description', e.target.value)}
                                            className="h-24"
                                        />
                                        <InputError message={errors.editor_description} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Foto" className="mb-2 font-bold" />
                                        <InputImage
                                            value={data.editor_image}
                                            existingImage={editor?.image}
                                            targetHeight={400}
                                            targetWidth={400}
                                            onChange={(file) => setData('editor_image', file)}
                                        />
                                        <InputError message={errors.editor_image} className="mt-2" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Daerah */}
                        <div className="border-t pt-4">
                            <div className="font-semibold text-sm mb-2">Editor Daerah</div>
                            {!editor?.has_daerah && (
                                <label className="flex items-center gap-2 mb-3">
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
                                    <InputLabel htmlFor="editor_no_whatsapp" value="No. WhatsApp" className="mb-2 font-bold" />
                                    <TextInput
                                        id="editor_no_whatsapp"
                                        className="mt-1 block w-full"
                                        value={data.editor_no_whatsapp}
                                        onChange={(e) => setData('editor_no_whatsapp', e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                    <InputError message={errors.editor_no_whatsapp} className="mt-2" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}
