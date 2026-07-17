import { defineType, defineArrayMember } from 'sanity'

export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel'],
                  }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for readers using assistive technology.',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
        {
          name: 'credit',
          type: 'string',
          title: 'Credit',
        },
        {
          name: 'creditUrl',
          type: 'url',
          title: 'Credit URL',
          validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
        },
        {
          name: 'layout',
          type: 'string',
          title: 'Layout',
          initialValue: 'wide',
          options: {
            layout: 'radio',
            list: [
              { title: 'Reading width', value: 'regular' },
              { title: 'Wide', value: 'wide' },
            ],
          },
        },
      ],
    }),
    defineArrayMember({
      name: 'code',
      type: 'object',
      title: 'Code Block',
      fields: [
        {
          name: 'language',
          type: 'string',
          title: 'Language',
          options: {
            list: [
              { title: 'TypeScript', value: 'typescript' },
              { title: 'JavaScript', value: 'javascript' },
              { title: 'Python', value: 'python' },
              { title: 'Rust', value: 'rust' },
              { title: 'Solidity', value: 'solidity' },
              { title: 'Bash', value: 'bash' },
              { title: 'JSON', value: 'json' },
            ],
          },
        },
        {
          name: 'code',
          type: 'text',
          title: 'Code',
        },
      ],
      preview: {
        select: {
          language: 'language',
          code: 'code',
        },
        prepare({ language, code }) {
          return {
            title: `Code: ${language || 'unknown'}`,
            subtitle: code?.slice(0, 50) + '...',
          }
        },
      },
    }),
    defineArrayMember({
      name: 'youtube',
      type: 'object',
      title: 'YouTube Video',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'YouTube URL',
          description: 'Paste a YouTube watch, share, Shorts, or live URL.',
          validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }).custom((value) => {
            if (!value) return true
            if (typeof value !== 'string') return 'Use a valid YouTube URL.'
            try {
              const host = new URL(value).hostname.replace(/^www\./, '')
              return host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com')
                ? true
                : 'Use a YouTube URL.'
            } catch {
              return 'Use a valid YouTube URL.'
            }
          }),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Title (optional)',
          description: 'Use the video title or a short description of what plays.',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      preview: {
        select: {
          title: 'title',
          subtitle: 'url',
        },
        prepare({ title, subtitle }) {
          return {
            title: title || 'YouTube video',
            subtitle,
          }
        },
      },
    }),
    defineArrayMember({
      name: 'sourceQuote',
      type: 'object',
      title: 'Source quote',
      description: 'A prominent quotation with a directly linked primary source.',
      fields: [
        {
          name: 'eyebrow',
          type: 'string',
          title: 'Eyebrow',
          initialValue: 'Quoted source',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'quote',
          type: 'text',
          title: 'Quote',
          rows: 4,
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'sourceTitle',
          type: 'string',
          title: 'Source title',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'sourceDetail',
          type: 'string',
          title: 'Source detail',
          description: 'For example, the filing or publication date.',
        },
        {
          name: 'sourceUrl',
          type: 'url',
          title: 'Source URL',
          validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
        },
      ],
      preview: {
        select: { title: 'quote', subtitle: 'sourceTitle' },
        prepare({ title, subtitle }) {
          return { title: title || 'Source quote', subtitle }
        },
      },
    }),
    defineArrayMember({
      name: 'metricGrid',
      type: 'object',
      title: 'Metric grid figure',
      description: 'A responsive, brand-safe four-metric snapshot.',
      fields: [
        {
          name: 'eyebrow',
          type: 'string',
          title: 'Eyebrow',
          initialValue: 'Market snapshot',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Title',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'dateLabel',
          type: 'string',
          title: 'Date label',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'dateTime',
          type: 'date',
          title: 'Machine-readable date',
        },
        {
          name: 'metrics',
          type: 'array',
          title: 'Metrics',
          validation: (Rule) => Rule.required().length(4),
          of: [
            {
              type: 'object',
              fields: [
                { name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() },
                { name: 'value', type: 'string', title: 'Value', validation: (Rule) => Rule.required() },
                { name: 'detail', type: 'string', title: 'Detail', validation: (Rule) => Rule.required() },
                {
                  name: 'tone',
                  type: 'string',
                  title: 'Surface tone',
                  initialValue: 'neutral',
                  options: {
                    list: [
                      { title: 'Gauge', value: 'gauge' },
                      { title: 'Sebring', value: 'sebring' },
                      { title: 'Neutral', value: 'neutral' },
                    ],
                    layout: 'radio',
                  },
                  validation: (Rule) => Rule.required(),
                },
              ],
              preview: {
                select: { title: 'label', subtitle: 'value' },
              },
            },
          ],
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'ariaLabel',
          type: 'string',
          title: 'Accessible summary (optional)',
          description: 'A concise spoken summary. Generated automatically when left blank.',
        },
      ],
      preview: {
        select: { title: 'title', subtitle: 'dateLabel' },
      },
    }),
    defineArrayMember({
      name: 'stackedBar',
      type: 'object',
      title: 'Stacked bar figure',
      description: 'A responsive, brand-safe data figure for allocations, shares, or portfolio weights.',
      fields: [
        {
          name: 'eyebrow',
          type: 'string',
          title: 'Eyebrow',
          initialValue: 'Portfolio weights',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Title',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'dateLabel',
          type: 'string',
          title: 'Date label',
          description: 'For example: June 22, 2026.',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'dateTime',
          type: 'date',
          title: 'Machine-readable date',
        },
        {
          name: 'highlight',
          type: 'object',
          title: 'Lead figure (optional)',
          fields: [
            { name: 'value', type: 'string', title: 'Value' },
            { name: 'label', type: 'string', title: 'Explanation' },
          ],
        },
        {
          name: 'segments',
          type: 'array',
          title: 'Segments',
          validation: (Rule) => Rule.required().min(2).max(8),
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', type: 'string', title: 'Name', validation: (Rule) => Rule.required() },
                { name: 'value', type: 'number', title: 'Relative value', validation: (Rule) => Rule.required().positive() },
                { name: 'displayValue', type: 'string', title: 'Displayed value', description: 'For example: 19.4% or ~6%.' },
                {
                  name: 'tone',
                  type: 'string',
                  title: 'Brand tone',
                  initialValue: 'gray-3',
                  options: {
                    list: [
                      { title: 'Gauge', value: 'gauge' },
                      { title: 'Sebring', value: 'sebring' },
                      { title: 'Redline', value: 'redline' },
                      { title: 'Gray 2', value: 'gray-2' },
                      { title: 'Gray 3', value: 'gray-3' },
                      { title: 'Gray 5', value: 'gray-5' },
                    ],
                    layout: 'radio',
                  },
                  validation: (Rule) => Rule.required(),
                },
              ],
              preview: {
                select: { title: 'name', subtitle: 'displayValue' },
              },
            },
          ],
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'ariaLabel',
          type: 'string',
          title: 'Accessible summary (optional)',
          description: 'A concise spoken summary of the chart. Generated automatically when left blank.',
        },
      ],
      preview: {
        select: { title: 'title', subtitle: 'dateLabel' },
      },
    }),
  ],
})
