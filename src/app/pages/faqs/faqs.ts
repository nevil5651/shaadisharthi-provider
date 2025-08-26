import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Faq, FaqQuery, FaqService } from '../../core/services/faq';
import { Observable, EMPTY } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './faqs.html',
  styleUrls: ['./faqs.scss'],
})
export class FaqsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private faqService = inject(FaqService);
  private toastr = inject(ToastrService);

  faqs$: Observable<Faq[]> = EMPTY;
  isSubmitting = false;
  isModalOpen = false;

  // Initialize the form directly for better type inference and to avoid definite assignment assertions.
  queryForm: FormGroup = this.fb.group({
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  // Add getters for easy access to form controls in the template.
  // This avoids using `queryForm.get('subject')` in the HTML.
  get subject(): AbstractControl | null {
    return this.queryForm.get('subject');
  }

  get message(): AbstractControl | null {
    return this.queryForm.get('message');
  }

  ngOnInit(): void {
    // This line is required for the FAQ list in your HTML to display questions.
    
  }

  /**
   * This function is called when the form is submitted.
   * It handles validation and calls the service to send the data to your API.
   */
  submitQuery(): void {
    // Mark all fields as touched to trigger validation messages in the template.
    this.queryForm.markAllAsTouched();

    if (this.queryForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Trim values before sending to the API for better data integrity.
    const formValue: FaqQuery = {
      subject: this.queryForm.value.subject.trim(),
      message: this.queryForm.value.message.trim(),
    };

    this.faqService.addQuery(formValue)
      .pipe(
        take(1), // Ensure the subscription automatically completes after one emission.
        tap(() => {
          this.toastr.success('Your query has been submitted successfully!');
          this.closeModal();
        }),
        finalize(() => this.isSubmitting = false) // Guarantees this runs on success, error, or completion.
      )
      .subscribe({
        error: (err) => {
          this.toastr.error('Failed to submit your query. Please try again.', 'API Error');
          console.error('Error submitting query:', err);
        },
      });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.queryForm.reset(); // Reset form state when closing the modal.
  }
}
