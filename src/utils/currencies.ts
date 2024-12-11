const apiKey = process.env.NEXT_PUBLIC_API_KEY;

export async function getAvailableCurrencies() {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/codes`
    );
    const data = await response.json();
    return data.supported_codes.map((code: string[]) => code[0]);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    // Return default currencies if API fails
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 
      'CHF', 'CNY', 'INR', 'NZD', 'SGD'
    ];
  }
} 