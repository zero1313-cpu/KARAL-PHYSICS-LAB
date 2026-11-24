import { PHYS } from './constants';

type Token = { type: 'number' | 'name' | 'op' | 'paren'; value: string };

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  exp: Math.exp,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
  G: PHYS.G,
  g: PHYS.g,
  c: PHYS.c,
  h: PHYS.h,
  k: PHYS.kB,
  qe: PHYS.e,
  NA: PHYS.NA,
  R: PHYS.R,
  eps0: PHYS.eps0,
  mu0: PHYS.mu0,
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i])) num += input[i++];
      if ((input[i] === 'e' || input[i] === 'E') && /[0-9+-]/.test(input[i + 1] ?? '')) {
        num += input[i++];
        if (input[i] === '+' || input[i] === '-') num += input[i++];
        while (i < input.length && /[0-9]/.test(input[i])) num += input[i++];
      }
      if (!/^\d*\.?\d+(?:[eE][+-]?\d+)?$/.test(num)) throw new Error(`Invalid number: ${num}`);
      tokens.push({ type: 'number', value: num });
      continue;
    }
    if (/[a-zA-Zπ]/.test(ch)) {
      let name = '';
      while (i < input.length && /[a-zA-Z0-9π_]/.test(input[i])) name += input[i++];
      tokens.push({ type: 'name', value: name });
      continue;
    }
    if ('+-*/^'.includes(ch)) {
      let op = ch;
      i++;
      if (ch === '*' && input[i] === '*') {
        op = '^';
        i++;
      }
      tokens.push({ type: 'op', value: op });
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }
    if (ch === '×') {
      tokens.push({ type: 'op', value: '*' });
      i++;
      continue;
    }
    if (ch === '÷') {
      tokens.push({ type: 'op', value: '/' });
      i++;
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
const DIRECT_TRIG = ['sin', 'cos', 'tan'];
const INVERSE_TRIG = ['asin', 'acos', 'atan'];

/** Safe, deterministic expression evaluator. Never calls eval or Function. */
export function evaluateExpression(input: string, degrees = false): number {
  const tokens = tokenize(input);
  let position = 0;
  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  function parsePrimary(): number {
    const token = consume();
    if (!token) throw new Error('Incomplete expression');
    if (token.type === 'number') return Number(token.value);
    if (token.type === 'paren' && token.value === '(') {
      const value = parseExpression(0);
      const closing = consume();
      if (!closing || closing.type !== 'paren' || closing.value !== ')') throw new Error('Missing closing bracket');
      return value;
    }
    if (token.type === 'name') {
      if (Object.hasOwn(FUNCTIONS, token.value)) {
        const fn = FUNCTIONS[token.value];
        const open = consume();
        if (!open || open.type !== 'paren' || open.value !== '(') throw new Error(`Function ${token.value} needs brackets`);
        const arg = parseExpression(0);
        const closing = consume();
        if (!closing || closing.type !== 'paren' || closing.value !== ')') throw new Error('Missing closing bracket');
        let result: number;
        if (degrees && DIRECT_TRIG.includes(token.value)) result = fn(arg * (Math.PI / 180));
        else if (degrees && INVERSE_TRIG.includes(token.value)) result = fn(arg) * (180 / Math.PI);
        else result = fn(arg);
        if (!Number.isFinite(result)) throw new Error('Result is undefined for this input');
        return result;
      }
      if (Object.hasOwn(CONSTANTS, token.value)) return CONSTANTS[token.value];
      throw new Error(`Unknown name: ${token.value}`);
    }
    throw new Error('Invalid expression');
  }

  // Exponentiation binds tighter than unary minus: -2^2 = -(2^2) = -4, while 2^-2 = 0.25.
  function parseUnary(): number {
    const op = peek();
    if (op && op.type === 'op' && (op.value === '-' || op.value === '+')) {
      consume();
      const value = parseUnary();
      return op.value === '-' ? -value : value;
    }
    return parsePower();
  }

  function parsePower(): number {
    const left = parsePrimary();
    const op = peek();
    if (op && op.type === 'op' && op.value === '^') {
      consume();
      return Math.pow(left, parseUnary());
    }
    return left;
  }

  function parseExpression(minPrecedence: number): number {
    let left = parseUnary();
    while (true) {
      const op = peek();
      if (!op || op.type !== 'op') break;
      const precedence = PRECEDENCE[op.value];
      if (precedence === undefined || precedence < minPrecedence) break;
      consume();
      const right = parseExpression(precedence + 1);
      if (op.value === '+') left += right;
      else if (op.value === '-') left -= right;
      else if (op.value === '*') left *= right;
      else if (op.value === '/') {
        if (right === 0) throw new Error('Division by zero');
        left /= right;
      } else if (op.value === '^') left = Math.pow(left, right);
    }
    return left;
  }

  const result = parseExpression(0);
  if (position < tokens.length) throw new Error('Unexpected trailing input');
  if (!Number.isFinite(result)) throw new Error('Result is not finite');
  return result;
}
