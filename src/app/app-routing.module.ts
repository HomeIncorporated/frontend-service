import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: '/user-mgmt/login', pathMatch: 'full'},
	{path: 'user-mgmt', loadChildren:'./user-mgmt/user-mgmt.module#UserMgmtModule'},
	{path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule'},
	{path: 'catalogue', loadChildren:'./catalogue/catalogue.module#CatalogueModule'},
	{path: 'simple-search', loadChildren:'./simple-search/simple-search.module#SimpleSearchModule'},
    {path: 'explore-search', loadChildren:'./explorative-search/explorative-search.module#ExplorativeSearchModule'},
	{path: 'bpe', loadChildren: './bpe/bpe.module#BPEModule'},
	{path: 'data-channel', loadChildren: './data-channel/data-channel.module#DataChannelModule'},
	{path: 'tnt', loadChildren: './tnt/tnt.module#TnTModule'},
	{path: 'product-details', loadChildren: './product-details/product-details.module#ProductDetailsModule'},
	{path: 'analytics', loadChildren: './analytics/analytics.module#AnalyticsModule'},
	{path: 'qualiexplore', loadChildren: './qualiexplore/qualiexplore.module#QualiExploreModule'},
  {path: 'legislation', loadChildren: './legislation/legislation.module#LegislationModule'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})

export class AppRoutingModule {}
