import { NextResponse } from "next/server";
import { query } from "@/lib/db";
export const runtime="nodejs";
export async function GET(){try{await query("SELECT 1");return NextResponse.json({ok:true,service:"gridpulse-api",database:"reachable"})}catch{return NextResponse.json({ok:false,service:"gridpulse-api",database:"unavailable"},{status:503})}}}
