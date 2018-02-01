import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../store/application-state';
import { UserState } from '../../store/store-data';

declare const $: any;

@Component({
  selector: 'app-meta-mask',
  templateUrl: './meta-mask.component.html',
  styleUrls: ['./meta-mask.component.scss']
})

export class MetaMaskComponent implements OnInit {

  private isMobile = false;
  userState: Observable<UserState>;
  installed = true;
  unlocked = true;

  constructor(
    private router: Router,
    private store: Store<ApplicationState>,
  ) {
    this.userState = this.store.select('userState');
   }

  ngOnInit() {
    this.isMobile = this.isMobileView();
    this.userState.subscribe(state => {
      if (state) {
        this.installed = state.installed;
        this.unlocked = state.unlocked;
        if (this.installed && this.unlocked) {
          this.navigateToSaveAccount();
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
     this.isMobile = this.isMobileView();
  }

  isMobileView() {
    if ($(window).width() > 425) {
        return false;
    }
    return true;
  }

  navigateToSaveAccount() {
    this.router.navigate(['/save-account']);
  }

  navigateToFAQ() {
    this.router.navigate(['/faq']);
  }
}
