import { Component, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CompanyService, Company } from '../core/services/company.service';
import { DataTableComponent, DataTableColumnDirective } from '../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, DataTableComponent, DataTableColumnDirective, DatePipe],
  templateUrl: './companies.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesComponent implements OnInit {
  companies = signal<Company[]>([]);
  isLoading = signal<boolean>(true);
  expandedCompanyId = signal<number | null>(null);

  constructor(private companyService: CompanyService) {}

  ngOnInit() {
    this.fetchCompanies();
  }

  fetchCompanies() {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.companies.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleExpand(companyId: number) {
    if (this.expandedCompanyId() === companyId) {
      this.expandedCompanyId.set(null);
    } else {
      this.expandedCompanyId.set(companyId);
    }
  }
}
