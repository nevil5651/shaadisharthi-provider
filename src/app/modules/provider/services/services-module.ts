import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ServicesRoutingModule } from './services-routing-module';
import { AddServiceComponent as AddService } from './components/add-service/add-service';
import { EditService } from './components/edit-service/edit-service';
import { ServiceListComponent as ServiceList } from './components/service-list/service-list';
import { ViewServiceComponent as ViewService } from './components/view-service/view-service';

@NgModule({
  imports: [
    CommonModule,
    ServicesRoutingModule,
    ReactiveFormsModule,
    ServiceList,
    AddService,
    EditService,
    ViewService,
  ],
})
export class ServicesModule {}
