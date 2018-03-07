import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ValidNetworkModalComponent } from '../../shared/components/valid-network/valid-network.component';
import { LocalStorageService } from 'ngx-webstorage';
import { NgSpinningPreloader } from 'ng2-spinning-preloader';
import { Intercom } from 'ng-intercom';

import { MetaMaskService } from '../../shared/services/MetaMaskService/meta-mask.service';
import { UserService } from '../../shared/services/UserService/user.service';
// tslint:disable-next-line:max-line-length
import { UPDATE_VALID_NETWORK, UPDATE_WALLET_ADDRESS, UPDATE_LOCK_STATUS, UPDATE_GZR_BALANCE, UPDATE_BALANCE, UPDATE_INSTALL_STATUS, UPDATE_TRANSACTION_ID, UPDATE_NICK_NAME } from './../../store/actions/user.actions';
import { ApplicationState } from '../../store/application-state';
import { UserState } from '../../store/store-data';
import { User } from '../../shared/models/user.model';
import { NotificationsService } from 'angular2-notifications-lite';
import { environment } from '../../../environments/environment.prod';
import { UserLocalstorageRepository } from '../../shared/services/UserService/user.localstorage.repository.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  userState: Observable<UserState>;
  installed = true;
  unlocked = false;
  walletAddress: String;
  balance: number;
  gzrBalance: number;
  transactionId: String;
  nickName: String;
  validNetwork = false;

  options = {
      position: ['top', 'right'],
      timeOut: 2000,
      lastOnBottom: true
  };

  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };

  bsModalRef: BsModalRef;
  nickNameStr = 'nickName';
  walletStr = 'walletAddress';

  event$: Subject<any> = new Subject<any>();

  constructor(
    public intercom: Intercom,
    private metaMaskService: MetaMaskService,
    private userService: UserService,
    private store: Store<ApplicationState>,
    private notificationService: NotificationsService,
    private modalService: BsModalService,
    private ngSpinningPreloader: NgSpinningPreloader,
    private userLocalstorageRepository: UserLocalstorageRepository
  ) {
    this.userState = this.store.select('userState');
  }

  ngOnInit() {
    this.initIntercom();
    this.metaMaskService.getAccountInfo();
    this.userState.subscribe(state => {
      if (state) {
        this.event$.next(state);
      }
    });
    this.metaMaskService.installedObservable$.subscribe(status => {
      this.stopPreloading();
      if (!status) {
        this.updateInstallStatus(status);
        this.metaMaskService.unloadAccountInfo();
      }
      if (this.installed !== status) {
          this.updateInstallStatus(status);
      }
    });
    this.metaMaskService.unlockedObservable$.subscribe(status => {
      this.stopPreloading();
      if (this.unlocked !== status) {
        this.updateLockStatus(status);
      }
    });
    this.metaMaskService.accountObservable$.subscribe(res => {
      this.stopPreloading();
      if (this.walletAddress !== res) {
        this.updateWalletAddress(res);
        this.userService.retrieveUser(res).subscribe(user => {
          const currentUser = user[0];
          if (user.length) {
            const {nick, email, id} = currentUser;
            this.userLocalstorageRepository.setUserId(id);
            const metadata = {
              created_at: Math.ceil((new Date(currentUser.created_at)).getTime() / 1000),
            };

            let purchased_gzr = false,
                total_gzr_purchased = 0,
                total_ether_spent = 0,
                opened_treasure = false,
                last_purchased_at = 0,
                last_opened_treasure_at = 0;

            if (currentUser.transactions.length > 0) {
              purchased_gzr = true;

              currentUser.transactions.map(tx => {
                total_gzr_purchased += tx.gzr;
                total_ether_spent += tx.eth;
              });
              const lastTx = currentUser.transactions.slice(-1).pop();
              last_purchased_at = Math.ceil((new Date(lastTx['confirmed_at'])).getTime() / 1000);
            }

            if (currentUser.owns.length > 0) {
              opened_treasure = true;
              last_opened_treasure_at = 0;
            }

            const customData =  {
              registered_metamask: true,
              registered_metamask_at: Math.ceil((new Date(currentUser.created_at)).getTime() / 1000),
              gzr_balance: currentUser.gzr.amount || 0,
              items_owned: currentUser.owns.length,
              nickname: nick,
              'wallet-id': id,
              opened_treasure: opened_treasure,
              purchased_gzr: purchased_gzr,
              total_gzr_purchased: total_gzr_purchased,
              total_ether_spent: total_ether_spent,
              last_purchased_at: last_purchased_at
            };

            if (last_purchased_at !== 0) {
              customData['last_purchased_at'] = last_purchased_at;
            }

            this.updateNickName(nick);
            this.updateUser(nick, email, id, customData);
          } else {
            const customData = {
              registered_metamask: false
            };
            this.updateUser('', '', '', customData);
          }
        });
      }
    });
    this.metaMaskService.balanceObservable$.subscribe(res => {
      if (this.balance !== res) {
        this.updateBalance(res);
      }
    });

    this.metaMaskService.gzrBalanceObservable$.subscribe(res => {
      if (this.gzrBalance !== res) {
        const customData =  {
          gzr_balance: res || 0
        };
        this.updateGZRBalance(res);
        this.updateCustomData(customData);
      }
    });

    this.metaMaskService.transactionIdObservable$.subscribe(transactionId => {
      if (this.transactionId !== transactionId) {
        this.updateTransactionId(transactionId);
      }
    });

    this.metaMaskService.validNetworkObservable$.subscribe(status => {
      if (this.validNetwork !== status) {
        this.updateNetworkStatus(status);
      }
    });

    this.metaMaskService.signTransactionPendingObservable$.subscribe(signTransaction => {
      this.notificationService.success(
          'Sign To GZR',
          'You are signing to gzr token',
          {
              timeOut: 3000,
              showProgressBar: true,
              pauseOnHover: false,
              clickToClose: false,
              maxLength: 10
          }
      );
    });

    this.event$.subscribe((state) => {
      this.installed = state.installed;
      this.unlocked = state.unlocked;
      this.walletAddress = state.walletAddress;
      this.balance = state.balance;
      this.gzrBalance = state.gzrBalance;
      this.nickName = state.nickName;
      this.validNetwork = state.validNetwork;
    });
  }

  ngAfterViewInit() {
    this.userService.retrieveUser(this.walletAddress).subscribe(user => {
      this.updateNickName(user.nick);
    });
  }

  updateInstallStatus(data) {
    this.store.dispatch({type: UPDATE_INSTALL_STATUS, payload: data});
  }

  updateLockStatus(data) {
    this.store.dispatch({type: UPDATE_LOCK_STATUS, payload: data});
  }

  updateWalletAddress(data) {
    this.store.dispatch({type: UPDATE_WALLET_ADDRESS, payload: data});
  }

  updateBalance(data) {
    this.store.dispatch({type: UPDATE_BALANCE, payload: data});
  }

  updateGZRBalance(data) {
    this.store.dispatch({type: UPDATE_GZR_BALANCE, payload: data});
  }


  updateTransactionId(data) {
    this.store.dispatch({type: UPDATE_TRANSACTION_ID, payload: data});
  }

  updateNickName(data) {
    this.store.dispatch({type: UPDATE_NICK_NAME, payload: data});
  }

  updateNetworkStatus(data) {
    this.store.dispatch({type: UPDATE_VALID_NETWORK, payload: data});
  }

  onDeactivate() {
    window.scrollTo(0, 0);
  }

  initIntercom() {
    (<any>window).Intercom('boot', {
      app_id: environment.INTERCOM_APP_ID,
    });
  }

  updateUser(name, email, userId, customData) {
    (<any>window).Intercom('update', {
        name: name,
        email: email,
        user_id: userId,
        created_at: Math.ceil((new Date()).getTime() / 1000),
        custom_data: customData
    });
    return true;
  }

  updateCustomData(customData) {
    (<any>window).Intercom('update', {
        custom_data: customData
    });
    return true;
  }

  stopPreloading() {
    this.ngSpinningPreloader.stop();
  }

}
