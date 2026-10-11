import { NextResponse } from "next/server";
import { getTasks, saveTask } from "@/lib/google-sheets";
import type { StudyTask } from "@/types/task";
export const runtime="nodejs";
export async function GET(){try{return NextResponse.json({tasks:await getTasks()});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not read Google Sheet"},{status:503});}}
export async function PUT(req:Request){try{const task=await req.json() as StudyTask;if(!task.title||!task.plannedDate||!task.subject||!task.id)return NextResponse.json({error:"Task name, date, category, and id are required."},{status:400});return NextResponse.json({task:await saveTask(task)});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Could not save task"},{status:503});}}
