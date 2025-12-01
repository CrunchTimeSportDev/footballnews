// Vercel Serverless Function - Web3Forms Contact Form
// This keeps your API key secure on the server

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { name, email, message } = req.body;

    // Validate inputs
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Web3Forms API key from environment variable
    const web3formsKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (!web3formsKey) {
      console.error('WEB3FORMS_ACCESS_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Call Web3Forms API
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: web3formsKey,
        subject: 'New Contact Form Submission from Football News',
        name: name,
        email: email,
        message: message
      })
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({
        success: true,
        message: 'Message sent successfully!'
      });
    } else {
      console.error('Web3Forms error:', data);
      return res.status(400).json({
        success: false,
        error: data.message || 'Failed to send message'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}
