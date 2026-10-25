export function formatAssistantText(text: string): string {
  const protectedParts: string[] = [];
  const protectedText = text.replace(
    /```[\s\S]*?(?:```|$)|`[^`\n]*(?:`|$)|\[[^\]]+\]\([^)]+\)/g,
    (part) => {
      protectedParts.push(part);
      return `\u0000${protectedParts.length - 1}\u0000`;
    },
  );
  const formatted = protectedText
    .replace(/^\s{0,3}#{1,6}\s*(\d+)[.)]\s*/gm, '$1. ')
    .replace(/^\s{0,3}#{1,6}\s*(\d+)\s*#*\s*$/gm, '$1.')
    .replace(/^\s{0,3}[*]{2,3}\s*(\d+)[.)]?\s*[*]{0,3}\s*/gm, '$1. ')
    .replace(/^\s{0,3}[*]{2,3}\s*(\d+)\s*[*]{0,3}\s*$/gm, '$1.')
    .replace(/\*{2,3}\s*(\d+)[.)]?\s*\*{0,3}/g, '$1. ')
    .replace(/\*{2,3}(\d+)\*{0,3}/g, '$1.')
    .replace(/_{2,3}(\d+)_{2,3}/g, '$1.')
    .replace(/^(\s{0,3})#{1,6}\s+/gm, '$1')
    .replace(/\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*/g, (_match, boldItalic, bold) => boldItalic || bold);

  return formatted.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => protectedParts[Number(index)]);
}
