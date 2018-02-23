import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiRoutingService {
  private baseUrl = environment.BASE_API_URL;

  constructor() {}

  getItemsUrl() {
    return this.baseUrl + '/item';
  }

  getItemsUrl_ID(ids) {
    let url = this.baseUrl + '/item?limit=0';
    for (const id of ids) {
      url += '&list[]=' + id;
    }

    return url;
  }

  getItemUrl(id) {
    return this.baseUrl + '/item/' + id;
  }

  saveTxUrl(id) {
    return this.baseUrl + '/user/' + id + '/transactions';
  }

  getMetaCoinUrl() {
    return '/contracts/MetaCoin.json';
  }

  getChestUrl(id) {
    return this.baseUrl + '/chest/' + id;
  }

  getChestDataFromID(id) {
    return '../../../assets/chest.json';
  }

  getUsersUrl() {
    return this.baseUrl + '/user';
  }

  loadUnityPlayerUrl() {
    return this.baseUrl + '/unity';
  }
}
