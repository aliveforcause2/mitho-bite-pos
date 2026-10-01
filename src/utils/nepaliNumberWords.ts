export function amountToWordsEnglish(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertBelowThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let result = '';
  let n = rounded;

  if (n >= 10000000) {
    // Crore
    result += convertBelowThousand(Math.floor(n / 10000000)) + ' Crore ';
    n %= 10000000;
  }
  if (n >= 100000) {
    // Lakh
    result += convertBelowThousand(Math.floor(n / 100000)) + ' Lakh ';
    n %= 100000;
  }
  if (n >= 1000) {
    // Thousand
    result += convertBelowThousand(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  if (n > 0) {
    result += convertBelowThousand(n);
  }

  return (result.trim() + ' NPR Only').replace(/\s+/g, ' ');
}
