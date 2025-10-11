// api/create-checkout.ts
// Place this file in the ROOT of your project (not in src!)

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, donorName, donorEmail } = req.body;

    // Validate
    if (!amount || !currency || !donorName || !donorEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Stripe Secret Key from environment variable
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    // Get origin for redirects
    const origin = req.headers.origin || req.headers.referer || 'https://nourish-two.vercel.app';
    const baseUrl = origin.replace(/\/$/, '');

    // Call Stripe API
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'success_url': `${baseUrl}/donate?success=true`,
        'cancel_url': `${baseUrl}/donate?cancelled=true`,
        'payment_method_types[]': 'card',
        'mode': 'payment',
        'customer_email': donorEmail,
        'line_items[0][price_data][currency]': currency,
        'line_items[0][price_data][unit_amount]': amount.toString(),
        'line_items[0][price_data][product_data][name]': 'Donation to NourishSA',
        'line_items[0][price_data][product_data][description]': 
          'Support our mission to fight food insecurity in South Africa',
        'line_items[0][quantity]': '1',
        'metadata[donor_name]': donorName,
        'metadata[purpose]': 'donation',
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Stripe API error');
    }

    return res.status(200).json({
      url: data.url,
      sessionId: data.id,
    });

  } catch (error: any) {
    console.error('Payment error:', error);
    return res.status(500).json({
      error: 'Payment failed',
      message: error.message,
    });
  }
}