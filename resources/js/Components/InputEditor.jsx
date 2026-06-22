import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import EditorImageModal from './EditorImageModal';

export default function InputEditor({
    value,
    onChange,
    height = 800, 
    enableImageUpload = true 
}) {
    // 💡 UPDATE: Menambahkan 'searchreplace' di sebelah 'undo redo'
    const toolbarConfig = [
        'undo redo searchreplace | styles | bold italic underline | alignleft aligncenter alignright alignjustify',
        'bullist numlist outdent indent | ' + (enableImageUpload ? 'customImage ' : '') + 'media link | blockquote table hr'
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
                    min_height: 300,
                    max_height: height,
                    mobile: {
                        max_height: 450,
                        toolbar_mode: 'sliding', 
                    },
                    menubar: false,
                    toolbar_mode: 'wrap',
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
                    image_default_style: 'width:100%;height:auto;max-height:500px;object-fit:cover;',
                    plugins: [
                        'searchreplace', 'lists', 'advlist', 'link', 'image',
                        'charmap', 'preview', 'anchor', 'pagebreak', 'nonbreaking',
                        'visualblocks', 'visualchars', 'code', 'fullscreen', 'code',
                        'insertdatetime', 'media', 'table', 'emoticons', 'help',
                        'wordcount', 'directionality'
                    ],
                    valid_elements: '*[*]',   
                    invalid_elements: 'span,o:p', 

                    // Memanggil Array Toolbar yang baru
                    toolbar: toolbarConfig,

                    style_formats: [
                        { title: 'Heading 2', format: 'h2' },
                        { title: 'Heading 3', format: 'h3' },
                        { title: 'Paragraph', format: 'p' },
                        { title: 'Quote', format: 'blockquote' }
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

                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size:16px; line-height: 1.6; } img { max-width:100%; height:auto; display: block; margin: 1rem auto; }',
                }}
            />

            {enableImageUpload && <EditorImageModal />}
        </>
    );
}