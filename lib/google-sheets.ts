import { google } from "googleapis";
import type { StudyTask } from "@/types/task";

const ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1LTMWjHtfB0q50vLc1wc-vS41-Q75Ym4BFKweyG1vwz4";
const GID = Number(process.env.GOOGLE_SHEETS_GID || "262214206");
const aliases: Record<keyof Omit<StudyTask,"id">, string[]> = {
  week:["week"], plannedDate:["date","planned date","planned date (yyyy-mm-dd)"], dayName:["day","day name"], startTime:["start time"], endTime:["end time"], subject:["subject","category"], title:["task title","task name","title"], concepts:["concepts to learn","concepts"], practice:["hands-on practice","practice","hands on practice"], interview:["interview practice","interview question","interview questions"], goal:["completion goal","goal"], status:["status"], notes:["notes / mistakes","notes/mistakes","notes","mistakes / reflection notes"], completedDate:["completed date","completion date"], carriedOver:["carried over","carry-over"]
};
const fields = Object.keys(aliases) as (keyof typeof aliases)[];
function service() {
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, key=process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,"\n");
  if (!email || !key) throw new Error("Google Sheets is not configured. Add service account credentials and share the spreadsheet with that account.");
  const auth=new google.auth.JWT({email, key, scopes:["https://www.googleapis.com/auth/spreadsheets"]});
  return google.sheets({version:"v4",auth});
}
async function sheet() {
  const api=service(); const meta=await api.spreadsheets.get({spreadsheetId:ID});
  const tab=meta.data.sheets?.find(s=>s.properties?.sheetId===GID);
  if(!tab?.properties?.title) throw new Error(`No sheet tab found for gid ${GID}.`);
  return {api,title:tab.properties.title};
}
function dateValue(v:unknown){ if(typeof v==="number"){const d=new Date(Date.UTC(1899,11,30)+v*86400000);return d.toISOString().slice(0,10);} const s=String(v??"").trim(); if(/^\d{4}-\d\d-\d\d$/.test(s))return s; const d=new Date(s);return s&& !Number.isNaN(d.valueOf())?d.toISOString().slice(0,10):s; }
function mapRows(values:any[][]):StudyTask[]{ if(!values.length)return []; const headers=values[0].map(v=>String(v??"").trim().toLowerCase()); const ix=(f:keyof typeof aliases)=>headers.findIndex(h=>aliases[f].includes(h)); return values.slice(1).map((row,i)=>{const get=(f:keyof typeof aliases)=>{const n=ix(f);return n<0?"":row[n]??""}; const plannedDate=dateValue(get("plannedDate")); return {id:String(row[headers.findIndex(h=>["task id","id"].includes(h))]??`row-${plannedDate}-${i+2}`),week:Number(get("week"))||1,plannedDate,dayName:String(get("dayName")||""),startTime:String(get("startTime")||"07:00 AM"),endTime:String(get("endTime")||"08:00 AM"),subject:String(get("subject")||"General"),title:String(get("title")||"Untitled task"),concepts:String(get("concepts")||""),practice:String(get("practice")||""),interview:String(get("interview")||""),goal:String(get("goal")||""),status:(String(get("status")||"Pending") as StudyTask["status"]),notes:String(get("notes")||""),completedDate:dateValue(get("completedDate"))||null,carriedOver:String(get("carriedOver")).toLowerCase()==="true"}; }); }
export async function getTasks(){const {api,title}=await sheet();const res=await api.spreadsheets.values.get({spreadsheetId:ID,range:`'${title.replace(/'/g,"''")}'!A:Z`});return mapRows(res.data.values||[]);}
export async function saveTask(task:StudyTask){const {api,title}=await sheet();const range=`'${title.replace(/'/g,"''")}'!A:Z`;const res=await api.spreadsheets.values.get({spreadsheetId:ID,range});const rows=res.data.values||[];if(!rows.length)throw new Error("The target sheet needs a header row before tasks can be saved.");const headers=rows[0].map((x:any)=>String(x??"").trim().toLowerCase());const indices=fields.map(f=>headers.findIndex((h:string)=>aliases[f].includes(h)));if(indices.some((i,n)=>i<0&&fields[n]!=="carriedOver"))throw new Error("Sheet headers do not match the documented StudyTrack columns. Add the expected headers listed in README.md.");const idColumn=headers.findIndex((h:string)=>["task id","id"].includes(h));const matchIndex=idColumn>=0?rows.findIndex((r:any[],i:number)=>i>0&&String(r[idColumn])===task.id):rows.findIndex((r:any[],i:number)=>i>0&&String(r[indices[5]]??"")===task.title&&dateValue(r[indices[1]])===task.plannedDate);const row=matchIndex>0?[...rows[matchIndex]]:Array(headers.length).fill("");for(const [n,f] of fields.entries()){if(indices[n]<0)continue;const val=task[f];row[indices[n]]=f==="carriedOver"?(val?"TRUE":"FALSE"):val??"";}if(idColumn>=0)row[idColumn]=task.id;const rowNumber=matchIndex>0?matchIndex+1:rows.length+1;await api.spreadsheets.values.update({spreadsheetId:ID,range:`'${title.replace(/'/g,"''")}'!A${rowNumber}`,valueInputOption:"USER_ENTERED",requestBody:{values:[row]}});return task;}

