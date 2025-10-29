/**
 * Utility per gestire i colori dei department
 */

// Palette di colori predefiniti per i department - colori molto distinti
const DEPARTMENT_COLORS = [
  '#FF0000', // Rosso brillante
  '#00FF00', // Verde lime
  '#0000FF', // Blu elettrico
  '#FFFF00', // Giallo
  '#FF00FF', // Magenta
  '#00FFFF', // Ciano
  '#FF8000', // Arancione
  '#8000FF', // Viola
  '#FF0080', // Rosa
  '#80FF00', // Verde chiaro
  '#0080FF', // Blu cielo
  '#FF8080', // Rosso chiaro
  '#80FF80', // Verde menta
  '#8080FF', // Blu lavanda
  '#FFFF80', // Giallo chiaro
  '#FF80FF', // Rosa chiaro
  '#80FFFF', // Azzurro
  '#800000', // Rosso scuro
  '#008000', // Verde scuro
  '#000080', // Blu scuro
];

/**
 * Genera un colore consistente basato sul nome del department
 * Utilizza un hash semplice per garantire che lo stesso nome produca sempre lo stesso colore
 */
export function getDepartmentColor(departmentName: string): string {
  if (!departmentName) return '#6B7280'; // Colore grigio di default

  // Calcola un hash semplice basato sul nome
  let hash = 0;
  for (let i = 0; i < departmentName.length; i++) {
    const char = departmentName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte in 32bit
  }

  // Assicura che l'hash sia positivo
  hash = Math.abs(hash);

  // Seleziona un colore dalla palette
  const colorIndex = hash % DEPARTMENT_COLORS.length;
  return DEPARTMENT_COLORS[colorIndex];
}

/**
 * Restituisce un colore leggermente più scuro per i bordi/ombre
 */
export function getDepartmentBorderColor(color: string): string {
  // Per ora restituisce lo stesso colore, ma potrebbe essere migliorato
  // per calcolare una versione più scura
  return color;
}

/**
 * Restituisce un colore per il testo contrastante (bianco o nero)
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Questa è una semplificazione - in produzione si potrebbe usare una libreria
  // per calcolare il contrasto reale
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcola la luminosità (formula standard)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? '#000000' : '#FFFFFF';
}