import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "src/app/cust-page/cv-example/CV-Contoh.pdf");
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline; filename=CV-Contoh.pdf",
            },
        });
    } catch {
        return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }
}