import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  twitterCard?: string
  canonical?: string
  noindex?: boolean
}

export function usePageSEO({
  title,
  description,
  keywords,
  ogImage = 'https://pharmetrix.onrender.com/full-logo.png',
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const updateMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    const updatePropertyTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    const updateLinkTag = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`)
      if (!tag) {
        tag = document.createElement('link')
        tag.setAttribute('rel', rel)
        document.head.appendChild(tag)
      }
      tag.setAttribute('href', href)
    }

    document.title = title

    updateMetaTag('description', description)
    if (keywords) updateMetaTag('keywords', keywords)
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    }

    updatePropertyTag('og:title', title)
    updatePropertyTag('og:description', description)
    updatePropertyTag('og:image', ogImage)
    updatePropertyTag('og:type', ogType)
    if (ogUrl) updatePropertyTag('og:url', ogUrl)

    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', ogImage)
    updateMetaTag('twitter:card', twitterCard)

    if (canonical) {
      updateLinkTag('canonical', canonical)
    }

    return () => {
    }
  }, [title, description, keywords, ogImage, ogUrl, ogType, twitterCard, canonical, noindex])
}
