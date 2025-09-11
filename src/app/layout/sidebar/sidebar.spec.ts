import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar';

describe('Sidebar', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ // Changed from Sidebar to SidebarComponent
      imports: [SidebarComponent]
    })
    .compileComponents(); // Changed from Sidebar to SidebarComponent

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
