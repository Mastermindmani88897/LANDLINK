import React, { useEffect } from 'react';

export default function SEO({ title, description, image, url, schema }) {
  const siteName = 'LandLink AI';
  const defaultTitle = `${siteName} - AI-Powered Real Estate Platform`;
  const defaultDesc = 'Buy, sell, and analyze properties directly with owners powered by Gemini AI neural valuations and instant chat.';
  
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDesc = description || defaultDesc;
  const pageImage = image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=630&fit=crop';
  const pageUrl = url || typeof window !== 'undefined' ? window.location.href : 'https://landlink-ai.vercel.app';

  useEffect(() => {
    document.title = pageTitle;

    const setMeta = (name, content, isProperty = false) => {
      let element = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) element.setAttribute('property', name);
        else element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', pageDesc);
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', pageDesc, true);
    setMeta('og:image', pageImage, true);
    setMeta('og:url', pageUrl, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDesc);
    setMeta('twitter:image', pageImage);

    // JSON-LD Structured Data
    let scriptTag = document.getElementById('json-ld-schema');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'json-ld-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [pageTitle, pageDesc, pageImage, pageUrl, schema]);

  return null;
}
