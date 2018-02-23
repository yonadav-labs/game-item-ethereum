import { Component, OnInit } from '@angular/core';
import { ChestService } from '../../shared/services/ChestService/chest.service';
import { Chest } from '../../shared/models/chest.model';

@Component({
  selector: 'app-open-treasure',
  templateUrl: './open-treasure.component.html',
  styleUrls: ['./open-treasure.component.scss']
})
export class OpenTreasureComponent implements OnInit {
  chest: Chest;
  constructor(
    private chestService: ChestService
  ) { }

  ngOnInit() {
    const cid = 'eeeceb748b383a08a398e260d4a34b91';
    this.chestService.getChest(cid).subscribe(cId => {
      this.chestService.getChestDataFromID(cId).subscribe(c => {
        this.chest = c;
      });
    });
  }

}
