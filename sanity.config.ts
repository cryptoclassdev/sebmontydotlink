import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { sanityDataset, sanityProjectId } from './sanity/client'

export default defineConfig({
  name: 'default',
  title: 'Seb Montgomery Blog',

  projectId: sanityProjectId,
  dataset: sanityDataset,

  basePath: '/studio',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
