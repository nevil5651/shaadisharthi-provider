import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Media, Service } from '../../models/service.model';
import { ServiceStateService } from '../../services/service-state.service';

@Component({
  selector: 'app-view-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-service.html',
  styleUrls: ['./view-service.scss']
})
export class ViewServiceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly serviceState = inject(ServiceStateService);

  public readonly service$: Observable<Service | null>;
  public readonly isLoading$: Observable<boolean>;

  constructor() {
    this.service$ = this.serviceState.selectedService$;
    this.isLoading$ = this.serviceState.isLoading$;
  }

  ngOnInit(): void {
    // Using the observable paramMap is more robust than the snapshot.
    this.route.paramMap.pipe(tap(params => {
      const id = params.get('id');
      if (id) this.serviceState.selectService(parseInt(id, 10));
    })).subscribe();
  }

  public getMediaByType(media: Media[] | undefined | null, type: 'image' | 'video'): Media[] {
    if (!media) {
      return [];
    }
    return media.filter(m => m.type.toLowerCase() === type);
  }
}
