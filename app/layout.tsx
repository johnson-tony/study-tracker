import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"StudyTrack — Interview Preparation",description:"Your eight-week study plan and daily learning tracker."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
