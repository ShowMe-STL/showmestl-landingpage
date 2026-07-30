import nodemailer from 'nodemailer'

const NOTIFY_EMAILS = [process.env.GMAIL_USER, 'jack@agrippacreatives.com'].filter(Boolean).join(', ')

export async function POST(request: Request) {
  try {
    const { email, website } = await request.json()

    // Honeypot field for basic bot protection
    if (website) {
      return Response.json({ success: true })
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json({ error: 'Please enter a valid email.' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: NOTIFY_EMAILS,
      replyTo: email,
      subject: 'New partner inquiry — ShowMe STL',
      text: `A business owner left their email on the ShowMe STL partner page:\n\n${email}`,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return Response.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
