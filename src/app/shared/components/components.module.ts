import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderModule } from './header/header.module';
import { HeroSliderModule } from './hero-slider/hero-slider.module';
import { ItemModule } from './item/item.module';
import { ItemListModule } from './item-list/item-list.module';
import { WelcomeModule } from './welcome/welcome.module';
import { GzrTokenModule } from './gzr-token/gzr-token.module';
import { PartnersListModule } from './partners-list/partners-list.module';
import { FooterModule } from './footer/footer.module';
import { GuideAccordionModule } from './guide-accordion/guide-accordion.module';
import { InstallMetaModule } from './install-meta/install-meta.module';
import { LockedMetaModule } from './locked-meta/locked-meta.module';
import { TreasureModule } from './treasure/treasure.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HeaderModule,
    HeroSliderModule,
    ItemListModule,
    WelcomeModule,
    GzrTokenModule,
    PartnersListModule,
    FooterModule,
    GuideAccordionModule,
    InstallMetaModule,
    LockedMetaModule,
    TreasureModule,
    ItemModule,
  ],
  declarations: [],
  exports: [
    HeaderModule,
    HeroSliderModule,
    ItemListModule,
    WelcomeModule,
    GzrTokenModule,
    PartnersListModule,
    FooterModule,
    GuideAccordionModule,
    InstallMetaModule,
    LockedMetaModule,
    TreasureModule,
    ItemModule,
  ]
})
export class ComponentsModule { }
