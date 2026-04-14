import { NextResponse } from 'next/server';

function getGasUrl() {
  const url = process.env.GAS_URL || process.env.NEXT_PUBLIC_NEW_GAS_URL || process.env.NEXT_PUBLIC_GAS_URL || "";
  return url;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const GAS_URL = getGasUrl();
  
  console.log(`\n--- GAS PROXY GET START ---`);
  console.log(`URL: ${GAS_URL}`);
  console.log(`Params: ${searchParams.toString()}`);
  
  try {
    if (!GAS_URL) {
      console.error("DEBUG ERROR: No GAS_URL found in environment variables.");
      throw new Error("GAS_URL is not defined in environment variables");
    }

    const gasUrlWithParams = `${GAS_URL}?${searchParams.toString()}`;
    const res = await fetch(gasUrlWithParams, { 
      cache: "no-store", 
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
        const errText = await res.text();
        console.error(`GAS responded with status ${res.status}. Body: ${errText}`);
        throw new Error(`GAS returned status ${res.status}`);
    }

    const text = await res.text();
    console.log(`RAW GAS RESPONSE (length: ${text.length}): ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse GAS response as JSON.");
      throw new Error(`GASからの応答がJSONではありませんでした。`);
    }

    console.log(`--- GAS PROXY GET END ---\n`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GAS Proxy GET Critical Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const GAS_URL = getGasUrl();
  console.log(`\n--- GAS PROXY POST START ---`);
  
  try {
    if (!GAS_URL) throw new Error("GAS_URL is not defined in environment variables");

    const contentType = req.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const dataStr = params.get("data");
      body = dataStr ? JSON.parse(dataStr) : {};
    }

    console.log(`Payload Action: ${body.action}`);
    console.log(`Payload Data: ${JSON.stringify(body).substring(0, 200)}...`);

    const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: new URLSearchParams({ data: JSON.stringify(body) })
    });
    
    const text = await res.text();
    console.log(`RAW GAS RESPONSE: ${text.substring(0, 500)}`);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`GASからの応答がJSONではありませんでした。`);
    }

    if (!res.ok) throw new Error(data.error || "Failed to post to GAS");
    console.log(`--- GAS PROXY POST END ---\n`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GAS Proxy POST Critical Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

