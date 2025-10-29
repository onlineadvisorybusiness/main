import { NextResponse } from 'next/server'
import { uploadImage } from '../../../lib/cloudinary'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadImage(buffer)
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
