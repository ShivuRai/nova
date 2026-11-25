const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
const operators: Record<string, (a: number, b: number) => number> = {
  '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b,
  '/': (a, b) => a / b, '%': (a, b) => a % b, '^': (a, b) => a ** b,
};

export function calculate(expression: string): number | null {
  if (expression.length > 120 || !/^[\d.()+*/%^\s-]+$/.test(expression)) return null;
  const tokens = expression.match(/\d+\.?\d*|\.\d+|[^\s]/g) || [];
  let position = 0;

  const readExpression = (minimumPrecedence: number): number => {
    const first = tokens[position++];
    let value: number;
    if (first === '+' || first === '-') {
      value = (first === '-' ? -1 : 1) * readExpression(3);
    } else if (first === '(') {
      value = readExpression(1);
      if (tokens[position++] !== ')') throw new Error('Missing bracket');
    } else if (/^\.?\d/.test(first ?? '')) {
      value = Number(first);
    } else {
      throw new Error('Expected a number');
    }

    for (let token = tokens[position]; precedence[token] >= minimumPrecedence; token = tokens[position]) {
      position++;
      const right = readExpression(precedence[token] + (token === '^' ? 0 : 1));
      value = operators[token](value, right);
    }
    return value;
  };

  try {
    const result = readExpression(1);
    return position === tokens.length && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
