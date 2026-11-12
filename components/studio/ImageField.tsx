'use client'

import { useState } from 'react'

import type { CoverImage } from '@/lib/studio/document'
import type { MediaItem } from '@/lib/studio/media'

import { MediaPicker } from './MediaPicker'
import type { UploadMode } from './upload'

const POSITIONS = [
  { value: '', label: 'Centre (default)' },
  { value: 'left', label: 'Keep the left side' },
  { value: 'right', label: 'Keep the right side' },
  { value: 'top', label: 'Keep the top' },
  { value: 'bottom', label: 'Keep the bottom' },
]

export function mediaToImage(item: MediaItem): CoverImage {
  return {
    mediaId: item.id,
    src: item.url,
    width: item.width || 1200,
    height: item.height || 800,
    alt: item.alt,
    ...(item.caption ? { caption: item.caption } : {}),
    ...(item.credit ? { credit: item.credit } : {}),
    ...(item.creditUrl ? { creditUrl: item.creditUrl } : {}),
  }
}

/** An image with alt text and caption, chosen from the media library. */
export function ImageField({
  id,
  value,
  onChange,
  uploadMode,
  withPosition,
  withCaption = true,
  emptyLabel = 'No image chosen',
}: {
  id: string
  value: CoverImage | null
  onChange: (value: CoverImage | null) => void
  uploadMode: UploadMode
  withPosition?: boolean
  withCaption?: boolean
  emptyLabel?: string
}) {
  const [picking, setPicking] = useState(false)
  const update = (patch: Partial<CoverImage>) => value && onChange({ ...value, ...patch })

  return (
    <>
      {value ? (
        <div className="st-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.src} alt="" style={value.position ? { objectPosition: value.position } : undefined} />
          <div>
            <div className={`st-field${value.alt.trim() ? '' : ' invalid'}`}>
              <label htmlFor={`${id}-alt`}>Alt text</label>
              <input id={`${id}-alt`} className="st-input" value={value.alt} onChange={(event) => update({ alt: event.target.value })} />
              <p className="st-hint">What the image shows, for screen readers and search engines.</p>
            </div>
            {withCaption && (
              <div className="st-field">
                <label htmlFor={`${id}-caption`}>Caption</label>
                <input
                  id={`${id}-caption`}
                  className="st-input"
                  value={value.caption || ''}
                  onChange={(event) => update({ caption: event.target.value || undefined })}
                />
              </div>
            )}
            {withPosition && (
              <div className="st-field">
                <label htmlFor={`${id}-position`}>When cards crop it</label>
                <select
                  id={`${id}-position`}
                  className="st-select"
                  value={POSITIONS.some((p) => p.value === (value.position || '')) ? value.position || '' : value.position}
                  onChange={(event) => update({ position: event.target.value || undefined })}
                >
                  {POSITIONS.map((position) => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                  {value.position && !POSITIONS.some((p) => p.value === value.position) && <option value={value.position}>{value.position}</option>}
                </select>
              </div>
            )}
            <div className="st-row">
              <button type="button" className="st-btn small" onClick={() => setPicking(true)}>
                Replace
              </button>
              <button type="button" className="st-btn small ghost" onClick={() => onChange(null)}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="st-image-empty" style={{ width: '100%', cursor: 'pointer', font: 'inherit' }} onClick={() => setPicking(true)}>
          {emptyLabel} · <strong>Choose or upload</strong>
        </button>
      )}
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        uploadMode={uploadMode}
        onPick={(item) => {
          const next = mediaToImage(item)
          // Keep text already written for this slot if the library copy has none
          onChange({
            ...next,
            alt: next.alt || value?.alt || '',
            caption: next.caption || value?.caption,
            position: value?.position,
          })
          setPicking(false)
        }}
      />
    </>
  )
}
