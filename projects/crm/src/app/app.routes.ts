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

import { LoginComponent } from './login/login';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'leads', component: LeadsComponent },
      { path: 'follow-ups', component: FollowUpsComponent },
      { path: 'coupons', component: CouponsComponent },
      { path: 'quotations', component: QuotationsComponent },
      { path: 'itineraries', component: ItinerariesComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'customers', component: CustomersComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
