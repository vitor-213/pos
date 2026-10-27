/**
 * Genera un EAN-13 único.
 * Prefijo interno "20" + 10 dígitos aleatorios + dígito verificador.
 * Ajusta el prefijo si quieres tu propio rango.
 */
export const generateEAN13 = () => {
  const prefix = "20"; // rango interno
  let body = prefix;
  for (let i = 0; i < 10; i++) {
    body += Math.floor(Math.random() * 10).toString();
  }

  // Calcular dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(body[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return body + checkDigit;
};
