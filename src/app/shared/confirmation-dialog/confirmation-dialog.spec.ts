import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDialogComponent } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ // Changed from ConfirmationDialog to ConfirmationDialogComponent
      imports: [ConfirmationDialogComponent]
    })
    .compileComponents(); // Changed from ConfirmationDialog to ConfirmationDialogComponent

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
