import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import {MyWatchlistComponent} from './pages/my-watchlist/my-watchlist.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'movies', redirectTo: '' },
  { path: 'watchlist', component: MyWatchlistComponent, data: { status: 'planned' } },
  { path: 'watched', component: MyWatchlistComponent, data: { status: 'watched' } },
  { path: 'my-watchlist', redirectTo: 'watchlist' },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' },
];
