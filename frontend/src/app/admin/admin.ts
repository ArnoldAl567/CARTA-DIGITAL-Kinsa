import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../menu/menu';
import { soles } from '../order/order.service';

interface AdminProduct extends Product {
  id: number;
  category_id: number;
  available: boolean;
}

interface Catalog {
  limit: number;
  categories: { id: number; name: string; short_name: string }[];
  products: AdminProduct[];
}

interface Draft {
  id?: number;
  name: string;
  categoryId: number;
  description: string;
  price: number | null;
  available: boolean;
  image?: string;
}

const API = '/api/administrar';
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private photo?: File;

  readonly account = signal<string | null>(null);
  readonly catalog = signal<Catalog | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly saved = signal('');
  readonly search = signal('');
  readonly draft = signal<Draft | null>(null);
  readonly preview = signal('');
  readonly photoError = signal('');
  readonly price = soles;

  readonly count = computed(() => this.catalog()?.products.length ?? 0);
  readonly active = computed(() => this.catalog()?.products.filter((product) => product.available).length ?? 0);
  readonly filtered = computed(() => {
    const query = this.normalize(this.search());
    return this.catalog()?.products.filter((product) => this.normalize(product.name).includes(query)) ?? [];
  });

  constructor() {
    this.restoreSession();
    this.destroyRef.onDestroy(() => this.clearPhoto());
  }

  restoreSession(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<{ email: string | null }>(API + '/sesion').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ email }) => {
        this.account.set(email);
        if (email) this.loadCatalog();
        else this.loading.set(false);
      },
      error: (error) => this.fail(error),
    });
  }

  login(form: NgForm): void {
    if (form.invalid || this.busy()) return;

    this.busy.set(true);
    this.error.set('');
    this.http.post<{ email: string }>(API + '/sesion', form.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ email }) => {
        form.resetForm();
        this.account.set(email);
        this.busy.set(false);
        this.loadCatalog();
      },
      error: (error) => this.fail(error),
    });
  }

  logout(): void {
    this.busy.set(true);
    this.http.delete(API + '/sesion').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.resetAccount();
        this.error.set('');
        this.busy.set(false);
      },
      error: (error) => this.fail(error),
    });
  }

  loadCatalog(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<Catalog>(API + '/platos').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (catalog) => {
        this.catalog.set(catalog);
        this.loading.set(false);
      },
      error: (error) => this.fail(error),
    });
  }

  edit(product?: AdminProduct): void {
    this.error.set('');
    this.saved.set('');
    this.clearPhoto();
    this.draft.set({
      id: product?.id,
      name: product?.name ?? '',
      categoryId: product?.category_id ?? this.catalog()?.categories[0]?.id ?? 0,
      description: product?.description ?? '',
      price: product ? product.price_cents / 100 : null,
      available: product?.available ?? true,
      image: product?.image,
    });
    requestAnimationFrame(() => document.getElementById('nombre-plato')?.focus());
  }

  cancel(): void {
    this.draft.set(null);
    this.clearPhoto();
    this.error.set('');
  }

  selectPhoto(input: HTMLInputElement): void {
    this.clearPhoto();
    const photo = input.files?.[0];
    if (!photo) return;

    if (!PHOTO_TYPES.includes(photo.type) || photo.size > 2 * 1024 * 1024) {
      this.photoError.set('Elige una foto JPG, PNG o WebP de hasta 2 MB.');
      input.value = '';
      return;
    }

    this.photo = photo;
    this.preview.set(URL.createObjectURL(photo));
  }

  save(form: NgForm): void {
    const draft = this.draft();
    if (!draft || draft.price === null || form.invalid || this.busy() || this.photoError()) return;
    const cents = draft.price * 100;
    if (Math.abs(cents - Math.round(cents)) > 0.000001) {
      this.error.set('Usa hasta dos decimales en el precio.');
      return;
    }
    if (!draft.id && !this.photo) {
      this.photoError.set('Agrega una foto del plato.');
      return;
    }

    const body = new FormData();
    body.set('name', draft.name.trim());
    body.set('category_id', String(draft.categoryId));
    body.set('description', draft.description.trim());
    body.set('price_cents', String(Math.round(cents)));
    body.set('available', draft.available ? '1' : '0');
    if (this.photo) body.set('photo', this.photo);
    if (draft.id) body.set('_method', 'PATCH');

    this.busy.set(true);
    this.error.set('');
    const path = draft.id ? API + '/platos/' + draft.id : API + '/platos';
    this.http.post<AdminProduct>(path, body).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ name }) => {
        this.cancel();
        this.saved.set(`${name} se guardó en la carta.`);
        this.busy.set(false);
        this.loadCatalog();
      },
      error: (error) => this.fail(error),
    });
  }

  categoryName(id: number): string {
    return this.catalog()?.categories.find((category) => category.id === id)?.short_name ?? '';
  }

  private clearPhoto(): void {
    if (this.preview()) URL.revokeObjectURL(this.preview());
    this.photo = undefined;
    this.preview.set('');
    this.photoError.set('');
  }

  private resetAccount(): void {
    this.account.set(null);
    this.catalog.set(null);
    this.search.set('');
    this.saved.set('');
    this.cancel();
  }

  private fail(error: HttpErrorResponse): void {
    this.busy.set(false);
    this.loading.set(false);
    if (error.status === 401 || error.status === 419) {
      this.resetAccount();
      this.restoreSession();
      this.error.set('Tu sesión se renovó. Vuelve a intentar la operación.');
      return;
    }
    if (error.status === 429) {
      this.error.set('Demasiados intentos. Espera un minuto y vuelve a intentarlo.');
      return;
    }
    const message = error.status === 422 ? error.error?.message : null;
    this.error.set(typeof message === 'string' ? message : 'No se pudo conectar con el panel. Vuelve a intentarlo.');
  }

  private normalize(value: string): string {
    return value.toLocaleLowerCase('es-PE').normalize('NFD').replace(/\p{M}/gu, '').trim();
  }
}
