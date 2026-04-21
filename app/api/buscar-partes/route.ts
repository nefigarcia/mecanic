import { NextRequest, NextResponse } from "next/server";

const SERPER_API_KEY = process.env.SERPER_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const vehiculo = searchParams.get("vehiculo")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  if (!SERPER_API_KEY) {
    return NextResponse.json({ error: "Serper API no configurada" }, { status: 500 });
  }

  const query = vehiculo ? `refaccion ${q} ${vehiculo}` : `refaccion ${q}`;

  try {
    const res = await fetch("https://google.serper.dev/shopping", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, gl: "mx", hl: "es", num: 10 }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Serper error:", res.status, await res.text());
      return NextResponse.json({ items: [] });
    }

    const data = await res.json();

    const items = (data.shopping ?? []).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.source,
      displayLink: item.source,
      image: item.imageUrl ?? null,
      price: item.price ?? null,
    }));

    return NextResponse.json({ items });
  } catch (e) {
    console.error("Error consultando Serper:", e);
    return NextResponse.json({ items: [] });
  }
}
