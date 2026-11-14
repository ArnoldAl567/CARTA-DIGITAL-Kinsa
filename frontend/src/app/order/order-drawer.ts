import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Fulfillment, OrderLine, OrderService, soles } from './order.service';

@Component({
  selector: 'app-order-drawer',
  imports: [FormsModule],
  templateUrl: './order-drawer.html',
  styleUrl: './order-drawer.css',
})
export class OrderDrawer {
  readonly lines = input.required<OrderLine[]>();
  readonly total = input.required<number>();
  readonly changed = output<{ slug: string; delta: number }>();
  readonly removed = output<string>();
  private readonly order = inject(OrderService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('drawer');

  readonly price = soles;
  method: Fulfillment['kind'] = 'pickup';
  name = '';
  phone = '';
  phoneTouched = false;
  address = '';
  reference = '';
  notes = '';

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  get validPhone(): boolean {
    return /^\d{9}$/.test(this.phone);
  }

  updatePhone(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '');
    if (digits.length <= 9) this.phone = digits;
    if (input.value !== this.phone) input.value = this.phone;
  }

  get checkoutUrl(): string | null {
    if (!this.lines().length || !this.name.trim() || !this.validPhone) return null;

    const fulfillment: Fulfillment = this.method === 'delivery'
      ? { kind: 'delivery', address: this.address, reference: this.reference }
      : { kind: 'pickup' };
    if (fulfillment.kind === 'delivery' && (!fulfillment.address.trim() || !fulfillment.reference.trim())) {
      return null;
    }

    return this.order.whatsappUrl(this.lines(), {
      name: this.name,
      phone: this.phone,
      fulfillment,
      notes: this.notes,
    });
  }
}
