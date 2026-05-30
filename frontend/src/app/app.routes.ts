import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MyOverviewComponent } from './pages/my-overview/my-overview.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'movies', redirectTo: '' },
  { path: 'my-overview', component: MyOverviewComponent },
  { path: 'watchlist', redirectTo: 'my-overview' },
  { path: 'watched', redirectTo: 'my-overview' },
  { path: 'my-watchlist', redirectTo: 'my-overview' },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' },
];
