import { Pool, type QueryResultRow } from "pg";
const connectionString=process.env.DATABASE_URL;
if(!connectionString) throw new Error("DATABASE_URL is required");
const globalForPg=globalThis as unknown as {gridpulsePool?:Pool};
export const pool=globalForPg.gridpulsePool??new Pool({connectionString,max:5,idleTimeoutMillis:30000,connectionTimeoutMillis:10000,ssl:process.env.NODE_ENV==="production"?{rejectUnauthorized:true}:undefined});
if(process.env.NODE_ENV!=="production") globalForPg.gridpulsePool=pool;
export async function query<T extends QueryResultRow>(text:string,values:unknown[]=[]){return pool.query<T>(text,values)}
