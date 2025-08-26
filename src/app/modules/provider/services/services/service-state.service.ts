import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, switchMap } from 'rxjs';
import { catchError, finalize, tap, map, filter, take } from 'rxjs/operators';
import { Service, Media } from '../models/service.model';
import { ServiceApiService } from './service-api';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth';
import { CloudinaryUploadService } from './cloudinary';



@Injectable({
  providedIn: 'root'
})
export class ServiceStateService {
  private readonly apiService = inject(ServiceApiService);
  private readonly toastr = inject(ToastrService);
  private readonly authService = inject(AuthService);
  private readonly cloudinaryService = inject(CloudinaryUploadService);


  // Private BehaviorSubjects to hold the state
  private readonly _services$ = new BehaviorSubject<Service[]>([]);
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  private readonly _selectedService$ = new BehaviorSubject<Service | null>(null);

  // Public Observables for components to subscribe to
  public readonly services$ = this._services$.asObservable();
  public readonly isLoading$ = this._isLoading$.asObservable();
  public readonly selectedService$ = this._selectedService$.asObservable();

  private cache = new Map<number, Service[]>();
  private currentProviderId: number | null = null;

  /**
   * Loads services for a provider. Uses cache if available, otherwise fetches from API.
   */
  loadServices(): void {    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      const providerIdStr = user?.providerId;
      if (!providerIdStr) {
        this.toastr.error('Provider ID not found. Please log in again.', 'Authentication Error');
        return;
      }
      const providerId = parseInt(providerIdStr, 10);

      if (this.currentProviderId === providerId && this.cache.has(providerId)) {
        this._services$.next(this.cache.get(providerId)!);
        return;
      }

      this.currentProviderId = providerId;
      this._isLoading$.next(true);

      this.apiService.getServices().pipe(
        tap(services => this.setServices(services)),
        catchError(error => {
          this.toastr.error('Failed to load services.', 'API Error');
          console.error('Failed to load services', error);
          return of([]); // Return an empty array on error to keep the stream alive
        }),
        finalize(() => this._isLoading$.next(false))
      ).subscribe();
    });
  }

  /**
   * Selects a single service to be viewed or edited.
   * This avoids re-fetching data if it's already in the main list.
   */
  selectService(id: number): void {
    const serviceFromCache = this._services$.getValue().find(s => s.id === id);

    // If the service is in the cache AND it has the 'media' property (i.e., it's a full object, not a summary),
    // use it. Otherwise, we must fetch the complete details from the API.
    if (serviceFromCache && Object.prototype.hasOwnProperty.call(serviceFromCache, 'media')) {
      this._selectedService$.next(serviceFromCache);
      return; // Exit early
    }

    // Fetch full details from the API
    this._isLoading$.next(true);
    this.apiService.getService(id).pipe(
      tap(fetchedService => {
        // Update our cache with the full service details, replacing the summary object if it exists.
        const currentServices = [...this._services$.getValue()];
        const serviceIndex = currentServices.findIndex(s => s.id === fetchedService.id);

        if (serviceIndex > -1) {
          // If the service is already in the list, update it.
          currentServices[serviceIndex] = fetchedService;
        } else {
          // This case is for when the service is not in the list, e.g., deep-linking.
          currentServices.push(fetchedService);
        }
        this.setServices(currentServices);
        this._selectedService$.next(fetchedService);
      }),
      catchError(err => {
        this.toastr.error('Service not found.');
        this._selectedService$.next(null);
        return throwError(() => err);
      }),
      finalize(() => this._isLoading$.next(false))
    ).subscribe();
  }

  /**
   * Centralized method to update the state and cache.
   * This ensures consistency across add, update, and delete operations.
   */
  private setServices(services: Service[]): void {
    if (this.currentProviderId) {
      this.cache.set(this.currentProviderId, services);
      this._services$.next([...services]); // Emit a new array to trigger change detection
    }
  }

  /**
   * Private helper to update a service within the local state arrays.
   * This ensures that both the main list and the selected service are kept in sync.
   * @param serviceId The ID of the service to update.
   * @param updateFn A function that receives the old service and returns the new service.
   */
  private updateServiceInState(serviceId: number, updateFn: (service: Service) => Service): void {
    const currentServices = this._services$.getValue();
    const updatedServices = currentServices.map(s => (s.id === serviceId ? updateFn(s) : s));
    this.setServices(updatedServices);

    // Also update the selected service if it's the one being modified
    const selected = this._selectedService$.getValue();
    if (selected && selected.id === serviceId) {
      const updatedService = updatedServices.find(s => s.id === serviceId);
      this._selectedService$.next(updatedService ?? null);
    }
  }


  /**
   * Creates a new service via the API and updates the local state on success.
   */
  public addService(serviceData: Partial<Service>): Observable<Service> {
    this._isLoading$.next(true);
    return this.apiService.createService(serviceData).pipe(
      tap(newService => {
        const currentServices = this._services$.getValue();
        this.setServices([...currentServices, newService]);
        this.toastr.success('Service added successfully!');
      }),
      catchError(error => {
        this.toastr.error('Failed to add service.', 'API Error');
        console.error('Failed to add service', error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }

  /**
   * Updates a service via the API and updates the local state on success.
   */
  public updateService(serviceId: number, serviceData: Partial<Service>): Observable<Service> {
    this._isLoading$.next(true);
    return this.apiService.updateService(serviceId, serviceData).pipe(
      tap(updatedService => {
        const current = this._services$.getValue();
        const updated = current.map(s => s.id === updatedService.id ? updatedService : s);
        this.setServices(updated);
        this.toastr.success('Service updated successfully!');
      }),
      catchError(error => {
        this.toastr.error('Failed to update service.', 'API Error');
        console.error('Failed to update service', error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }

  public deleteService(serviceId: number): Observable<void> {
    this._isLoading$.next(true);
    return this.apiService.deleteService(serviceId).pipe(
      tap(() => {
        const current = this._services$.getValue();
        const remaining = current.filter(s => s.id !== serviceId);
        this.setServices(remaining);
        this.toastr.success('Service deleted successfully!');
      }),
      catchError(error => {
        this.toastr.error('Failed to delete service.', 'API Error');
        console.error('Failed to delete service', error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }

  /**
   * Uploads a media file, associates it with a service, and updates the state.
   * @param serviceId The ID of the service to add media to.
   * @param file The file to upload.
   * @returns An observable of the newly created Media object.
   */
  public addMediaToService(serviceId: number, file: File): Observable<Media> {
    this._isLoading$.next(true);
    // Step 1: Upload to Cloudinary
    return this.cloudinaryService.upload(file).pipe(
      // Step 2: On successful upload, add the media URL to our backend
      switchMap(cloudinaryResponse => {
        const getMediaType = (fileType: string): 'image' | 'video' => {
          if (fileType.startsWith('image/')) return 'image';
          if (fileType.startsWith('video/')) return 'video';
          // Fallback for unknown types, or you could throw an error.
          return 'image';
        };

        const fileNameParts = file.name.split('.');
        const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()!.toLowerCase() : '';

        const mediaData = {
          url: cloudinaryResponse.secure_url,
          type: getMediaType(file.type),
          fileSize: file.size, // File size in bytes
          fileExtension: fileExtension
        };
        return this.apiService.addMedia(serviceId, mediaData);
      }),
      // Step 3: On successful backend update, update local state
      tap(newMedia => {
        this.updateServiceInState(serviceId, service => ({
          ...service,
          media: [...(service.media || []), newMedia],
        }));
        this.toastr.success('Media added successfully!');
      }),
      catchError(error => {
        this.toastr.error('Failed to add media.', 'Upload Error');
        console.error('Failed to add media', error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }

  /**
   * Deletes a media item from a service via the API and updates the local state.
   * @param serviceId The ID of the service the media belongs to.
   * @param mediaId The ID of the media to delete.
   * @returns An observable that completes on successful deletion.
   */
  public deleteMediaFromService(serviceId: number, mediaId: number): Observable<void> {
    this._isLoading$.next(true);
    return this.apiService.deleteMedia(serviceId, mediaId).pipe(
      tap(() => {
        this.updateServiceInState(serviceId, service => ({
          ...service,
          media: (service.media || []).filter(m => m.id !== mediaId),
        }));
        this.toastr.success('Media deleted successfully!');
      }),
      catchError(error => {
        this.toastr.error('Failed to delete media.', 'API Error');
        console.error('Failed to delete media', error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }

  /**
   * Clears the cache on logout or provider switch.
   */
  public clearCache(): void {
    this.currentProviderId = null;
    this.cache.clear();
    this._services$.next([]);
    this._selectedService$.next(null);
  }
}
