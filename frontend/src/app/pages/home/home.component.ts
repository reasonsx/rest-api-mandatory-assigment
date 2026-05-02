import { Component } from '@angular/core';
import { MoviesComponent } from '../movies/movies.component';
import {NavbarComponent} from '../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, MoviesComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
