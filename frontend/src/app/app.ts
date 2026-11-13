import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category, Product } from './menu/menu';
import { MenuService } from './menu/menu.service';
import { ProductCard } from './menu/product-card';
import { OrderDrawer } from './order/order-drawer';
import { OrderService, soles, WHATSAPP } from './order/order.service';
import { SiteFooter } from './site-footer';

function searchable(value: string): string {
  return value.toLocaleLowerCase('es-PE').normalize('NFD').replace(/\p{M}/gu, '').trim();
}

@Component({
  selector: 'app-root',
  imports: [ProductCard, OrderDrawer, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly menu = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);
  readonly order = inject(OrderService);
  readonly price = soles;
  readonly whatsapp = WHATSAPP;
  readonly coverSources = '/images/portada/pareja-joven-768.webp 768w, /images/portada/pareja-joven-1536.webp 1536w';
  readonly coverFallback = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly category = signal('');
  readonly query = signal('');
  readonly notice = signal('');
  private noticeTimer?: ReturnType<typeof setTimeout>;

  readonly products = computed(() => this.categories().flatMap((category) => category.products));
  readonly visible = computed(() => {
    const search = searchable(this.query());
    const selected = this.category();
    return this.categories()
      .filter((category) => !selected || category.slug === selected)
      .map((category) => ({
        ...category,
        products: category.products.filter((product) =>
          searchable(`${product.name} ${product.description ?? ''} ${category.name}`).includes(search),
        ),
      }))
      .filter((category) => category.products.length);
  });
  readonly lines = computed(() => this.order.lines(this.products()));
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly total = computed(() => this.lines().reduce((sum, line) => sum + line.subtotal, 0));

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => clearTimeout(this.noticeTimer));
  }

  load(): void {
    this.status.set('loading');
    this.menu.load().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ categories }) => {
        this.categories.set(categories);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  add(product: Product): void {
    const added = this.order.change(product.slug, 1);
    this.notice.set(added ? `${product.name} agregado al pedido` : 'Llegaste al límite de unidades de este producto');
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => this.notice.set(''), 2300);
  }

  clearFilters(): void {
    this.category.set('');
    this.query.set('');
  }

}
