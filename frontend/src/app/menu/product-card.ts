import { Component, input, output } from '@angular/core';
import { Product } from './menu';
import { soles } from '../order/order.service';

@Component({
  selector: 'app-product-card',
  template: `
    <article>
      <img [src]="product().image" [alt]="product().name" width="768" height="512"
        loading="lazy" decoding="async">
      <div class="details">
        <h4>{{ product().name }}</h4>
        @if (product().description; as description) { <p>{{ description }}</p> }
        <div class="actions">
          <strong>{{ price(product().price_cents) }}</strong>
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
    article { height: 100%; display: flex; flex-direction: column; background: #fffaf2; border: 1px solid #ebddcc; border-radius: 17px; overflow: hidden; transition: box-shadow .2s, transform .2s; }
    article:hover { box-shadow: 0 12px 24px #48201314; transform: translateY(-3px); }
    img { display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: contain; background: #48221c; }
    .details { display: flex; flex-direction: column; flex: 1; padding: 17px; }
    h4 { margin: 0; font: 650 1.1rem/1.25 var(--sans); }
    p { margin: .45rem 0 0; color: var(--muted); font-size: .88rem; }
    .actions { margin-top: auto; padding-top: 1rem; display: flex; align-items: center; gap: 7px; justify-content: space-between; flex-wrap: wrap; }
    strong { color: var(--wine); font-size: 1.03rem; white-space: nowrap; }
    button { min-height: 44px; border-radius: 9px; border: 1px solid #eacfc1; color: var(--wine); background: #f9ebe1; padding: 0 10px; font-size: .84rem; font-weight: 700; }
    button:hover { color: #fffaf2; background: var(--wine); border-color: var(--wine); }
    button span { font-size: 1rem; }
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        :host { animation: card-entry linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
        @keyframes card-entry { from { opacity: .65; translate: 0 9px; } to { opacity: 1; translate: 0 0; } }
      }
    }
    @media (max-width: 520px) {
      .details { padding: 12px; }
      h4 { font-size: .97rem; }
      p { font-size: .8rem; }
      strong { font-size: .92rem; }
      button { padding-inline: 7px; }
    }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly added = output<Product>();
  readonly price = soles;
}
