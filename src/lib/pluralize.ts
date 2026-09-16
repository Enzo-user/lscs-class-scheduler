/** "1 unit", "3 units", "0 courses": the count followed by the correctly pluralised noun. */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}
