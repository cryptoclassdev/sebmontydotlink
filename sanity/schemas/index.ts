import author from './author'
import blockContent from './blockContent'
import category from './category'
import comment from './comment'
import post from './post'
import siteSettings from './siteSettings'

export const schemaTypes = [
  // Document types
  post,
  author,
  category,
  comment,
  siteSettings,
  // Other types
  blockContent,
]
