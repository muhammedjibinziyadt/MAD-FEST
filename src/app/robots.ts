import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ishalrabeehbuhsm.online/';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/jury/', '/team/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
