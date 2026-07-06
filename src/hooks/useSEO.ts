import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description: string;
  schema?: Record<string, any>;
  noIndex?: boolean;
}

export function useSEO({ title, description, schema, noIndex = false }: SEOOptions) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Update Robots Tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 4. Update Open Graph Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': window.location.href,
      'og:image': `${window.location.origin}/rewardmate-logo-cropped.png`
    };

    Object.entries(ogTags).forEach(([property, value]) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    });

    // 5. Inject JSON-LD Schema
    let scriptSchema = document.querySelector('script[type="application/ld+json"]');
    if (schema) {
      if (!scriptSchema) {
        scriptSchema = document.createElement('script');
        scriptSchema.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.textContent = JSON.stringify(schema);
    } else if (scriptSchema) {
      scriptSchema.remove();
    }

    return () => {
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script) {
        script.remove();
      }
    };
  }, [title, description, schema, noIndex]);
}
