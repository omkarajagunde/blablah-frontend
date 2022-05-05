import Head from 'next/head';
import React from 'react'

function SEOTags(props) {
    console.log(props);

    const { blogTitle, blogImage, shortDesc, publishedAt, metaKeywords, blogSlug } = props.blog
  return (
    <Head>
        <meta charset="utf-8"/>
        <title>{blogTitle}</title>
        {/** Search Engine */}
        <meta name="description" content={shortDesc}/>
        <meta name="image" content={blogImage}/>
        <meta name="keywords" content={metaKeywords.map(kwd => `${kwd}, `)}/>
        {/** Schema.org for Google */}
        <meta itemprop="name" content={blogTitle}/>
        <meta itemprop="description" content={shortDesc}/>
        <meta itemprop="image" content={blogImage}/>
        {/** Twitter */}
        <meta name="twitter:title" content={blogTitle}/>
        <meta name="twitter:description" content={shortDesc}/>
        <meta name="twitter:site" content={"https://blablah.app/blog/"+ blogSlug}/>
        <meta name="twitter:image:src" content={blogImage}/>
         {/** Open Graph general (Facebook, Pinterest & Google+)  */}
         {/** Twitter - Article  */}
        <meta name="og:title" content={blogTitle}/>
        <meta name="og:description" content={shortDesc}/>
        <meta name="og:image" content={blogImage}/>
        <meta name="og:url" content={"https://blablah.app/blog/"+ blogSlug}/>
        <meta name="og:site_name" content={"blablah.app"}/>
        <meta name="og:locale" content={"en_US"}/>
        <meta name="og:type" content="article"/>
        {/** Open Graph Article  */}
        <meta name="article:section" content="blog"/>
        <meta name="article:published_time" content={new Date(publishedAt).toDateString()}/>
        <meta name="article:tag" content={metaKeywords.map(kwd => `${kwd}, `)}/>
        <meta name="article:modified_time" content={new Date(publishedAt).toDateString()}/>
    </Head>
  )
}

export default SEOTags