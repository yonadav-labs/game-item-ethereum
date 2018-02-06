import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { MetaMaskService } from '../../shared/services/MetaMaskService/meta-mask.service';
// tslint:disable-next-line:max-line-length
import { UPDATE_WALLET_ADDRESS, UPDATE_LOCK_STATUS, UPDATE_GZR_BALANCE, UPDATE_BALANCE, UPDATE_INSTALL_STATUS, UPDATE_TRANSACTION_ID } from './../../store/actions/user.actions';
import { ApplicationState } from '../../store/application-state';
import { UserState } from '../../store/store-data';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  userState: Observable<UserState>;
  installed = true;
  unlocked = false;
  walletAddress: String;
  balance: number;
  gzrBalance: number;
  transactionId: String;

  constructor(
    private metaMaskService: MetaMaskService,
    private store: Store<ApplicationState>,
  ) {
    this.userState = this.store.select('userState');
  }

  ngOnInit() {
    this.metaMaskService.getAccountInfo();

    this.userState.subscribe(state => {
      if (state) {
        this.installed = state.installed;
        this.unlocked = state.unlocked;
        this.walletAddress = state.walletAddress;
        this.balance = state.balance;
        this.gzrBalance = state.gzrBalance;
      }
    });
    this.metaMaskService.installedObservable$.subscribe(status => {
      if (!status) {
        this.updateInstallStatus(status);
        this.metaMaskService.unloadAccountInfo();
      }
      if (this.installed !== status) {
          this.updateInstallStatus(status);
      }
    });
    this.metaMaskService.unlockedObservable$.subscribe(status => {
      if (this.unlocked !== status) {
        this.updateLockStatus(status);
      }
    });
    this.metaMaskService.accountObservable$.subscribe(res => {
      if (this.walletAddress !== res) {
        this.updateWalletAddress(res);
      }
    });
    this.metaMaskService.balanceObservable$.subscribe(res => {
      if (this.balance !== res) {
        this.updateBalance(res);
      }
    });

    this.metaMaskService.gzrBalanceObservable$.subscribe(res => {
      if (this.gzrBalance !== res) {
        this.updateGZRBalance(res);
      }
    });

    this.metaMaskService.transactionIdObservable$.subscribe(transactionId => {
      if (this.transactionId !== transactionId) {
        this.updateTransactionId(transactionId);
      }
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


  onDeactivate() {
    window.scrollTo(0, 0);
  }
}
