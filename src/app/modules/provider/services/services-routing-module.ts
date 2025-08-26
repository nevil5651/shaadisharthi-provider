import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddServiceComponent as AddService } from './components/add-service/add-service';
import { EditService } from './components/edit-service/edit-service';
import { ServiceListComponent as ServiceList } from './components/service-list/service-list';
import { ViewServiceComponent as ViewService } from './components/view-service/view-service';

const routes: Routes = [
  { path: '', component: ServiceList, title: 'My Services' },
  { path: 'add', component: AddService, title: 'Add New Service' },
  { path: 'view/:id', component: ViewService, title: 'View Service' },
  { path: 'edit/:id', component: EditService, title: 'Edit Service' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesRoutingModule {}

