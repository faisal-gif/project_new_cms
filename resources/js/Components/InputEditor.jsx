import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import EditorImageModal from './EditorImageModal';

export default function InputEditor({ 
    value, 
    onChange,
    height = 800, 
    enableImageUpload = true 
}) {
    // 💡 PERBAIKAN: Ubah string panjang menjadi Array of Strings.
    // Setiap elemen di dalam array akan dirender sebagai satu baris (row) baru.
    // Ini menjamin toolbar tidak akan pernah scroll ke samping.
    const toolbarConfig = [
        'undo redo | searchreplace | blocks styles align | numlist bullist',
        (enableImageUpload ? 'customImage ' : '') + 'media link | outdent indent | blockquote | ltr rtl',
        'table | hr pagebreak | charmap emoticons | forecolor backcolor | removeformat code'
    ];

    return (
        <>
            <Editor
                tinymceScriptSrc="/vendor/tinymce/tinymce.min.js"
                referrerPolicy='origin'
                
                value={value}
                onEditorChange={(content, editor) => {
                    onChange(content);
                }}

                init={{
                    license_key: 'gpl',
                    height: height,
                    menubar: false,
                    
                    // Kita bisa tetap menyalakan fitur sliding/wrap sebagai jaga-jaga
                    toolbar_mode: 'sliding', 
                    
                    forced_root_block: 'p',
                    noneditable_class: 'instagram-media',
                    extended_valid_elements: '+script[language|type|src]',
                    file_picker_types: 'image',
                    contextmenu: false,
                    
                    setup: (editor) => {
                        if (enableImageUpload) {
                            editor.ui.registry.addButton('customImage', {
                                icon: 'image',
                                tooltip: 'Upload gambar',
                                onAction: () => {
                                    window.dispatchEvent(
                                        new CustomEvent('open-editor-image-modal', {
                                            detail: { editor }
                                        })
                                    );
                                }
                            });
                        }
                    },
                    
                    image_dimensions: false,
                    image_default_style: 'width:100%;height:500px;',
                    plugins: [
                        'searchreplace', 'lists', 'advlist', 'link', 'image',
                        'charmap', 'preview', 'anchor', 'pagebreak', 'nonbreaking',
                        'visualblocks', 'visualchars', 'code', 'fullscreen', 'code',
                        'insertdatetime', 'media', 'table', 'emoticons', 'help',
                        'wordcount', 'directionality'
                    ],
                    valid_elements: '*[*]',
                    invalid_elements: 'span,o:p',
                    
                    // 💡 Terapkan Array Toolbar di sini
                    toolbar: toolbarConfig,
                    
                    style_formats: [
                        { title: 'Bold', inline: 'strong' },
                        { title: 'Italic', inline: 'em' },
                        { title: 'Underline', inline: 'u' },
                        { title: 'Strikethrough', inline: 'strike' }
                    ],
                    image_title: true,
                    image_advtab: false,
                    automatic_uploads: false,
                    branding: false,
                    promotion: false,
                    paste_data_images: false,
                    images_upload_handler: null,
                    images_file_types: "",
                    block_unsupported_drop: true,
                    paste_postprocess: (plugin, args) => {
                        args.node.querySelectorAll("span").forEach(el => {
                            el.replaceWith(...el.childNodes); 
                        });
                        args.node.querySelectorAll("o\\:p").forEach(el => el.remove());
                        args.node.querySelectorAll("*").forEach(el => {
                            el.removeAttribute("class");
                            el.style.fontFamily = "";
                            el.style.fontSize = "";
                            el.style.lineHeight = "";
                        });
                    },

                    content_style: 'body { font-size:14px } img { max-width:100%; height:auto; }',
                }}
            />
            
            {enableImageUpload && <EditorImageModal />}
        </>
    );
}