// Keep the value unformatted in forms. Numeric schemas and the API continue to
// receive the same plain numeric value as before (for example, "50000.50").
const currencyValuePattern = /^-?\d*(?:\.\d*)?$/;

export const isValidCurrencyInput = (value: string) => currencyValuePattern.test(value);
