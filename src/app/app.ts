import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Footer } from "./layout/footer/footer";
import { SidebarComponent } from "./layout/sidebar/sidebar";
import { Header } from "./layout/header/header";
import { LoginComponent } from './auth/login/login';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'  // Just for initial routing
  ,
  imports: [RouterModule]
})
export class AppComponent {}
