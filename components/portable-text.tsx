"use client"

import { PortableText, type PortableTextComponents } from "@portabletext/react"
import Image from "next/image"
import { urlFor } from "@/lib/sanity"

interface PortableTextImage {
  _type: "image"
  _key: string
  asset: {
    _ref: string
  }
  alt?: string
}

interface PortableTextBlock {
  _type: "block"
  _key: string
  style?: string
  children: Array<{
    _type: string
    text: string
    marks?: string[]
  }>
  markDefs?: Array<{
    _type: string
    _key: string
    href?: string
  }>
}

type PortableTextContent = PortableTextBlock | PortableTextImage

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-white mt-12 mb-4 tracking-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-white mt-8 mb-3 tracking-tight">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-white/70 leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-white/20 pl-6 my-8 text-white/60 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono text-white/90">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#0055FF] hover:text-[#0077FF] underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: { value: PortableTextImage }) => {
      if (!value?.asset) return null
      return (
        <figure className="my-10">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.alt || "Blog image"}
              fill
              className="object-cover"
            />
          </div>
          {value.alt && (
            <figcaption className="text-center text-white/40 text-sm mt-3">
              {value.alt}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-white/70">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-white/70">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
}

interface BlogPortableTextProps {
  value: PortableTextContent[]
}

export function BlogPortableText({ value }: BlogPortableTextProps) {
  return <PortableText value={value} components={components} />
}
