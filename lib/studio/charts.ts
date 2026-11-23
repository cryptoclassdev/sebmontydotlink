// Chart blocks for the article body: the data figures components/blog/ArticleBody.tsx already draws
// (components/blog/*Figure.tsx and SourceQuote.tsx). Each chart type is described once here: its
// form fields (the Studio builds its editing form from these), example data a new chart starts with,
// and the checks run before publishing. Shared by the editor (browser) and the server.

export type FieldOption = { value: string; label: string }

export type FieldSpec =
  | { key: string; label: string; kind: 'text' | 'textarea' | 'url'; required?: boolean; hint?: string; placeholder?: string }
  | { key: string; label: string; kind: 'number'; required?: boolean; hint?: string; min?: number; max?: number }
  | { key: string; label: string; kind: 'select'; options: FieldOption[]; required?: boolean; hint?: string }
  | { key: string; label: string; kind: 'numbers'; required?: boolean; hint?: string }
  | { key: string; label: string; kind: 'group'; fields: FieldSpec[]; required?: boolean; hint?: string }
  | { key: string; label: string; kind: 'list'; fields: FieldSpec[]; itemLabel: string; min?: number; max?: number; required?: boolean; hint?: string }

export type ChartSpec = {
  type: ChartType
  name: string
  description: string
  fields: FieldSpec[]
  example: Record<string, unknown>
}

export const CHART_TYPES = [
  'metricGrid',
  'statStrip',
  'stackedBar',
  'valuationGrowth',
  'priceTimeline',
  'premiumChart',
  'tokenComparison',
  'sourceQuote',
] as const
export type ChartType = (typeof CHART_TYPES)[number]

export function isChartType(type: string): type is ChartType {
  return (CHART_TYPES as readonly string[]).includes(type)
}

// Shared pieces --------------------------------------------------------------------------

const eyebrow: FieldSpec = { key: 'eyebrow', label: 'Eyebrow', kind: 'text', required: true, hint: 'Small label above the title.' }
const title: FieldSpec = { key: 'title', label: 'Title', kind: 'text', required: true }
const caption: FieldSpec = { key: 'caption', label: 'Caption', kind: 'textarea', required: true, hint: 'Shown under the chart. Say what it shows and where the numbers come from.' }
const dateLabel = (required: boolean): FieldSpec => ({ key: 'dateLabel', label: 'Date label', kind: 'text', required, placeholder: 'As of 1 Nov 2026' })
const dateTime: FieldSpec = { key: 'dateTime', label: 'Machine-readable date', kind: 'text', hint: 'Optional, like 2026-11-01.' }
const source: FieldSpec = { key: 'source', label: 'Source', kind: 'text', hint: 'Optional source name shown in the corner.' }
const sourceUrl: FieldSpec = { key: 'sourceUrl', label: 'Source link', kind: 'url', hint: 'Optional. Turns the source name into a link.' }
const ariaLabel: FieldSpec = {
  key: 'ariaLabel',
  label: 'Screen-reader description',
  kind: 'textarea',
  hint: 'Optional. Leave empty and one is written from the title and numbers.',
}

const tones = (...pairs: Array<[string, string]>): FieldOption[] => pairs.map(([value, label]) => ({ value, label }))

const valueGroup = (key: string, label: string, hint?: string): FieldSpec => ({
  key,
  label,
  kind: 'group',
  required: true,
  hint,
  fields: [
    { key: 'label', label: 'Label', kind: 'text', required: true },
    { key: 'value', label: 'Value (number)', kind: 'number', required: true, hint: 'Used to size the bar.' },
    { key: 'displayValue', label: 'Shown as', kind: 'text', required: true, placeholder: '$32.00' },
  ],
})

const tokenGroup = (key: string, label: string): FieldSpec => ({
  key,
  label,
  kind: 'group',
  required: true,
  fields: [
    { key: 'name', label: 'Name', kind: 'text', required: true },
    { key: 'issuer', label: 'Issuer', kind: 'text', required: true },
    { key: 'status', label: 'Status', kind: 'text', required: true, placeholder: 'Verified' },
    {
      key: 'metrics',
      label: 'Metrics',
      kind: 'list',
      itemLabel: 'Metric',
      min: 1,
      max: 4,
      required: true,
      fields: [
        { key: 'label', label: 'Label', kind: 'text', required: true },
        { key: 'value', label: 'Value', kind: 'text', required: true },
        { key: 'tone', label: 'Colour', kind: 'select', options: tones(['default', 'Default'], ['gauge', 'Teal'], ['marigold', 'Orange'], ['redline', 'Red']) },
      ],
    },
  ],
})

// The chart types ------------------------------------------------------------------------

export const CHART_SPECS: Record<ChartType, ChartSpec> = {
  metricGrid: {
    type: 'metricGrid',
    name: 'Metric grid',
    description: 'Four headline numbers in a row, each with a label and a note.',
    fields: [
      eyebrow,
      title,
      dateLabel(true),
      dateTime,
      {
        key: 'metrics',
        label: 'Metrics',
        kind: 'list',
        itemLabel: 'Metric',
        min: 4,
        max: 4,
        required: true,
        hint: 'Exactly four.',
        fields: [
          { key: 'label', label: 'Label', kind: 'text', required: true },
          { key: 'value', label: 'Value', kind: 'text', required: true, placeholder: '7.4%' },
          { key: 'detail', label: 'Note', kind: 'text', required: true },
          { key: 'tone', label: 'Colour', kind: 'select', options: tones(['neutral', 'Neutral'], ['gauge', 'Teal'], ['sebring', 'Blue']) },
        ],
      },
      caption,
      ariaLabel,
    ],
    example: {
      eyebrow: 'Example data',
      title: 'Validator snapshot',
      dateLabel: 'As of 1 Nov 2026',
      dateTime: '2026-11-01',
      metrics: [
        { label: 'APY', value: '7.4%', detail: 'Before fees', tone: 'gauge' },
        { label: 'Commission', value: '0%', detail: 'Since launch', tone: 'sebring' },
        { label: 'Active stake', value: '1.2M', detail: 'SOL, up 8% this month', tone: 'neutral' },
        { label: 'Uptime', value: '99.98%', detail: 'Last 90 days', tone: 'neutral' },
      ],
      caption: 'Example numbers. Replace them with your own and name the source.',
    },
  },

  statStrip: {
    type: 'statStrip',
    name: 'Stat strip',
    description: 'Three numbers side by side, each with a label and a note.',
    fields: [
      eyebrow,
      title,
      dateLabel(false),
      {
        key: 'metrics',
        label: 'Numbers',
        kind: 'list',
        itemLabel: 'Number',
        min: 3,
        max: 3,
        required: true,
        hint: 'Exactly three.',
        fields: [
          { key: 'label', label: 'Label', kind: 'text', required: true },
          { key: 'value', label: 'Value', kind: 'text', required: true },
          { key: 'detail', label: 'Note', kind: 'text', required: true },
          { key: 'tone', label: 'Colour', kind: 'select', options: tones(['ink', 'Ink'], ['gauge', 'Teal'], ['marigold', 'Orange'], ['redline', 'Red']) },
        ],
      },
      caption,
      ariaLabel,
    ],
    example: {
      eyebrow: 'Example data',
      title: 'Three numbers that matter',
      dateLabel: 'November 2026',
      metrics: [
        { label: 'Total value locked', value: '$48M', detail: 'Down from $210M at launch', tone: 'ink' },
        { label: 'Paid to stakers', value: '$3.1M', detail: 'Since launch', tone: 'marigold' },
        { label: 'Days to break even', value: '412', detail: 'At current rates', tone: 'redline' },
      ],
      caption: 'Example numbers. Replace them with your own and name the source.',
    },
  },

  stackedBar: {
    type: 'stackedBar',
    name: 'Stacked bar',
    description: 'One bar split into shares of a whole, like a token supply split.',
    fields: [
      eyebrow,
      title,
      dateLabel(true),
      dateTime,
      {
        key: 'segments',
        label: 'Segments',
        kind: 'list',
        itemLabel: 'Segment',
        min: 2,
        max: 6,
        required: true,
        hint: 'Values are percentages and should add up to 100.',
        fields: [
          { key: 'name', label: 'Name', kind: 'text', required: true },
          { key: 'value', label: 'Share (%)', kind: 'number', required: true, min: 0, max: 100 },
          { key: 'displayValue', label: 'Shown as', kind: 'text', hint: 'Optional. Defaults to the share with a % sign.' },
          {
            key: 'tone',
            label: 'Colour',
            kind: 'select',
            required: true,
            options: tones(['gauge', 'Teal'], ['sebring', 'Blue'], ['marigold', 'Orange'], ['redline', 'Red'], ['infield', 'Green'], ['pitlane', 'Slate']),
          },
        ],
      },
      {
        key: 'highlight',
        label: 'Highlight',
        kind: 'group',
        hint: 'Optional big number next to the bar.',
        fields: [
          { key: 'value', label: 'Value', kind: 'text', placeholder: '45%' },
          { key: 'label', label: 'Label', kind: 'text', placeholder: 'to stakers' },
        ],
      },
      caption,
      ariaLabel,
    ],
    example: {
      eyebrow: 'Example data',
      title: 'Where the supply goes',
      dateLabel: 'At launch',
      segments: [
        { name: 'Community', value: 45, tone: 'gauge' },
        { name: 'Team', value: 20, tone: 'sebring' },
        { name: 'Investors', value: 20, tone: 'pitlane' },
        { name: 'Treasury', value: 15, tone: 'marigold' },
      ],
      highlight: { value: '45%', label: 'to the community' },
      caption: 'Example split. Replace it with your own and name the source.',
    },
  },

  valuationGrowth: {
    type: 'valuationGrowth',
    name: 'Valuation bars',
    description: 'Horizontal bars comparing values, each with an optional earlier value behind it.',
    fields: [
      eyebrow,
      title,
      source,
      sourceUrl,
      {
        key: 'rows',
        label: 'Rows',
        kind: 'list',
        itemLabel: 'Row',
        min: 1,
        max: 8,
        required: true,
        fields: [
          { key: 'name', label: 'Name', kind: 'text', required: true },
          { key: 'latestValue', label: 'Latest value (number)', kind: 'number', required: true },
          { key: 'latestLabel', label: 'Latest value shown as', kind: 'text', required: true, placeholder: '$3.5B' },
          { key: 'earlierValue', label: 'Earlier value (number)', kind: 'number', hint: 'Optional.' },
          { key: 'earlierLabel', label: 'Earlier value shown as', kind: 'text', hint: 'Optional.' },
          { key: 'note', label: 'Note', kind: 'text', required: true },
        ],
      },
      { key: 'maxValue', label: 'Scale maximum', kind: 'number', required: true, hint: 'The value of a full-width bar. At least the largest value.' },
      caption,
      ariaLabel,
    ],
    example: {
      eyebrow: 'Example data',
      title: 'Valuations, earlier round vs latest',
      source: 'Example source',
      rows: [
        { name: 'Project A', earlierValue: 1.2, earlierLabel: '$1.2B', latestValue: 3.5, latestLabel: '$3.5B', note: 'Series B to Series C' },
        { name: 'Project B', earlierValue: 0.4, earlierLabel: '$400M', latestValue: 1.1, latestLabel: '$1.1B', note: 'Seed to Series A' },
        { name: 'Project C', latestValue: 0.3, latestLabel: '$300M', note: 'First priced round' },
      ],
      maxValue: 4,
      caption: 'Example values in billions of dollars. Replace them with your own and name the source.',
    },
  },

  priceTimeline: {
    type: 'priceTimeline',
    name: 'Price timeline',
    description: 'Two lines over time, like a price against its net asset value.',
    fields: [
      eyebrow,
      title,
      source,
      sourceUrl,
      { key: 'priceLabel', label: 'First line name', kind: 'text', required: true, placeholder: 'Share price' },
      { key: 'navLabel', label: 'Second line name', kind: 'text', required: true, placeholder: 'Net asset value' },
      { key: 'maxValue', label: 'Top of the scale', kind: 'number', required: true, hint: 'At least the highest point.' },
      {
        key: 'price',
        label: 'First line points',
        kind: 'list',
        itemLabel: 'Point',
        min: 2,
        max: 24,
        required: true,
        hint: 'Position runs from 0 (left edge) to 1 (right edge).',
        fields: [
          { key: 'position', label: 'Position (0 to 1)', kind: 'number', required: true, min: 0, max: 1 },
          { key: 'value', label: 'Value', kind: 'number', required: true },
          { key: 'date', label: 'Date label', kind: 'text', required: true },
          { key: 'label', label: 'Annotation', kind: 'text', hint: 'Optional text shown at the point.' },
          { key: 'accent', label: 'Style', kind: 'select', options: tones(['default', 'Normal'], ['low', 'Highlight (low point)']) },
        ],
      },
      {
        key: 'nav',
        label: 'Second line points',
        kind: 'list',
        itemLabel: 'Point',
        min: 2,
        max: 24,
        required: true,
        fields: [
          { key: 'position', label: 'Position (0 to 1)', kind: 'number', required: true, min: 0, max: 1 },
          { key: 'value', label: 'Value', kind: 'number', required: true },
          { key: 'date', label: 'Date label', kind: 'text', required: true },
          { key: 'label', label: 'Annotation', kind: 'text', hint: 'Optional.' },
        ],
      },
      caption,
      ariaLabel,
    ],
    example: {
      eyebrow: 'Example data',
      title: 'Price against net asset value',
      source: 'Example source',
      priceLabel: 'Share price',
      navLabel: 'Net asset value',
      maxValue: 40,
      price: [
        { position: 0, value: 34, date: 'Jun', label: '$34 first day' },
        { position: 0.25, value: 26, date: 'Jul' },
        { position: 0.5, value: 18, date: 'Aug', label: '$18 low', accent: 'low' },
        { position: 0.75, value: 22, date: 'Sep' },
        { position: 1, value: 24, date: 'Oct' },
      ],
      nav: [
        { position: 0, value: 20, date: 'Jun' },
        { position: 0.5, value: 19, date: 'Aug' },
        { position: 1, value: 21, date: 'Oct', label: '$21 NAV' },
      ],
      caption: 'Example prices. Replace them with your own and name the source.',
    },
  },

  premiumChart: {
    type: 'premiumChart',
    name: 'Premium to NAV',
    description: 'A price split into net asset value and the premium on top, with a NAV history.',
    fields: [
      eyebrow,
      { key: 'source', label: 'Source', kind: 'text', required: true },
      title,
      valueGroup('sharePrice', 'Share price', 'The full bar.'),
      valueGroup('bookValue', 'Net asset value', 'The lower part of the bar.'),
      valueGroup('premium', 'Premium', 'The upper part of the bar (share price minus net asset value).'),
      { key: 'multipleLabel', label: 'Multiple', kind: 'text', required: true, placeholder: '1.6x NAV' },
      {
        key: 'navHistory',
        label: 'NAV history',
        kind: 'list',
        itemLabel: 'Point',
        min: 1,
        max: 6,
        required: true,
        fields: [
          { key: 'dateLabel', label: 'Date', kind: 'text', required: true },
          { key: 'label', label: 'Label', kind: 'text', required: true },
          { key: 'value', label: 'Value (number)', kind: 'number', required: true },
          { key: 'displayValue', label: 'Shown as', kind: 'text', required: true },
          { key: 'tone', label: 'Colour', kind: 'select', options: tones(['pitlane', 'Slate'], ['sebring', 'Blue']) },
        ],
      },
      { key: 'axisTicks', label: 'Scale marks', kind: 'numbers', hint: 'Optional, comma-separated, like 0, 10, 20, 30, 40.' },
      caption,
      ariaLabel,
    ],
    example: {
      eyebrow: 'Example data',
      source: 'Example source',
      title: 'What the share price pays for',
      sharePrice: { label: 'Share price', value: 32, displayValue: '$32.00' },
      bookValue: { label: 'Net asset value', value: 20, displayValue: '$20.00' },
      premium: { label: 'Premium', value: 12, displayValue: '+$12.00' },
      multipleLabel: '1.6x NAV',
      navHistory: [
        { dateLabel: 'Aug', label: 'NAV per share', value: 18, displayValue: '$18.00', tone: 'pitlane' },
        { dateLabel: 'Sep', label: 'NAV per share', value: 19, displayValue: '$19.00', tone: 'pitlane' },
        { dateLabel: 'Oct', label: 'NAV per share', value: 20, displayValue: '$20.00', tone: 'sebring' },
      ],
      axisTicks: [0, 10, 20, 30, 40],
      caption: 'Example values. Replace them with your own and name the source.',
    },
  },

  tokenComparison: {
    type: 'tokenComparison',
    name: 'Token comparison',
    description: 'Two tokens side by side, such as the real one and a copycat.',
    fields: [eyebrow, title, dateLabel(true), tokenGroup('primary', 'First token (marked verified)'), tokenGroup('comparison', 'Second token'), caption, ariaLabel],
    example: {
      eyebrow: 'Example data',
      title: 'Same name, different token',
      dateLabel: '1 Nov 2026',
      primary: {
        name: 'Token A',
        issuer: 'Issued by Example Labs',
        status: 'Verified',
        metrics: [
          { label: 'Liquidity', value: '$12M', tone: 'gauge' },
          { label: 'Holders', value: '48,000' },
          { label: 'Price impact ($10k)', value: '0.1%' },
          { label: 'Age', value: '2 years' },
        ],
      },
      comparison: {
        name: 'Token A',
        issuer: 'Unknown issuer',
        status: 'Unverified',
        metrics: [
          { label: 'Liquidity', value: '$40k', tone: 'redline' },
          { label: 'Holders', value: '310', tone: 'marigold' },
          { label: 'Price impact ($10k)', value: '24%', tone: 'redline' },
          { label: 'Age', value: '3 days', tone: 'marigold' },
        ],
      },
      caption: 'Example tokens. Replace them with your own and name the source.',
    },
  },

  sourceQuote: {
    type: 'sourceQuote',
    name: 'Source quote',
    description: 'A large quote with a link to where it was said.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text', hint: 'Optional. Defaults to "Quoted source".' },
      { key: 'quote', label: 'Quote', kind: 'textarea', required: true, hint: 'The exact words, without quotation marks.' },
      { key: 'sourceTitle', label: 'Source name', kind: 'text', required: true },
      { key: 'sourceDetail', label: 'Source detail', kind: 'text', hint: 'Optional, like the date or the document.' },
      { key: 'sourceUrl', label: 'Source link', kind: 'url', required: true },
    ],
    example: {
      eyebrow: 'Quoted source',
      quote: 'Replace this with the exact words you are quoting.',
      sourceTitle: 'Name of the source',
      sourceDetail: 'Where and when it was said',
      sourceUrl: 'https://example.com',
    },
  },
}

// Values ---------------------------------------------------------------------------------

type Values = Record<string, unknown>

/** A fresh copy of a chart type's example data. */
export function chartExample(type: ChartType): Values {
  return structuredClone(CHART_SPECS[type].example)
}

const isBlank = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)

/** Removes empty optional fields so the site's defaults apply (and saved data stays tidy). */
export function cleanChartValues(fields: FieldSpec[], values: Values): Values {
  const out: Values = {}
  for (const field of fields) {
    const value = values[field.key]
    if (field.kind === 'group') {
      const inner = cleanChartValues(field.fields, (value as Values) || {})
      if (Object.keys(inner).length) out[field.key] = inner
    } else if (field.kind === 'list') {
      const items = Array.isArray(value) ? value.map((item) => cleanChartValues(field.fields, (item as Values) || {})) : []
      if (items.length) out[field.key] = items
    } else if (field.kind === 'text' || field.kind === 'textarea' || field.kind === 'url') {
      if (typeof value === 'string' && value.trim()) out[field.key] = field.kind === 'textarea' ? value.trim() : value.trim()
    } else if (field.kind === 'number') {
      if (typeof value === 'number' && Number.isFinite(value)) out[field.key] = value
    } else if (field.kind === 'numbers') {
      if (Array.isArray(value) && value.length && value.every((item) => typeof item === 'number' && Number.isFinite(item))) out[field.key] = value
    } else if (field.kind === 'select') {
      if (typeof value === 'string' && value) out[field.key] = value
    }
  }
  return out
}

function checkFields(fields: FieldSpec[], values: Values, path: string, problems: string[]) {
  for (const field of fields) {
    const value = values[field.key]
    const where = path ? `${path}, ${field.label}` : field.label
    if (isBlank(value)) {
      if (field.required) problems.push(`${where} is empty.`)
      continue
    }
    switch (field.kind) {
      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value)) problems.push(`${where} must be a number.`)
        else if ((field.min !== undefined && value < field.min) || (field.max !== undefined && value > field.max))
          problems.push(`${where} must be between ${field.min ?? '…'} and ${field.max ?? '…'}.`)
        break
      case 'numbers':
        if (!Array.isArray(value) || !value.every((item) => typeof item === 'number' && Number.isFinite(item))) problems.push(`${where} must be numbers separated by commas.`)
        break
      case 'url':
        if (typeof value !== 'string' || !/^https?:\/\//.test(value)) problems.push(`${where} must start with https://`)
        break
      case 'select':
        if (!field.options.some((option) => option.value === value)) problems.push(`${where} has an unknown choice.`)
        break
      case 'group': {
        const inner = (value || {}) as Values
        if (!field.required && field.fields.every((sub) => isBlank(inner[sub.key]))) break
        checkFields(field.fields, inner, where, problems)
        break
      }
      case 'list': {
        const items = Array.isArray(value) ? value : []
        if (field.min !== undefined && items.length < field.min) problems.push(`${where}: add at least ${field.min} (${items.length} now).`)
        if (field.max !== undefined && items.length > field.max) problems.push(`${where}: at most ${field.max} (${items.length} now).`)
        items.forEach((item, index) => checkFields(field.fields, (item || {}) as Values, `${field.itemLabel} ${index + 1}`, problems))
        break
      }
      default:
        if (typeof value !== 'string') problems.push(`${where} must be text.`)
    }
  }
}

/** Problems that would stop a chart drawing correctly. Empty when it is ready to publish. */
export function chartProblems(type: ChartType, values: Values): string[] {
  const spec = CHART_SPECS[type]
  const problems: string[] = []
  checkFields(spec.fields, values, '', problems)

  if (type === 'stackedBar' && Array.isArray(values.segments)) {
    const total = (values.segments as Values[]).reduce((sum, segment) => sum + (typeof segment.value === 'number' ? segment.value : 0), 0)
    if (Math.abs(total - 100) > 0.5) problems.push(`Segment shares add up to ${Math.round(total * 10) / 10}, not 100.`)
  }
  if (type === 'valuationGrowth' && Array.isArray(values.rows) && typeof values.maxValue === 'number') {
    const largest = Math.max(...(values.rows as Values[]).flatMap((row) => [row.latestValue, row.earlierValue]).filter((v): v is number => typeof v === 'number'))
    if (largest > values.maxValue) problems.push(`Scale maximum (${values.maxValue}) is smaller than the largest value (${largest}).`)
  }
  if (type === 'priceTimeline' && typeof values.maxValue === 'number') {
    const points = [...((values.price as Values[]) || []), ...((values.nav as Values[]) || [])]
    const highest = Math.max(...points.map((point) => point.value).filter((v): v is number => typeof v === 'number'))
    if (highest > values.maxValue) problems.push(`Top of the scale (${values.maxValue}) is lower than the highest point (${highest}).`)
  }
  if (isExample(type, values)) problems.push('It still has the example data. Replace it with your own.')
  return problems
}

/** True when the chart's fields are exactly the example a new chart starts with. */
export function isExample(type: ChartType, values: Values): boolean {
  const spec = CHART_SPECS[type]
  return JSON.stringify(cleanChartValues(spec.fields, values)) === JSON.stringify(cleanChartValues(spec.fields, spec.example))
}

/**
 * Fills missing required lists, groups, text and numbers with empty values, so a half-filled
 * chart can be previewed without the site components failing on missing data.
 */
export function withPreviewDefaults(fields: FieldSpec[], values: Values): Values {
  const out: Values = { ...values }
  for (const field of fields) {
    const value = out[field.key]
    if (field.kind === 'group') {
      if (value && typeof value === 'object') out[field.key] = withPreviewDefaults(field.fields, value as Values)
      else if (field.required) out[field.key] = withPreviewDefaults(field.fields, {})
    } else if (field.kind === 'list') {
      const items = Array.isArray(value) ? value : field.required ? [] : undefined
      if (items) out[field.key] = items.map((item) => withPreviewDefaults(field.fields, (item || {}) as Values))
    } else if (value === undefined && field.required) {
      // A scale top of 0 would divide by zero in the drawing
      out[field.key] = field.kind === 'number' ? (field.key === 'maxValue' ? 1 : 0) : field.kind === 'numbers' ? [] : field.kind === 'select' ? field.options[0]?.value : ''
    }
  }
  return out
}

/** The chart's data without the block's own _type and _key. */
export function chartValues(block: Values): Values {
  const { _type: _t, _key: _k, ...rest } = block
  return rest
}

/** One-line summary for the editor's block card. */
export function chartSummary(type: ChartType, values: Values): string {
  if (type === 'sourceQuote') return `“${String(values.quote || '').slice(0, 120)}”`
  return String(values.title || CHART_SPECS[type].name)
}
