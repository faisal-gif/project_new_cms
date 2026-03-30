export default function TiptapToolbar({ editor }) {
  if (!editor) return null

  const btn = (active = false) =>
    `btn btn-sm btn-ghost ${active ? 'btn-active' : ''}`

  const setLink = () => {
    const url = prompt('Masukkan URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const setImage = () => {
    const url = prompt('Image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const findReplace = () => {
    const find = prompt('Find')
    if (!find) return
    const replace = prompt('Replace with') ?? find
    editor.commands.setContent(
      editor.getHTML().replaceAll(find, replace)
    )
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-base-100">

      {/* TEXT STYLE */}
      <div className="join">
        <button className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </button>
        <button className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </button>
        <button className={btn(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </button>
        <button className={btn(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </button>
      </div>

      {/* LIST */}
      <div className="join">
        <button className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button className={btn(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button className={btn()}
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
          ↦
        </button>
        <button className={btn()}
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
          ↤
        </button>
      </div>

      {/* BLOCK */}
      <div className="join">
        <button className={btn(editor.isActive('blockquote'))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </button>
        <button className={btn()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ―
        </button>
      </div>

      {/* ALIGN */}
      <div className="dropdown">
        <button tabIndex={0} className="btn btn-sm btn-ghost">Align</button>
        <ul tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36">
          <li><a onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</a></li>
          <li><a onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</a></li>
          <li><a onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</a></li>
        </ul>
      </div>

      {/* RTL / LTR */}
      <div className="join">
        <button className={btn()}
          onClick={() => editor.chain().focus().setNodeAttribute('paragraph', 'dir', 'rtl').run()}>
          RTL
        </button>
        <button className={btn()}
          onClick={() => editor.chain().focus().setNodeAttribute('paragraph', 'dir', 'ltr').run()}>
          LTR
        </button>
      </div>

      {/* LINK & IMAGE */}
      <div className="join">
        <button className={btn(editor.isActive('link'))} onClick={setLink}>
          Link
        </button>
        <button className={btn()} onClick={setImage}>
          Image URL
        </button>
      </div>

      {/* TABLE */}
      <div className="dropdown">
        <button tabIndex={0} className="btn btn-sm btn-ghost">Table</button>
        <ul tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44">
          <li><a onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>Insert</a></li>
          <li><a onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row</a></li>
          <li><a onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Column</a></li>
          <li><a onClick={() => editor.chain().focus().deleteTable().run()}>Delete</a></li>
        </ul>
      </div>

      {/* COLORS */}
      <div className="join">
        <input type="color"
          className="w-8 h-8 cursor-pointer"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
        <input type="color"
          className="w-8 h-8 cursor-pointer"
          onChange={e => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} />
      </div>

      {/* UTIL */}
      <div className="join">
        <button className={btn()} onClick={findReplace}>Find</button>
        <button className={btn()}
          onClick={() =>
            editor.commands.insertContent('<hr class="page-break" />')
          }>
          Page
        </button>
      </div>
    </div>
  )
}
