import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const purgeTag = (tag: string) => {
  try {
    (revalidateTag as any)(tag, { expire: 0 });
  } catch {
    try {
      (revalidateTag as any)(tag);
    } catch {
      // ignore
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tag, path } = body;

    if (tag) {
      purgeTag(tag);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path, 'layout');
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    // Default: revalidate common public content
    const commonTags = ['home', 'courses', 'classes', 'instructors', 'blog', 'categories'];
    for (const t of commonTags) {
      purgeTag(t);
    }
    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, tags: commonTags, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Revalidation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');

  if (tag) {
    purgeTag(tag);
    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  }
  if (path) {
    revalidatePath(path, 'layout');
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  }

  purgeTag('home');
  purgeTag('courses');
  purgeTag('classes');
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true, now: Date.now() });
}

