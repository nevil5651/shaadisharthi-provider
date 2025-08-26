import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Service } from '../../models/service.model';
import { ServiceStateService } from '../../services/service-state.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-list.html',
  styleUrls: ['./service-list.scss'],
})
export class ServiceListComponent implements OnInit {
  
  // Public observables for the template to bind to
  public readonly services$: Observable<Service[]>;
  public readonly isLoading$: Observable<boolean>;
  
  

  constructor(
    private serviceState: ServiceStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize observables from the state service
    this.services$ = this.serviceState.services$;
    this.isLoading$ = this.serviceState.isLoading$;
  }

  ngOnInit(): void {
    // Trigger the load. The component doesn't manage the state,
    // it just initiates actions and consumes observables.
    this.serviceState.loadServices();
  }

  editService(serviceId: number): void {
    // Set the selected service in the state so the edit component can easily access it.
    this.serviceState.selectService(serviceId);
    // Programmatic navigation to the edit page
    this.router.navigate(['./edit', serviceId], { relativeTo: this.route });
  }
}
