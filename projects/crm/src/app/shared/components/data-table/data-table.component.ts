import { Component, Input, signal, computed, TemplateRef, ContentChildren, QueryList, Directive, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Directive({
  selector: '[appColumn]',
  standalone: true
})
export class DataTableColumnDirective {
  @Input('appColumn') field: string = '';
  @Input() header: string = '';
  @Input() sortable: boolean = true;
  constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" style="min-width: 800px;">
          <thead class="bg-slate-50">
            <tr>
              @for (col of columns; track col) {
                <th
                  class="fw-semibold text-slate-500 text-uppercase py-3 ps-4 border-bottom-0"
                  style="font-size: 0.75rem; letter-spacing: 0.5px; cursor: pointer;"
                  (click)="col.sortable ? sortBy(col.field) : null">
                  <div class="d-flex align-items-center gap-1">
                    {{ col.header }}
                    @if (col.sortable) {
                      <i class="bi"
                     [ngClass]="{
                       'bi-arrow-down-short': sortField() === col.field && sortDir() === 'desc',
                       'bi-arrow-up-short': sortField() === col.field && sortDir() === 'asc',
                       'bi-arrow-down-up text-slate-300': sortField() !== col.field
                     }">
                      </i>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="border-top-0">
            @for (row of paginatedData(); track row) {
              <tr class="border-bottom border-light align-middle group">
                @for (col of columns; track col) {
                  <td class="ps-4 py-3">
                    <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row, row: row }"></ng-container>
                  </td>
                }
              </tr>
            }
            @if (paginatedData().length === 0) {
              <tr>
                <td [attr.colspan]="columns.length" class="text-center py-5 text-slate-500">
                  No data available.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    
      <!-- Pagination -->
      @if (enablePagination()) {
        <div class="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
          <span class="text-slate-500" style="font-size: 0.85rem;">
            Showing {{ math.min((currentPage() * pageSize()) + 1, data().length) }} to
            {{ math.min((currentPage() + 1) * pageSize(), data().length) }}
            of {{ data().length }} entries
          </span>
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" [class.disabled]="currentPage() === 0">
                <a class="page-link border-0 text-slate-600" href="javascript:void(0)" (click)="prevPage()">Previous</a>
              </li>
              <li class="page-item active">
                <span class="page-link border-0 rounded-2 bg-primary text-white mx-1">{{ currentPage() + 1 }}</span>
              </li>
              <li class="page-item" [class.disabled]="currentPage() >= totalPages() - 1">
                <a class="page-link border-0 text-slate-600" href="javascript:void(0)" (click)="nextPage()">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      }
    </div>
    `
})
export class DataTableComponent {
  @Input({ required: true }) set dataList(value: any[]) {
    this.data.set(value || []);
    this.currentPage.set(0); // reset page on data change
  }
  
  @Input() set pagination(value: boolean) {
    this.enablePagination.set(value);
  }

  @ContentChildren(DataTableColumnDirective) columns!: QueryList<DataTableColumnDirective>;

  data = signal<any[]>([]);
  enablePagination = signal<boolean>(true);
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  
  sortField = signal<string | null>(null);
  sortDir = signal<'asc' | 'desc'>('asc');
  
  math = Math;

  sortedData = computed(() => {
    const field = this.sortField();
    const dir = this.sortDir();
    const arr = [...this.data()];
    
    if (!field) return arr;
    
    return arr.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  paginatedData = computed(() => {
    const arr = this.sortedData();
    if (!this.enablePagination()) return arr;
    
    const start = this.currentPage() * this.pageSize();
    return arr.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.data().length / this.pageSize());
  });

  sortBy(field: string) {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
    }
  }
}
