import { createHmac } from 'crypto';

// hay que documentar para los alumnos que esto funciona con sha256
export function sign(payload: string, secret: string): string {
  const hex = createHmac('sha256', secret).update(payload).digest('hex');
  return `sha256=${hex}`;
}
