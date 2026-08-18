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

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'leads', component: LeadsComponent },
      { path: 'follow-ups', component: FollowUpsComponent },
      { path: 'coupons', component: CouponsComponent },
      { path: 'quotations', component: QuotationsComponent },
      { path: 'itineraries', component: ItinerariesComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'customers', component: CustomersComponent },
      
      // Finance
      { path: 'invoices', component: InvoicesComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'vendor-payments', component: VendorPaymentsComponent },
      
      // Inventory
      { path: 'hotels', component: HotelsComponent },
      { path: 'resorts', component: ResortsComponent },
      { path: 'villas', component: VillasComponent },
      { path: 'destinations', component: DestinationsComponent },
      
      // Cabs
      { path: 'cab-bookings', component: CabBookingsComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'cab-vendors', component: CabVendorsComponent },
      
      // Admin
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
