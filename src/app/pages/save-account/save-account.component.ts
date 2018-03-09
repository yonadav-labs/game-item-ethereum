import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MetaMaskService } from '../../shared/services/MetaMaskService/meta-mask.service';
import { UserService } from '../../shared/services/UserService/user.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../store/application-state';
import { Observable } from 'rxjs/Observable';
import { UserState } from '../../store/store-data';
import { UPDATE_NICK_NAME, UPDATE_SIGNUP } from '../../store/actions/user.actions';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-save-account',
  templateUrl: './save-account.component.html',
  styleUrls: ['./save-account.component.scss']
})
export class SaveAccountComponent implements OnInit {

  userState: Observable<UserState>;
  accountInfo: FormGroup;
  walletAddress: String = '';
  email: String = '';
  isEmailed: Boolean = true;
  isValidEmail: Boolean = true;
  // tslint:disable-next-line:max-line-length
  emailValidationExpression: any = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  nickName: String = '';
  isNotSaving = false;
  isSaving = false;
  loaded = false;
  saveNikNameStr = 'nickName';
  saveWalletStr = 'walletAddress';
  saveUserIDStr = 'user_id';
  strRootURL = '/';

  constructor(
    private fb: FormBuilder,
    private localStorage: LocalStorageService,
    private router: Router,
    private authService: AuthService,
    private metaMaskService: MetaMaskService,
    private store: Store<ApplicationState>,
    private userService: UserService,
    meta: Meta,
    title: Title
  ) {
    this.userState = this.store.select('userState');
    this.createForm();
    title.setTitle('Save Account | Gizer Token Sale');
   }


  ngOnInit() {
    this.metaMaskService.getAccountInfo();

    this.userState.subscribe(state => {
      if (state) {
        if (!state.unlocked) {
          this.navigateToMetaMask();
        }
        setTimeout(() => {
          const userId = this.localStorage.retrieve(this.saveUserIDStr);
          if (userId) {
            this.navigateToHome();
          }
        }, 500);
        if (this.walletAddress !== state.walletAddress) {
          this.walletAddress = state.walletAddress;
          this.accountInfo.setValue({
            walletAddress: this.walletAddress,
            email: this.email,
            nickName: this.nickName
          });
          this.loaded = true;
        }
      }
    });
  }

  createForm() {
    this.accountInfo = this.fb.group({
      walletAddress: [{value: this.walletAddress, disabled: true}],
      email: [this.email, Validators.required ],
      nickName: this.nickName,
    });
  }

  onSaveInfo() {
    if (this.email === '' ) {
      this.isEmailed = false;
      return;
    }

    if (!this.emailValidationExpression.test(this.email.toLowerCase())) {
      this.isValidEmail = false;
      return;
    }

    this.isEmailed = true;
    this.isValidEmail = true;
    this.isSaving = true;

    setTimeout(() => {
      this.isNotSaving = true;
    }, 6000);

    setTimeout(() => {
      this.metaMaskService.SignInTransaction()
      .then(result => {
        const data = {
          'nick': this.nickName,
          'email': this.email,
          'type': 'user',
          'gzr': {
              'type': 'wallet',
              'id': result['account']
          }
        };
        setTimeout(() => {
          this.metaMaskService.getAccountInfo();
          this.localStorage.store(this.saveNikNameStr, this.nickName);
          this.localStorage.store(this.saveWalletStr, this.walletAddress);
        }, 500);
        this.userService.registerUser(data)
        .subscribe(() => {
          this.userService.retrieveUser(this.walletAddress).subscribe(user => {
            const currentUser = user[0];
            if (user.length > 0) {
              const {nick, email, id} = currentUser;
              const metadata = {
                created_date: Math.ceil((new Date(currentUser.created_at)).getTime() / 1000),
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
              this.localStorage.store(this.saveUserIDStr, id);
              this.authService.login(this.walletAddress);
              this.UpdateNickNameAndSignup(nick);
              this.updateUser(nick, email, id, customData);
              this.eventTrack('registered-metamask', metadata);
              this.router.navigate([this.strRootURL]);
            }
          });
        }, error => {
          const customData = {
            registered_metamask: false,
            gzr_balance: 0,
            items_owned: 0,
            nickname: '',
            'wallet-id': this.walletAddress
          };

          this.updateUser(this.nickName, this.email, this.walletAddress , customData);
        });
      })
      .catch(error => {

      });
    }, 3000);
  }

  UpdateNickNameAndSignup(data) {
    this.store.dispatch({type: UPDATE_NICK_NAME, payload: data});
    this.store.dispatch({type: UPDATE_SIGNUP, payload: true});
  }

  navigateToMetaMask() {
    this.router.navigate(['/meta-mask']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
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

  eventTrack(event, metadata) {
    if (!(metadata)) {
      (<any>window).Intercom('trackEvent', event);
    } else {
      (<any>window).Intercom('trackEvent', event, metadata);
    }
    return true;
  }
}
