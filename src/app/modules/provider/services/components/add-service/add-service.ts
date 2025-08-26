import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ServiceStateService } from '../../services/service-state.service';
import { CloudinaryUploadService, CloudinaryUploadResponse } from '../../services/cloudinary';

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-service.html',
  styleUrls: ['./add-service.scss']
})
export class AddServiceComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly serviceState = inject(ServiceStateService);
  private readonly toastr = inject(ToastrService);
  private readonly cloudinaryService = inject(CloudinaryUploadService);

  public serviceForm!: FormGroup;
  public isSubmitting = false;
  public isUploading = false;

  constructor() {}

  ngOnInit(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: [null, [Validators.required, Validators.min(0)]],
      media: this.fb.array([]) // FormArray to hold media objects
    });
  }

  get media(): FormArray {
    return this.serviceForm.get('media') as FormArray;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    // Basic validation for file type and size
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.toastr.error('Only image and video files are allowed.');
        return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.toastr.error('File size cannot exceed 10MB.');
        return;
    }

    this.isUploading = true;
    this.cloudinaryService.upload(file)
      .pipe(finalize(() => {
        this.isUploading = false;
        input.value = ''; // Reset file input to allow selecting the same file again
      }))
      .subscribe({
        next: (response: CloudinaryUploadResponse) => {
          this.addMediaControl(response, file);
          this.toastr.success('Media uploaded. Click "Save Service" to confirm.');
        },
        error: (err) => {
          this.toastr.error('Media upload failed. Please try again.', 'Upload Error');
          console.error('Cloudinary upload error:', err);
        }
      });
  }

  private addMediaControl(response: CloudinaryUploadResponse, file: File): void {
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';
    const fileExtension = file.name.split('.').pop() || '';
    // Storing file size in MB, consistent with your previous Java implementation.
    const fileSizeInMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));

    const mediaGroup = this.fb.group({
      url: [response.secure_url, Validators.required],
      type: [resourceType, Validators.required],
      fileSize: [fileSizeInMB],
      fileExtension: [fileExtension]
    });
    this.media.push(mediaGroup);
  }

  removeMedia(index: number): void {
    this.media.removeAt(index);
    this.toastr.info('Media removed from the form.');
  }

  onSubmit(): void {
    this.serviceForm.markAllAsTouched();
    if (this.serviceForm.invalid) {
      this.toastr.error('Please correct the errors in the form before submitting.');
      return;
    }

    this.isSubmitting = true;
    this.serviceState.addService(this.serviceForm.value).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.router.navigate(['/services']);
      },
      // Error is already handled by the state service, just need to log it here if desired.
      error: (err) => console.error('Failed to create service', err)
    });
  }
}
