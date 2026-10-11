import { NextResponse } from "next/server";
import { getTasks, saveTask } from "@/lib/google-sheets";
import type { StudyTask } from "@/types/task";
export const runtime="nodejs";
export async function GET(){try{return NextResponse.json({tasks:await getTasks()});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not read Google Sheet"},{status:503});}}
export async function PUT(req:Request){try{const task=await req.json() as StudyTask;if(!task.title||!task.plannedDate||!task.subject||!task.id)return NextResponse.json({error:"Task name, date, category, and id are required."},{status:400});const tasks=await getTasks();const current=tasks.find(item=>item.id===task.id);const changed=!current?task.status!=="Pending":current.status!==task.status;if(changed&&task.status!=="Pending"){const blocker=tasks.filter(item=>item.id!==task.id&&item.status!=="Completed"&&item.plannedDate<=task.plannedDate).sort((a,b)=>a.plannedDate.localeCompare(b.plannedDate))[0];if(blocker)return NextResponse.json({error:`Finish "${blocker.title}" first to keep your study queue in order.`},{status:409});}return NextResponse.json({task:await saveTask(task)});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save task"},{status:503});}}

