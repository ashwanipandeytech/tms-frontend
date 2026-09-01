import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { LeadsComponent } from './leads/leads';
import { FollowUpsComponent } from './follow-ups/follow-ups';
import { CouponsComponent } from './coupons/coupons';
import { QuotationsComponent } from './quotations/quotations';
import { ItinerariesComponent } from './itineraries/itineraries';
import { BookingsComponent } from './bookings/bookings';
import { CustomersComponent } from './customers/customers';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { permissionGuard } from './core/guards/permission.guard';

import { LoginComponent } from './login/login';

// Scaffolded Phase 3 Modules
import { InvoicesComponent } from './invoices/invoices';
import { ExpensesComponent } from './expenses/expenses';
import { VendorPaymentsComponent } from './vendor-payments/vendor-payments';
import { HotelsComponent } from './hotels/hotels';
import { ResortsComponent } from './resorts/resorts';
import { VillasComponent } from './villas/villas';
import { DestinationsComponent } from './destinations/destinations';
import { CabBookingsComponent } from './cab-bookings/cab-bookings';
import { VehiclesComponent } from './vehicles/vehicles';
import { CabVendorsComponent } from './cab-vendors/cab-vendors';
import { UsersComponent } from './users/users';
import { RolesComponent } from './roles/roles';

import { PricingComponent } from './pricing/pricing.component';
import { CompanySetupComponent } from './onboarding/company-setup/company-setup.component';
import { SuccessComponent } from './onboarding/success/success.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'subscription', component: PricingComponent },
  { path: 'onboarding/company', component: CompanySetupComponent },
  { path: 'onboarding/success', component: SuccessComponent },
  { path: 'select-tenant', loadComponent: () => import('./select-tenant/select-tenant').then(m => m.SelectTenantComponent), canActivate: [authGuard] },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'leads', component: LeadsComponent, canActivate: [permissionGuard], data: { permissions: ['leads.view'] } },
      { path: 'follow-ups', component: FollowUpsComponent, canActivate: [permissionGuard], data: { permissions: ['followups.view'] } },
      { path: 'coupons', component: CouponsComponent, canActivate: [permissionGuard], data: { permissions: ['packages.view'] } },
      { path: 'quotations', component: QuotationsComponent, canActivate: [permissionGuard], data: { permissions: ['quotations.view'] } },
      { path: 'itineraries', component: ItinerariesComponent, canActivate: [permissionGuard], data: { permissions: ['packages.view'] } },
      { path: 'bookings', component: BookingsComponent, canActivate: [permissionGuard], data: { permissions: ['bookings.view'] } },
      { path: 'customers', component: CustomersComponent, canActivate: [permissionGuard], data: { permissions: ['leads.view'] } },
      
      // Finance
      { path: 'invoices', component: InvoicesComponent, canActivate: [permissionGuard], data: { permissions: ['invoices.view'] } },
      { path: 'expenses', component: ExpensesComponent, canActivate: [permissionGuard], data: { permissions: ['expenses.view'] } },
      { path: 'vendor-payments', component: VendorPaymentsComponent, canActivate: [permissionGuard], data: { permissions: ['payments.view'] } },
      
      // Inventory
      { path: 'hotels', component: HotelsComponent, canActivate: [permissionGuard], data: { permissions: ['hotels.view'] } },
      { path: 'resorts', component: ResortsComponent, canActivate: [permissionGuard], data: { permissions: ['resorts.view'] } },
      { path: 'villas', component: VillasComponent, canActivate: [permissionGuard], data: { permissions: ['villas.view'] } },
      { path: 'destinations', component: DestinationsComponent, canActivate: [permissionGuard], data: { permissions: ['hotels.view'] } },
      
      // Cabs
      { path: 'cab-bookings', component: CabBookingsComponent, canActivate: [permissionGuard], data: { permissions: ['cabs.view'] } },
      { path: 'vehicles', component: VehiclesComponent, canActivate: [permissionGuard], data: { permissions: ['cabs.view'] } },
      { path: 'cab-vendors', component: CabVendorsComponent, canActivate: [permissionGuard], data: { permissions: ['cabs.view'] } },
      
      // Admin
      { path: 'users', component: UsersComponent, canActivate: [permissionGuard], data: { permissions: ['staff.view'] } },
      { path: 'admin/tenants', loadComponent: () => import('./tenants/tenants').then(m => m.TenantsComponent), canActivate: [roleGuard], data: { roles: ['Super Admin'] } },
      { path: 'admin/reset', loadComponent: () => import('./reset/reset').then(m => m.ResetComponent), canActivate: [roleGuard], data: { roles: ['Super Admin'] } },
      { path: 'roles', component: RolesComponent, canActivate: [permissionGuard], data: { permissions: ['staff.view'] } },
      { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.SettingsComponent), canActivate: [permissionGuard], data: { permissions: ['settings.view'] } },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
