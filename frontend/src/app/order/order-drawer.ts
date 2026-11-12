import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderLine, OrderService, soles } from './order.service';

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
  name = '';
  notes = '';

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  get checkoutUrl(): string {
    return this.order.whatsappUrl(this.lines(), this.name, this.notes);
  }
}
