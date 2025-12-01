// Vercel Serverless Function - Brevo Email Subscription
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
    console.log('Received subscription request:', req.body);
    const { email } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Your Brevo API key (from environment variable)
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      console.error('BREVO_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Call Brevo API
    console.log('Calling Brevo API for email:', email);
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        listIds: [8], // Football News list
        updateEnabled: true
      })
    });

    console.log('Brevo API response status:', response.status);

    // Check if response has content before parsing
    const responseText = await response.text();
    console.log('Brevo API response body:', responseText);

    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Brevo response:', parseError);
        return res.status(500).json({
          success: false,
          error: 'Invalid response from email service'
        });
      }
    }

    if (response.ok || response.status === 201) {
      return res.status(200).json({
        success: true,
        message: 'Successfully subscribed!'
      });
    } else if (response.status === 400 && data.message?.includes('already exists')) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed!'
      });
    } else {
      console.error('Brevo API error:', data);
      return res.status(response.status || 500).json({
        success: false,
        error: data.message || 'Subscription failed'
      });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
}
