import { Component, input, output } from '@angular/core';
import { Product } from './menu';
import { soles } from '../order/order.service';

@Component({
  selector: 'app-product-card',
  template: `
    <article>
      <div class="photo">
        <img [src]="product().image" [alt]="product().name" width="768" height="512"
          loading="lazy" decoding="async">
        <strong class="price">{{ price(product().price_cents) }}</strong>
      </div>
      <div class="details">
        <h4>{{ product().name }}</h4>
        @if (product().description; as description) { <p>{{ description }}</p> }
        <div class="actions">
          <button type="button" (click)="added.emit(product())"
            [attr.aria-label]="'Agregar ' + product().name + ' al pedido'">
            <span aria-hidden="true">+</span> Agregar
          </button>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    article { height: 100%; display: flex; flex-direction: column; padding: 6px; background: var(--paper); border: 1px solid var(--line); border-radius: 24px; box-shadow: 0 7px 18px #5a203610; transition: box-shadow .2s, transform .2s; }
    .photo { position: relative; overflow: hidden; border-radius: 18px; background: var(--deep); }
    img { display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: contain; transition: transform .28s ease; }
    .price { position: absolute; inset: auto 10px 10px auto; background: var(--gold); color: var(--deep); border-radius: 50px; padding: 6px 11px; font-size: .98rem; font-weight: 900; box-shadow: 0 3px 9px #21081260; }
    .details { display: flex; flex-direction: column; flex: 1; padding: 13px 11px 10px; }
    h4 { margin: 0; font: 850 1.2rem/1.17 var(--sans); letter-spacing: -.038em; }
    p { margin: .35rem 0 0; color: var(--muted); font-size: .9rem; }
    .actions { margin-top: auto; padding-top: 12px; }
    button { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 45px; border: 0; border-radius: 13px; color: white; background: var(--wine); font-size: .92rem; font-weight: 780; transition: background .18s, transform .18s; }
    button:hover { background: #78142e; }
    button:active { transform: scale(.97); }
    button span { font-size: 1.25rem; line-height: 1; }
    @media (hover: hover) {
      article:hover { box-shadow: 0 16px 32px #5a203621; transform: translateY(-3px); }
      article:hover img { transform: scale(1.025); }
    }
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        :host { animation: card-entry linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
        @keyframes card-entry { from { opacity: .82; translate: 0 7px; } to { opacity: 1; translate: 0 0; } }
      }
    }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly added = output<Product>();
  readonly price = soles;
}
