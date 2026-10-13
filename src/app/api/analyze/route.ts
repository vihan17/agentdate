import { NextResponse } from 'next/server';
import { scrapeLinkedIn, scrapeInstagram } from '@/lib/apify';
import { analyzePerson } from '@/lib/analysis';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { linkedinUrl?: string; instagramUrl?: string };
    const linkedinUrl = body.linkedinUrl?.trim();
    const instagramUrl = body.instagramUrl?.trim();
    if (!linkedinUrl || !instagramUrl) {
      return NextResponse.json({ error: 'Both LinkedIn and Instagram URLs are required.' }, { status: 400 });
    }
    if (!linkedinUrl.includes('linkedin.com/in/') || !instagramUrl.includes('instagram.com/')) {
      return NextResponse.json({ error: 'Provide a LinkedIn profile URL (linkedin.com/in/...) and an Instagram profile URL (instagram.com/...).' }, { status: 400 });
    }

    const [li, ig] = await Promise.all([scrapeLinkedIn(linkedinUrl), scrapeInstagram(instagramUrl)]);
    if (!li) return NextResponse.json({ error: 'Could not read that LinkedIn profile. Is it public?' }, { status: 422 });
    if (!ig) return NextResponse.json({ error: 'Could not read that Instagram profile. Is it public?' }, { status: 422 });
    if ((ig as { private?: boolean }).private) {
      return NextResponse.json({ error: 'That Instagram account is private. Only public profiles work.' }, { status: 422 });
    }

    const name = `${li.firstName ?? ''} ${li.lastName ?? ''}`.trim() || (ig.fullName as string) || 'Unknown';
    const analysis = await analyzePerson(name, li, ig);

    return NextResponse.json({
      person: {
        id: (li.publicIdentifier as string) ?? (ig.username as string) ?? 'person',
        name,
        linkedinUrl,
        instagramUrl,
        headline: (li.headline as string) ?? '',
        photo: (li.profilePicture as string) ?? (ig.profilePicUrlHD as string) ?? '',
        analysis,
      },
    });
  } catch (e) {
    console.error('analyze error', e);
    return NextResponse.json({ error: 'Something went wrong while analyzing. Try again.' }, { status: 500 });
  }
}
