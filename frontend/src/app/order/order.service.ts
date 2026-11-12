import { effect, Injectable, signal } from '@angular/core';
import { Product } from '../menu/menu';

const STORAGE_KEY = 'kinsa-order';
const MAX_QUANTITY = 99;
export const WHATSAPP = 'https://wa.me/51963157142';

export interface OrderLine {
  product: Product;
  quantity: number;
  subtotal: number;
}

export function soles(cents: number): string {
  return `S/ ${(cents / 100).toFixed(2)}`;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly quantities = signal(this.restore());

  constructor() {
    effect(() => {
      const quantities = this.quantities();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
      } catch {
        // The order remains available for this visit when storage is unavailable.
      }
    });
  }

  lines(products: Product[]): OrderLine[] {
    const quantities = this.quantities();
    return products.flatMap((product) => {
      const quantity = quantities[product.slug] ?? 0;
      return quantity > 0 ? [{ product, quantity, subtotal: product.price_cents * quantity }] : [];
    });
  }

  change(slug: string, delta: number): boolean {
    const current = this.quantities()[slug] ?? 0;
    const next = Math.max(0, Math.min(MAX_QUANTITY, current + delta));
    if (next === current) return false;
    if (next === 0) {
      this.remove(slug);
    } else {
      this.quantities.update((quantities) => ({ ...quantities, [slug]: next }));
    }
    return true;
  }

  remove(slug: string): void {
    this.quantities.update((quantities) => {
      const next = { ...quantities };
      delete next[slug];
      return next;
    });
  }

  whatsappUrl(lines: OrderLine[], name: string, notes: string): string {
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const message = [
      'Hola, Kinsa T’iqsi. Quisiera realizar el siguiente pedido:',
      '',
      ...lines.map(({ product, quantity, subtotal }) =>
        `- ${quantity} × ${product.name} — ${soles(subtotal)}`,
      ),
      '',
      `*Total: ${soles(total)}*`,
      '',
      `*Nombre:* ${name.trim()}`,
      `*Observaciones:* ${notes.trim() || 'Sin observaciones'}`,
      '',
      'Quedo atento a la confirmación. ¡Gracias!',
    ].join('\n');
    return `${WHATSAPP}?text=${encodeURIComponent(message)}`;
  }

  private restore(): Record<string, number> {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      if (saved === null || typeof saved !== 'object' || Array.isArray(saved)) return {};
      return Object.fromEntries(Object.entries(saved).filter(([slug, quantity]) =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
        && Number.isInteger(quantity) && quantity > 0 && quantity <= MAX_QUANTITY,
      ));
    } catch {
      return {};
    }
  }
}
