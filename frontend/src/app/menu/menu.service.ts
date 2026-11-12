import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { Menu } from './menu';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  load() {
    return this.http.get<Menu>('/api/menu').pipe(timeout(10000));
  }
}
