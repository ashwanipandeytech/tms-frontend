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
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'leads', component: LeadsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive'] } },
      { path: 'follow-ups', component: FollowUpsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive'] } },
      { path: 'coupons', component: CouponsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager'] } },
      { path: 'quotations', component: QuotationsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive'] } },
      { path: 'itineraries', component: ItinerariesComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive', 'Operation Team'] } },
      { path: 'bookings', component: BookingsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive', 'Operation Team', 'Accounts'] } },
      { path: 'customers', component: CustomersComponent },
      
      // Finance
      { path: 'invoices', component: InvoicesComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Accounts'] } },
      { path: 'expenses', component: ExpensesComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Accounts'] } },
      { path: 'vendor-payments', component: VendorPaymentsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Accounts'] } },
      
      // Inventory
      { path: 'hotels', component: HotelsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive', 'Operation Team'] } },
      { path: 'resorts', component: ResortsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive', 'Operation Team'] } },
      { path: 'villas', component: VillasComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive', 'Operation Team'] } },
      { path: 'destinations', component: DestinationsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Sales Executive', 'Operation Team'] } },
      
      // Cabs
      { path: 'cab-bookings', component: CabBookingsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Operation Team'] } },
      { path: 'vehicles', component: VehiclesComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Operation Team'] } },
      { path: 'cab-vendors', component: CabVendorsComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager', 'Operation Team'] } },
      
      // Admin
      { path: 'users', component: UsersComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager'] } },
      { path: 'roles', component: RolesComponent, canActivate: [roleGuard], data: { roles: ['Super Admin', 'Manager'] } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
