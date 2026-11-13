import { Component } from '@angular/core';
import { WHATSAPP } from './order/order.service';

@Component({
  selector: 'app-site-footer',
  template: `
    <footer>
      <div class="shell">
        <div class="footer-main">
          <a href="#inicio" class="identity" aria-label="Kinsa T’iqsi, volver al inicio">
            <img src="/images/logo.webp" alt="" width="72" height="72" loading="lazy">
            <span><strong>Kinsa T’iqsi</strong><em>Sabor que viene de familia.</em></span>
          </a>

          <a [href]="whatsapp" target="_blank" rel="noopener noreferrer" class="contact">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" aria-hidden="true">
              <path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.6a8.5 8.5 0 1 1 16.1-4.2Z"/>
              <path d="M9 8.2c-.5.2-.9.7-.8 1.4.3 2.4 2.5 4.6 4.9 5 .7.1 1.4-.3 1.6-.9l.2-.6-2-1.1-.7.8a5.3 5.3 0 0 1-2.1-2.1l.7-.7-1-2-.8.2Z"/>
            </svg>
            <span><strong>Pedir por WhatsApp</strong><small>+51 963 157 142</small></span>
            <span class="arrow" aria-hidden="true">↗</span>
          </a>
        </div>

        <nav class="footer-nav" aria-label="Enlaces al pie de página">
          <a href="#carta">Ver la carta</a>
          <a href="#inicio">Volver arriba <span aria-hidden="true">↑</span></a>
        </nav>
      </div>
    </footer>
  `,
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  readonly whatsapp = WHATSAPP;
}
