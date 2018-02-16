import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared';
import { LayoutComponent } from './pages/layout';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './pages/home/home.module#HomeModule',
      },
      {
        path: 'buy-gzr',
        loadChildren: './pages/buy-gzr/buy-gzr.module#BuyGzrModule',
      },
      {
        path: 'meta-mask',
        loadChildren: './pages/meta-mask/meta-mask.module#MetaMaskModule',
      },
      {
        path: 'open-treasure',
        loadChildren: './pages/open-treasure/open-treasure.module#OpenTreasureModule',
      },
      {
        path: 'save-account',
        loadChildren: './pages/save-account/save-account.module#SaveAccountModule',
      },
      {
        path: 'faq',
        loadChildren: './pages/faq/faq.module#FaqModule',
      },
      {
        path: 'team',
        loadChildren: './pages/team/team.module#TeamModule',
      },
      {
        path: 'item-detail',
        loadChildren: './pages/item-detail/item-detail.module#ItemDetailModule',
      },
      {
        path: 'item-detail/:id',
        loadChildren: './pages/item-detail/item-detail.module#ItemDetailModule',
      },
      {
        path: 'my-items',
        loadChildren: './pages/my-items/my-items.module#MyItemsModule',
      },
      {
        path: 'generate-item',
        loadChildren: './pages/generate-item/generate-item.module#GenerateItemModule',
      },
      {
        path: 'terms-and-conditions',
        loadChildren: './pages/terms-and-conditions/terms-and-conditions.module#TermsAndConditionsModule',
      },
      {
        path: 'partners',
        loadChildren: './pages/partners/partners.module#PartnersModule',
      },
      {
        path: 'press',
        loadChildren: './pages/press/press.module#PressModule',
      },
      {
        path: 'privacy-policy',
        loadChildren: './pages/privacy-policy/privacy-policy.module#PrivacyPolicyModule',
      },
      {
        path: 'thank-you',
        loadChildren: './pages/thank-you/thank-you.module#ThankYouModule',
      }
    ]
  },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
