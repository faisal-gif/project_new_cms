import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';

import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageStyle, ImageToolbar, PictureEditing, ImageInsertViaUrl } from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
    TextTransformation,
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
  
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageInsertViaUrl,
    CloudServices,
    CKBox,
    CKFinder,
    EasyImage,
    List,
    Indent,
    Link,
    MediaEmbed,
    PasteFromOffice,
    Table,
    TableToolbar,
    PictureEditing
];

ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
           
            'insertTable',
            'uploadImage',
            'mediaEmbed',
            'undo',
            'redo'
        ]
    },
    image: {
        toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            'imageTextAlternative',
            'toggleImageCaption',
            'imageInsertViaUrl'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    language: 'en'
};
