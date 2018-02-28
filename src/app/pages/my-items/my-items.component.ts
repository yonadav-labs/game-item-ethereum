import { Component, OnInit, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ItemService } from '../../shared/services/ItemService/item.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ApplicationState } from '../../store/application-state';
import { UserState } from '../../store/store-data';
import { MetaMaskService } from '../../shared/services/MetaMaskService/meta-mask.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AuthService } from '../../core/services/auth.service';
import { LockedModalComponent } from '../../shared/components/locked-modal/locked-modal.component';

const unityProgress = UnityProgress;
const unityLoader = UnityLoader;

declare const $: any;

@Component({
  selector: 'app-my-items',
  templateUrl: './my-items.component.html',
  styleUrls: ['./my-items.component.scss']
})
export class MyItemsComponent implements OnInit {
  projectURL = './../../../assets/externals/unity-player/Build/Project.json';
  container = 'gameContainer';
  isMobile = false;
  gameInstance: any;
  unityPlayer: any = '';
  userState: Observable<UserState>;
  bsModalRef: BsModalRef;
  unlocked = true;

  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };

  constructor(
    private itemService: ItemService,
    private domSanitizer: DomSanitizer,
    private metaMaskService: MetaMaskService,
    private authService: AuthService,
    private router: Router,
    private modalService: BsModalService,
    private store: Store<ApplicationState>
  ) {
    this.userState = this.store.select('userState');
    this.metaMaskService.getAccountInfo();
    this.userState.subscribe(state => {
      if (state.installed === false) {
        this.router.navigate(['/meta-mask']);
      }
      if (this.authService.checkLogin()) {
        this.unlocked = state.unlocked;
        this.showModals();
      }
    });
  }

  ngOnInit() {
    this.isMobile = this.isMobileView();
    this.gameInstance = UnityLoader.instantiate(this.container, this.projectURL, {onProgress: unityProgress});
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

  showModals() {
    if (this.unlocked === false && !this.bsModalRef) {
      this.bsModalRef = this.modalService.show(LockedModalComponent,
        Object.assign({}, this.config, { class: 'gray modal-lg modal-center' }));
    }
  }
}
