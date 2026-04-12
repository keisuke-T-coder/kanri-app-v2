import { NextResponse } from 'next/server';

function getGasUrl() {
  const url = process.env.GAS_URL || process.env.NEXT_PUBLIC_NEW_GAS_URL || process.env.NEXT_PUBLIC_GAS_URL || "";
  console.log("DEBUG: Target GAS_URL identified:", url ? "URL exists (length: " + url.length + ")" : "URL IS EMPTY");
  return url;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const GAS_URL = getGasUrl();
  
  try {
    if (!GAS_URL) {
      console.error("DEBUG ERROR: No GAS_URL found in process.env. (Keys checked: GAS_URL, NEXT_PUBLIC_NEW_GAS_URL, NEXT_PUBLIC_GAS_URL)");
      throw new Error("GAS_URL is not defined in environment variables (checked 3 variants)");
    }

    const gasUrlWithParams = `${GAS_URL}?${searchParams.toString()}`;
    console.log("DEBUG: Fetching from GAS (GET):", gasUrlWithParams.substring(0, 100) + "...");

    const res = await fetch(gasUrlWithParams, { 
      cache: "no-store", 
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) {
        const errText = await res.text();
        console.error("DEBUG ERROR: GAS responded with status", res.status, "Body:", errText);
        throw new Error(`GAS returned status ${res.status}`);
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("DEBUG ERROR: Failed to parse GAS response as JSON. Body snippet:", text.substring(0, 200));
      throw new Error(`GASからの応答がJSONではありませんでした。 (内容: ${text.substring(0, 100)}...)`);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GAS Proxy GET Critical Error:", error.message, error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const GAS_URL = getGasUrl();
  
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

    console.log("DEBUG: Posting to GAS (POST). Body type:", contentType);

    const res = await fetch(GAS_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: new URLSearchParams({ data: JSON.stringify(body) })
    });
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("DEBUG ERROR: Failed to parse GAS POST response as JSON. Body:", text.substring(0, 200));
      throw new Error(`GASからの応答がJSONではありませんでした。 (内容: ${text.substring(0, 100)}...)`);
    }

    if (!res.ok) throw new Error(data.error || "Failed to post to GAS");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GAS Proxy POST Critical Error:", error.message, error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
