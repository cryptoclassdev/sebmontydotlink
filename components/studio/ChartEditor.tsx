'use client'

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { MetricGridFigure, type MetricGridFigureProps } from '@/components/blog/MetricGridFigure'
import { PremiumChartFigure, type PremiumChartFigureProps } from '@/components/blog/PremiumChartFigure'
import { PriceTimelineFigure, type PriceTimelineFigureProps } from '@/components/blog/PriceTimelineFigure'
import { SourceQuote } from '@/components/blog/SourceQuote'
import { StackedBarFigure, type StackedBarFigureProps } from '@/components/blog/StackedBarFigure'
import { StatStripFigure, type StatStripFigureProps } from '@/components/blog/StatStripFigure'
import { TokenComparisonFigure, type TokenComparisonFigureProps } from '@/components/blog/TokenComparisonFigure'
import { ValuationGrowthFigure, type ValuationGrowthFigureProps } from '@/components/blog/ValuationGrowthFigure'
import { CHART_SPECS, CHART_TYPES, chartProblems, cleanChartValues, withPreviewDefaults, type ChartType, type FieldSpec } from '@/lib/studio/charts'

import { Dialog } from './Dialog'

type Values = Record<string, unknown>

// ---------------------------------------------------------------- preview (the site's own components)

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ChartFigure({ type, values }: { type: ChartType; values: Values }) {
  const props = values as any
  switch (type) {
    case 'metricGrid':
      return <MetricGridFigure {...(props as MetricGridFigureProps)} />
    case 'statStrip':
      return <StatStripFigure {...(props as StatStripFigureProps)} />
    case 'stackedBar':
      return <StackedBarFigure {...(props as StackedBarFigureProps)} />
    case 'valuationGrowth':
      return <ValuationGrowthFigure {...(props as ValuationGrowthFigureProps)} />
    case 'priceTimeline':
      return <PriceTimelineFigure {...(props as PriceTimelineFigureProps)} />
    case 'premiumChart':
      return <PremiumChartFigure {...(props as PremiumChartFigureProps)} />
    case 'tokenComparison':
      return <TokenComparisonFigure {...(props as TokenComparisonFigureProps)} />
    case 'sourceQuote':
      return <SourceQuote _key="preview" {...props} />
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Keeps a half-filled chart from breaking the dialog: shows a note until the data can be drawn. */
class PreviewBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean; key: string }> {
  state = { failed: false, key: this.props.resetKey }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  static getDerivedStateFromProps(props: { resetKey: string }, state: { failed: boolean; key: string }) {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null
  }
  render() {
    return this.state.failed ? <p className="st-hint">Fill in the required fields to see the preview.</p> : this.props.children
  }
}

/** Width charts get in a desktop article; the preview lays them out at this width, then scales to fit. */
const SITE_WIDTH = 900

export function ChartPreview({ type, values }: { type: ChartType; values: Values }) {
  const cleaned = useMemo(() => withPreviewDefaults(CHART_SPECS[type].fields, cleanChartValues(CHART_SPECS[type].fields, values)), [type, values])
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.7)
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / SITE_WIDTH)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={frame} className="st-chart-preview-frame">
      <div className="st-chart-preview article-prose" style={{ width: SITE_WIDTH, zoom: scale }}>
        <PreviewBoundary resetKey={JSON.stringify(cleaned)}>
          <ChartFigure type={type} values={cleaned} />
        </PreviewBoundary>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- form built from the chart's field specs

/** Numbers stay as typed text until they parse, so "1." can become "1.5". */
function parseNumber(text: string): number | string | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  return /^-?(\d+\.?\d*|\.\d+)$/.test(trimmed) && !trimmed.endsWith('.') ? Number(trimmed) : text
}

function parseNumbers(text: string): number[] | string | undefined {
  if (!text.trim()) return undefined
  const parts = text.split(',').map((part) => part.trim())
  return parts.every((part) => /^-?(\d+\.?\d*|\.\d+)$/.test(part) && !part.endsWith('.')) ? parts.map(Number) : text
}

const isWide = (field: FieldSpec) => field.kind === 'textarea' || field.kind === 'group' || field.kind === 'list'

function FieldsEditor({ fields, values, onChange, idPrefix }: { fields: FieldSpec[]; values: Values; onChange: (values: Values) => void; idPrefix: string }) {
  return (
    <div className="st-chart-fields">
      {fields.map((field) => (
        <div key={field.key} className={isWide(field) ? 'st-field st-chart-field wide' : 'st-field st-chart-field'}>
          <FieldEditor field={field} value={values[field.key]} onChange={(value) => onChange({ ...values, [field.key]: value })} id={`${idPrefix}-${field.key}`} />
        </div>
      ))}
    </div>
  )
}

function Label({ field, id }: { field: FieldSpec; id: string }) {
  return (
    <label htmlFor={id}>
      {field.label}
      {field.required ? '' : <span className="st-optional"> (optional)</span>}
    </label>
  )
}

function FieldEditor({ field, value, onChange, id }: { field: FieldSpec; value: unknown; onChange: (value: unknown) => void; id: string }) {
  const text = value === undefined || value === null ? '' : Array.isArray(value) ? value.join(', ') : String(value)
  const hint = field.hint ? <p className="st-hint">{field.hint}</p> : null

  switch (field.kind) {
    case 'text':
    case 'url':
      return (
        <>
          <Label field={field} id={id} />
          <input id={id} className="st-input" value={text} placeholder={field.placeholder ?? (field.kind === 'url' ? 'https://' : undefined)} onChange={(event) => onChange(event.target.value)} />
          {hint}
        </>
      )
    case 'textarea':
      return (
        <>
          <Label field={field} id={id} />
          <textarea id={id} className="st-textarea" rows={2} value={text} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
          {hint}
        </>
      )
    case 'number':
      return (
        <>
          <Label field={field} id={id} />
          <input id={id} className="st-input" inputMode="decimal" value={text} onChange={(event) => onChange(parseNumber(event.target.value))} />
          {hint}
        </>
      )
    case 'numbers':
      return (
        <>
          <Label field={field} id={id} />
          <input id={id} className="st-input" inputMode="decimal" value={text} onChange={(event) => onChange(parseNumbers(event.target.value))} />
          {hint}
        </>
      )
    case 'select':
      return (
        <>
          <Label field={field} id={id} />
          <select id={id} className="st-select" value={text} onChange={(event) => onChange(event.target.value || undefined)}>
            {!field.required && <option value="">Default</option>}
            {field.required && !text && <option value="">Choose…</option>}
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hint}
        </>
      )
    case 'group':
      return (
        <fieldset className="st-chart-group">
          <legend>
            {field.label}
            {field.required ? '' : <span className="st-optional"> (optional)</span>}
          </legend>
          {hint}
          <FieldsEditor fields={field.fields} values={(value as Values) || {}} onChange={onChange} idPrefix={id} />
        </fieldset>
      )
    case 'list': {
      const items = Array.isArray(value) ? (value as Values[]) : []
      const update = (next: Values[]) => onChange(next)
      const move = (from: number, to: number) => {
        const next = [...items]
        const [item] = next.splice(from, 1)
        next.splice(to, 0, item)
        update(next)
      }
      return (
        <fieldset className="st-chart-group">
          <legend>
            {field.label}
            {field.required ? '' : <span className="st-optional"> (optional)</span>}
          </legend>
          {hint}
          {items.map((item, index) => (
            <div key={index} className="st-chart-item">
              <div className="st-chart-item-head">
                <strong>
                  {field.itemLabel} {index + 1}
                </strong>
                <span>
                  <button type="button" className="st-icon-btn" aria-label={`Move ${field.itemLabel} ${index + 1} up`} disabled={index === 0} onClick={() => move(index, index - 1)}>
                    ↑
                  </button>
                  <button type="button" className="st-icon-btn" aria-label={`Move ${field.itemLabel} ${index + 1} down`} disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
                    ↓
                  </button>
                  <button type="button" className="st-icon-btn" aria-label={`Remove ${field.itemLabel} ${index + 1}`} onClick={() => update(items.filter((_, i) => i !== index))}>
                    ✕
                  </button>
                </span>
              </div>
              <FieldsEditor fields={field.fields} values={item || {}} onChange={(next) => update(items.map((old, i) => (i === index ? next : old)))} idPrefix={`${id}-${index}`} />
            </div>
          ))}
          <button
            type="button"
            className="st-btn small"
            disabled={field.max !== undefined && items.length >= field.max}
            onClick={() => update([...items, items.length ? structuredClone(blankLike(items[items.length - 1])) : {}])}
          >
            + Add {field.itemLabel.toLowerCase()}
          </button>
        </fieldset>
      )
    }
  }
}

/** A new list item keeps the previous item's colour choices but no text or numbers. */
function blankLike(item: Values): Values {
  const out: Values = {}
  for (const [key, value] of Object.entries(item || {})) if (key === 'tone' || key === 'accent') out[key] = value
  return out
}

// ---------------------------------------------------------------- the dialogs

export function ChartPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (type: ChartType) => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Add a chart" wide>
      <p className="st-hint" style={{ marginTop: 0 }}>
        Each chart starts with example data that you replace with your own.
      </p>
      <div className="st-chart-picker">
        {CHART_TYPES.map((type) => (
          <button key={type} type="button" className="st-chart-choice" onClick={() => onPick(type)}>
            <strong>{CHART_SPECS[type].name}</strong>
            <span>{CHART_SPECS[type].description}</span>
          </button>
        ))}
      </div>
    </Dialog>
  )
}

export function ChartDialog({
  edit,
  creating,
  onSave,
  onClose,
}: {
  edit: { type: ChartType; values: Values } | null
  creating: boolean
  onSave: (values: Values) => void
  onClose: () => void
}) {
  const [values, setValues] = useState<Values>(() => (edit ? structuredClone(edit.values) : {}))
  const [tab, setTab] = useState<'form' | 'json'>('form')
  const [json, setJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [showProblems, setShowProblems] = useState(false)
  const [current, setCurrent] = useState(edit)
  const type = edit?.type

  // A new chart to edit: reset during render, so the preview never draws the previous chart's data.
  if (edit !== current) {
    setCurrent(edit)
    setValues(edit ? structuredClone(edit.values) : {})
    setTab('form')
    setJsonError('')
    setShowProblems(false)
  }

  if (!edit || !type) return null

  const spec = CHART_SPECS[type]
  const cleaned = cleanChartValues(spec.fields, values)
  const problems = chartProblems(type, values)

  const openJson = () => {
    setJson(JSON.stringify(cleaned, null, 2))
    setJsonError('')
    setTab('json')
  }

  const save = () => {
    // Drafts may hold an unfinished chart; the publish checks list what is still missing.
    onSave(cleaned)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={`${creating ? 'Add' : 'Edit'} chart: ${spec.name}`}
      wide
      extraClass="st-chart-dialog"
      onSubmit={save}
      footer={
        <>
          <span className={problems.length ? 'st-chart-status warn' : 'st-chart-status ok'} style={{ marginRight: 'auto' }}>
            {problems.length ? (
              <button type="button" className="link" onClick={() => setShowProblems(!showProblems)}>
                {problems.length === 1 ? '1 thing to fix before publishing' : `${problems.length} things to fix before publishing`}
              </button>
            ) : (
              'Ready to publish'
            )}
          </span>
          <button type="button" className="st-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="st-btn primary">
            {creating ? 'Insert chart' : 'Save chart'}
          </button>
        </>
      }
    >
      {showProblems && problems.length > 0 && (
        <ul className="st-chart-problems">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      <div className="st-chart-layout">
        <div className="st-chart-form">
          <div className="st-tabs st-chart-tabs" role="tablist">
            <button type="button" role="tab" className="st-tab" aria-selected={tab === 'form'} onClick={() => setTab('form')}>
              Fields
            </button>
            <button type="button" role="tab" className="st-tab" aria-selected={tab === 'json'} onClick={openJson}>
              JSON
            </button>
          </div>
          {tab === 'form' ? (
            <FieldsEditor fields={spec.fields} values={values} onChange={setValues} idPrefix="chart" />
          ) : (
            <div className="st-field">
              <label htmlFor="chart-json">Chart data as JSON</label>
              <textarea
                id="chart-json"
                className="st-textarea mono"
                rows={22}
                spellCheck={false}
                value={json}
                onChange={(event) => {
                  setJson(event.target.value)
                  try {
                    const parsed = JSON.parse(event.target.value)
                    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
                    setValues(parsed)
                    setJsonError('')
                  } catch {
                    setJsonError('Not valid JSON yet. The preview shows the last valid version.')
                  }
                }}
              />
              <p className="st-hint">Paste chart data from a spreadsheet tool or an AI assistant. Field names are the same as in the form.</p>
              {jsonError && <p className="st-field-error">{jsonError}</p>}
            </div>
          )}
        </div>
        <div className="st-chart-side">
          <div className="st-kind">Preview</div>
          <ChartPreview type={type} values={values} />
        </div>
      </div>
    </Dialog>
  )
}
