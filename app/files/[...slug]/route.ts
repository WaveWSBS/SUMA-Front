import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: { slug: string[] } },
) {
  const slugParts = params.slug
  if (!slugParts || slugParts.length === 0) {
    return NextResponse.json({ error: "File not specified" }, { status: 400 })
  }

  const relativePath = slugParts.join("/")
  const baseDir = path.join(process.cwd(), "pdfs")
  const resolvedPath = path.normalize(path.join(baseDir, relativePath))

  if (!resolvedPath.startsWith(baseDir)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const fileBuffer = await fs.readFile(resolvedPath)
    const ext = path.extname(resolvedPath).toLowerCase()
    const contentType = ext === ".pdf" ? "application/pdf" : "application/octet-stream"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${slugParts[slugParts.length - 1]}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
