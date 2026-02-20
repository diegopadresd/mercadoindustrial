import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export const PageMeta = ({
  title,
  description,
  image = 'https://storage.googleapis.com/gpt-engineer-file-uploads/lbsCK7F3QIUlTDY2mHIEsgcYAFj1/social-images/social-1770061755213-image.webp',
  url,
  type = 'website',
}: PageMetaProps) => {
  const fullTitle = title.includes('Mercado Industrial')
    ? title
    : `${title} | Mercado Industrial`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      {url && <link rel="canonical" href={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
