import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sheetName = searchParams.get("sheetName");
  const GAS_URL = process.env.CASES_GAS_URL; // V2用にCASES_GAS_URLを使用

  if (!sheetName) {
    return NextResponse.json({ success: false, error: "sheetName is required" }, { status: 400 });
  }

  try {
    if (!GAS_URL) throw new Error("CASES_GAS_URL is not set");
    
    const url = new URL(GAS_URL);
    url.searchParams.append("sheetName", sheetName);

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`GAS Error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET GAS Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const GAS_URL = process.env.CASES_GAS_URL;

  try {
    const body = await req.json();

    if (!GAS_URL) throw new Error("CASES_GAS_URL is not set");

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ data: JSON.stringify(body) }),
    });

    if (!res.ok) {
      throw new Error(`GAS Error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("POST GAS Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
