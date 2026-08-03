import { MetadataRoute } from 'next'
import { getPrograms } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ishalrabeehbuhsm.online/';
    let programUrls: Array<{
        url: string;
        lastModified: Date;
        changeFrequency: "hourly";
        priority: number;
    }> = [];

    try {
        const programs = await getPrograms();
        programUrls = programs.map((program) => ({
            url: `${baseUrl}/results/${program.id}`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error("Failed to fetch programs for sitemap during build:", error);
    }

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/results`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/scoreboard`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/participant`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/polls`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/predictions`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        ...programUrls,
    ]
}
