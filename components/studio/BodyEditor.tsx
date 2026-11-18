'use client'

import {
  defineAnnotation,
  defineBlockObject,
  defineDecorator,
  defineSchema,
  defineTextBlock,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  type BlockObjectRenderProps,
  type PortableTextBlock,
} from '@portabletext/editor'
import { EventListenerPlugin, NodePlugin } from '@portabletext/editor/plugins'
import * as selectors from '@portabletext/editor/selectors'
import { createContext, useContext, useEffect, useState } from 'react'

import { estimatedReadTime, wordCount, youtubeId, type BodyBlock } from '@/lib/studio/document'

import { Dialog } from './Dialog'
import { mediaToImage } from './ImageField'
import { MediaPicker } from './MediaPicker'
import type { UploadMode } from './upload'

// What the article body can contain. Must match components/blog/ArticleBody.tsx.
const schemaDefinition = defineSchema({
  styles: [
    { name: 'normal', title: 'Paragraph' },
    { name: 'h2', title: 'Heading 2' },
    { name: 'h3', title: 'Heading 3' },
    { name: 'h4', title: 'Heading 4' },
    { name: 'blockquote', title: 'Quote' },
  ],
  decorators: [
    { name: 'strong', title: 'Bold' },
    { name: 'em', title: 'Italic' },
    { name: 'code', title: 'Inline code' },
  ],
  annotations: [{ name: 'link', title: 'Link', fields: [{ name: 'href', type: 'string' }] }],
  lists: [
    { name: 'bullet', title: 'Bulleted list' },
    { name: 'number', title: 'Numbered list' },
  ],
  blockObjects: [
    {
      name: 'localImage',
      title: 'Image',
      fields: [
        { name: 'mediaId', type: 'string' },
        { name: 'src', type: 'string' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'alt', type: 'string' },
        { name: 'caption', type: 'string' },
        { name: 'credit', type: 'string' },
        { name: 'creditUrl', type: 'string' },
      ],
    },
    { name: 'youtube', title: 'YouTube video', fields: [{ name: 'url', type: 'string' }] },
    {
      name: 'code',
      title: 'Code block',
      fields: [
        { name: 'code', type: 'string' },
        { name: 'language', type: 'string' },
      ],
    },
  ],
  inlineObjects: [],
})

type ObjectEdit = { path: BlockObjectRenderProps['path']; node: Record<string, unknown> }
const EditObjectContext = createContext<(edit: ObjectEdit) => void>(() => {})

const HOTKEYS = { marks: { 'mod+b': 'strong', 'mod+i': 'em', "mod+'": 'code' } }

const textBlock = defineTextBlock({
  type: 'block',
  render: ({ attributes, children, node }) => {
    if (node.listItem) {
      const level = Math.max(1, node.level || 1)
      return (
        <div {...attributes} className={`st-li ${node.listItem}`} style={{ marginLeft: 22 * level }}>
          {children}
        </div>
      )
    }
    switch (node.style) {
      case 'h2':
        return <h2 {...attributes}>{children}</h2>
      case 'h3':
        return <h3 {...attributes}>{children}</h3>
      case 'h4':
        return <h4 {...attributes}>{children}</h4>
      case 'blockquote':
        return <blockquote {...attributes}>{children}</blockquote>
      default:
        return (
          <div {...attributes} className="st-p">
            {children}
          </div>
        )
    }
  },
})

const nodes = [
  textBlock,
  defineDecorator({ type: 'strong', render: ({ children }) => <strong>{children}</strong> }),
  defineDecorator({ type: 'em', render: ({ children }) => <em>{children}</em> }),
  defineDecorator({ type: 'code', render: ({ children }) => <code>{children}</code> }),
  defineAnnotation({
    type: 'link',
    render: ({ annotation, children }) => (
      <span className="st-link" title={String((annotation as { href?: string }).href || '')}>
        {children}
      </span>
    ),
  }),
  defineBlockObject({ type: 'localImage', render: (props) => <BlockObjectCard {...props} /> }),
  defineBlockObject({ type: 'youtube', render: (props) => <BlockObjectCard {...props} /> }),
  defineBlockObject({ type: 'code', render: (props) => <BlockObjectCard {...props} /> }),
]

function BlockObjectCard({ attributes, children, node, path, selected }: BlockObjectRenderProps) {
  const editor = useEditor()
  const openEdit = useContext(EditObjectContext)
  const value = node as Record<string, unknown> & { _type: string }
  let preview: React.ReactNode = null
  let kind = ''
  let warning = ''
  if (value._type === 'localImage') {
    kind = 'Image'
    if (!String(value.alt || '').trim()) warning = 'Needs alt text'
    preview = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={String(value.src || '')} alt="" />
        <div className="st-blockobj-body">
          <div className="st-kind">{kind}</div>
          <div className="st-summary">{String(value.caption || value.alt || 'No caption')}</div>
          {warning && <div className="st-warn">{warning}</div>}
        </div>
      </>
    )
  } else if (value._type === 'youtube') {
    kind = 'YouTube video'
    const id = youtubeId(String(value.url || ''))
    preview = (
      <>
        {id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" />
        ) : null}
        <div className="st-blockobj-body">
          <div className="st-kind">{kind}</div>
          <div className="st-summary">{String(value.url || '')}</div>
          {!id && <div className="st-warn">Not a YouTube link</div>}
        </div>
      </>
    )
  } else {
    kind = 'Code'
    preview = (
      <div className="st-blockobj-body">
        <div className="st-kind">
          {kind}
          {value.language ? ` · ${String(value.language)}` : ''}
        </div>
        <pre>{String(value.code || '')}</pre>
      </div>
    )
  }

  const send = (event: Parameters<typeof editor.send>[0]) => {
    editor.send(event)
    editor.send({ type: 'focus' })
  }

  return (
    <div {...attributes} className="st-blockobj" data-selected={selected}>
      {children}
      {preview}
      <div className="st-blockobj-actions" contentEditable={false}>
        <button type="button" className="st-btn small" onClick={() => openEdit({ path, node: value })}>
          Edit
        </button>
        <button type="button" className="st-icon-btn" aria-label={`Move ${kind} up`} onClick={() => send({ type: 'move.block up', at: path })}>
          ↑
        </button>
        <button type="button" className="st-icon-btn" aria-label={`Move ${kind} down`} onClick={() => send({ type: 'move.block down', at: path })}>
          ↓
        </button>
        <button type="button" className="st-icon-btn" aria-label={`Remove ${kind}`} onClick={() => send({ type: 'delete.block', at: path })}>
          ✕
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- toolbar

/** Stops toolbar buttons taking focus (and the text selection) away from the editor. */
const keepFocus = (event: React.MouseEvent) => event.preventDefault()

type Insert = 'image' | 'youtube' | 'code' | 'link' | null

function Toolbar({ onInsert }: { onInsert: (kind: Exclude<Insert, null>) => void }) {
  const editor = useEditor()
  const activeStyle = useEditorSelector(editor, selectors.getActiveStyle)
  const activeList = useEditorSelector(editor, selectors.getActiveListItem)
  const bold = useEditorSelector(editor, selectors.isActiveDecorator('strong'))
  const italic = useEditorSelector(editor, selectors.isActiveDecorator('em'))
  const code = useEditorSelector(editor, selectors.isActiveDecorator('code'))
  const link = useEditorSelector(editor, selectors.isActiveAnnotation('link'))

  const run = (event: Parameters<typeof editor.send>[0]) => {
    editor.send(event)
    editor.send({ type: 'focus' })
  }

  return (
    <div className="st-toolbar" role="toolbar" aria-label="Formatting">
      <select
        className="st-select"
        aria-label="Text style"
        value={activeStyle || 'normal'}
        onChange={(event) => run({ type: 'style.toggle', style: event.target.value })}
      >
        {schemaDefinition.styles.map((style) => (
          <option key={style.name} value={style.name}>
            {style.title}
          </option>
        ))}
      </select>
      <span className="st-tool-sep" />
      <button type="button" className="st-tool" onMouseDown={keepFocus} aria-pressed={bold} title="Bold (Ctrl/⌘ B)" onClick={() => run({ type: 'decorator.toggle', decorator: 'strong' })}>
        B
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} aria-pressed={italic} title="Italic (Ctrl/⌘ I)" onClick={() => run({ type: 'decorator.toggle', decorator: 'em' })}>
        <em>I</em>
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} aria-pressed={code} title="Inline code" onClick={() => run({ type: 'decorator.toggle', decorator: 'code' })}>
        {'</>'}
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} aria-pressed={link} title="Link" onClick={() => onInsert('link')}>
        Link
      </button>
      <span className="st-tool-sep" />
      <button type="button" className="st-tool" onMouseDown={keepFocus} aria-pressed={activeList === 'bullet'} title="Bulleted list" onClick={() => run({ type: 'list item.toggle', listItem: 'bullet' })}>
        • List
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} aria-pressed={activeList === 'number'} title="Numbered list" onClick={() => run({ type: 'list item.toggle', listItem: 'number' })}>
        1. List
      </button>
      <span className="st-tool-sep" />
      <button type="button" className="st-tool" onMouseDown={keepFocus} onClick={() => onInsert('image')}>
        + Image
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} onClick={() => onInsert('youtube')}>
        + YouTube
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} onClick={() => onInsert('code')}>
        + Code
      </button>
      <span className="st-tool-sep" />
      <button type="button" className="st-tool" onMouseDown={keepFocus} title="Undo (Ctrl/⌘ Z)" aria-label="Undo" onClick={() => run({ type: 'history.undo' })}>
        ↶
      </button>
      <button type="button" className="st-tool" onMouseDown={keepFocus} title="Redo" aria-label="Redo" onClick={() => run({ type: 'history.redo' })}>
        ↷
      </button>
    </div>
  )
}

// ---------------------------------------------------------------- dialogs for links and blocks

function LinkDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const editor = useEditor()
  const active = useEditorSelector(editor, selectors.getActiveAnnotations).find((mark) => mark._type === 'link') as
    | { _key: string; href?: string }
    | undefined
  const focusBlock = useEditorSelector(editor, selectors.getFocusTextBlock)
  const collapsed = useEditorSelector(editor, selectors.isSelectionCollapsed)
  const [href, setHref] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setHref(active?.href || '')
      setError('')
    }
    // Only when the dialog opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = () => {
    const url = href.trim()
    if (!/^(https?:\/\/|mailto:|\/|#)/i.test(url)) {
      setError('Links must start with https://, http://, mailto:, / or #.')
      return
    }
    if (active && focusBlock) {
      editor.send({ type: 'annotation.set', at: [...focusBlock.path, 'markDefs', { _key: active._key }], props: { href: url } })
    } else {
      editor.send({ type: 'annotation.add', annotation: { name: 'link', value: { href: url } } })
    }
    editor.send({ type: 'focus' })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={active ? 'Edit link' : 'Add link'}
      onSubmit={save}
      footer={
        <>
          {active && (
            <button
              type="button"
              className="st-btn danger"
              style={{ marginRight: 'auto' }}
              onClick={() => {
                editor.send({ type: 'annotation.remove', annotation: { name: 'link' } })
                editor.send({ type: 'focus' })
                onClose()
              }}
            >
              Remove link
            </button>
          )}
          <button type="button" className="st-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="st-btn primary" disabled={!active && collapsed}>
            Save
          </button>
        </>
      }
    >
      <div className="st-field" style={{ marginBottom: 0 }}>
        <label htmlFor="link-href">Web address</label>
        <input
          id="link-href"
          className="st-input"
          autoFocus
          placeholder="https://"
          value={href}
          onChange={(event) => {
            setHref(event.target.value)
            setError('')
          }}
        />
      </div>
      {!active && collapsed && <p className="st-hint">Select the words to link first, then press Link.</p>}
      {error && <p className="st-field-error">{error}</p>}
    </Dialog>
  )
}

function ObjectDialog({
  edit,
  creating,
  onClose,
}: {
  edit: { type: 'youtube' | 'code' | 'localImage'; path?: BlockObjectRenderProps['path']; node: Record<string, unknown> } | null
  creating: boolean
  onClose: () => void
}) {
  const editor = useEditor()
  const [fields, setFields] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const open = Boolean(edit)
  const type = edit?.type
  const value = (name: string) => fields[name] ?? String(edit?.node[name] ?? '')
  const set = (name: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [name]: event.target.value })
    setError('')
  }

  const close = () => {
    setFields({})
    setError('')
    onClose()
  }

  const save = () => {
    if (!edit || !type) return
    const props: Record<string, unknown> = {}
    if (type === 'youtube') {
      if (!youtubeId(value('url'))) return setError('Paste a YouTube link, like https://www.youtube.com/watch?v=…')
      props.url = value('url').trim()
    } else if (type === 'code') {
      if (!value('code').trim()) return setError('Add some code.')
      props.code = value('code')
      props.language = value('language').trim() || 'Code'
    } else {
      if (!value('alt').trim()) return setError('Describe the image (alt text).')
      if (value('creditUrl') && !/^https?:\/\//.test(value('creditUrl'))) return setError('Credit link must start with https://')
      props.alt = value('alt').trim()
      props.caption = value('caption').trim() || undefined
      props.credit = value('credit').trim() || undefined
      props.creditUrl = value('creditUrl').trim() || undefined
    }
    if (creating || !edit.path) {
      editor.send({ type: 'insert.block object', blockObject: { name: type, value: { ...edit.node, ...props } }, placement: 'auto' })
    } else {
      editor.send({ type: 'block.set', at: edit.path, props })
    }
    editor.send({ type: 'focus' })
    close()
  }

  const titles = { youtube: 'YouTube video', code: 'Code block', localImage: 'Image' }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={`${creating ? 'Add' : 'Edit'} ${type ? titles[type].toLowerCase() : ''}`}
      onSubmit={save}
      footer={
        <>
          <button type="button" className="st-btn" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="st-btn primary">
            {creating ? 'Insert' : 'Save'}
          </button>
        </>
      }
    >
      {type === 'youtube' && (
        <div className="st-field">
          <label htmlFor="obj-url">YouTube link</label>
          <input id="obj-url" className="st-input" autoFocus value={value('url')} onChange={set('url')} placeholder="https://www.youtube.com/watch?v=…" />
        </div>
      )}
      {type === 'code' && (
        <>
          <div className="st-field">
            <label htmlFor="obj-language">Label</label>
            <input id="obj-language" className="st-input" value={value('language')} onChange={set('language')} placeholder="e.g. Token mint addresses, bash, JSON" />
          </div>
          <div className="st-field">
            <label htmlFor="obj-code">Code</label>
            <textarea id="obj-code" className="st-textarea mono" rows={10} autoFocus value={value('code')} onChange={set('code')} />
          </div>
        </>
      )}
      {type === 'localImage' && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={String(edit?.node.src || '')} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', background: 'var(--st-sunken)', borderRadius: 6, marginBottom: 14 }} />
          <div className="st-field">
            <label htmlFor="obj-alt">Alt text</label>
            <input id="obj-alt" className="st-input" autoFocus value={value('alt')} onChange={set('alt')} />
            <p className="st-hint">What the image shows, for screen readers and search engines.</p>
          </div>
          <div className="st-field">
            <label htmlFor="obj-caption">Caption</label>
            <textarea id="obj-caption" className="st-textarea" rows={2} value={value('caption')} onChange={set('caption')} />
          </div>
          <div className="st-grid-2">
            <div className="st-field">
              <label htmlFor="obj-credit">Credit</label>
              <input id="obj-credit" className="st-input" value={value('credit')} onChange={set('credit')} placeholder="Source: …" />
            </div>
            <div className="st-field">
              <label htmlFor="obj-credit-url">Credit link</label>
              <input id="obj-credit-url" className="st-input" value={value('creditUrl')} onChange={set('creditUrl')} placeholder="https://" />
            </div>
          </div>
        </>
      )}
      {error && <p className="st-field-error">{error}</p>}
    </Dialog>
  )
}

function Inserters({ insert, setInsert, uploadMode }: { insert: Insert; setInsert: (value: Insert) => void; uploadMode: UploadMode }) {
  const editor = useEditor()
  const [objectEdit, setObjectEdit] = useState<{
    type: 'youtube' | 'code' | 'localImage'
    path?: BlockObjectRenderProps['path']
    node: Record<string, unknown>
  } | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (insert === 'youtube' || insert === 'code') {
      setInsert(null)
      setCreating(true)
      setObjectEdit({ type: insert, node: insert === 'code' ? { language: 'Code' } : {} })
    }
  }, [insert, setInsert])

  return (
    <EditObjectContext.Provider
      value={({ path, node }) => {
        setCreating(false)
        setObjectEdit({ type: node._type as 'youtube' | 'code' | 'localImage', path, node })
      }}
    >
      <LinkDialog open={insert === 'link'} onClose={() => setInsert(null)} />
      <MediaPicker
        open={insert === 'image'}
        uploadMode={uploadMode}
        onClose={() => setInsert(null)}
        onPick={(item) => {
          setInsert(null)
          const image = mediaToImage(item)
          if (image.alt) {
            editor.send({ type: 'insert.block object', blockObject: { name: 'localImage', value: image }, placement: 'auto' })
            editor.send({ type: 'focus' })
          } else {
            // Ask for alt text before inserting
            setCreating(true)
            setObjectEdit({ type: 'localImage', node: image })
          }
        }}
      />
      <ObjectDialog
        edit={objectEdit}
        creating={creating}
        onClose={() => {
          setObjectEdit(null)
          setCreating(false)
        }}
      />
      <EditableArea />
    </EditObjectContext.Provider>
  )
}

function EditableArea() {
  return (
    <PortableTextEditable
      className="st-editable"
      hotkeys={HOTKEYS}
      aria-label="Article body"
      renderPlaceholder={() => <span className="st-placeholder">Start writing. Use Heading 2 for sections; end with a “Sources” heading.</span>}
    />
  )
}

function WordCount() {
  const editor = useEditor()
  const value = useEditorSelector(editor, selectors.getValue) as unknown as BodyBlock[]
  const words = wordCount(value || [])
  return (
    <div className="st-wordcount">
      {words.toLocaleString('en-GB')} words · about {estimatedReadTime(value || [])} min read (Sources not counted)
    </div>
  )
}

export function BodyEditor({
  initialValue,
  onChange,
  uploadMode,
}: {
  initialValue: BodyBlock[]
  onChange: (value: BodyBlock[]) => void
  uploadMode: UploadMode
}) {
  const [insert, setInsert] = useState<Insert>(null)
  return (
    <div className="st-pte">
      <EditorProvider initialConfig={{ schemaDefinition, initialValue: initialValue as PortableTextBlock[] }}>
        <EventListenerPlugin
          on={(event) => {
            if (event.type === 'mutation') onChange((event.value || []) as unknown as BodyBlock[])
          }}
        />
        <NodePlugin nodes={nodes} />
        <Toolbar onInsert={setInsert} />
        <Inserters insert={insert} setInsert={setInsert} uploadMode={uploadMode} />
        <WordCount />
      </EditorProvider>
    </div>
  )
}
