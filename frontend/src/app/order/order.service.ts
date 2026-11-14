import { effect, Injectable, signal } from '@angular/core';
import { Product } from '../menu/menu';

const STORAGE_KEY = 'kinsa-order';
const MAX_QUANTITY = 99;
const WHATSAPP_NUMBER = '51963157142';
export const WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}`;

export interface OrderLine {
  product: Product;
  quantity: number;
  subtotal: number;
}

export type Fulfillment = { kind: 'pickup' } | { kind: 'delivery'; address: string; reference: string };

export interface CheckoutDetails {
  name: string;
  phone: string;
  fulfillment: Fulfillment;
  notes: string;
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

  whatsappUrl(lines: OrderLine[], { name, phone, fulfillment, notes }: CheckoutDetails): string {
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const delivery = fulfillment.kind === 'delivery';
    const message = [
      '🛒 *NUEVO PEDIDO · KINSA T’IQSI*',
      '',
      ...lines.map(({ product, quantity, subtotal }) =>
        `🍽️ *${product.name}*\n📦 Cantidad: ${quantity}\n💰 Subtotal: ${soles(subtotal)}\n`,
      ),
      '━━━━━━━━━━━━━━━━━━',
      `💵 *${delivery ? 'TOTAL DE PLATOS' : 'TOTAL'}: ${soles(total)}*`,
      ...(delivery ? ['Costo de delivery por confirmar.'] : []),
      '',
      '📋 *DATOS DEL CLIENTE*',
      `👤 Nombre: ${name.trim()}`,
      `📱 Teléfono: ${phone}`,
      delivery ? '🛵 *Delivery*' : '📍 *Recojo en local*',
      ...(delivery ? [
        `🏠 Dirección: ${fulfillment.address.trim()}`,
        `📍 Referencia: ${fulfillment.reference.trim()}`,
      ] : []),
      ...(notes.trim() ? ['', `📝 Observaciones: ${notes.trim()}`] : []),
    ].join('\n');
    // El redireccionamiento de wa.me reemplaza algunos emojis del pedido.
    const url = new URL('https://api.whatsapp.com/send/');
    url.searchParams.set('phone', WHATSAPP_NUMBER);
    url.searchParams.set('text', message);
    return url.href;
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
