import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular';

@Component({
  selector: 'Item',
  moduleId: module.id,
  templateUrl: './item.component.html',
})
export class ItemComponent implements OnInit {

  public string = 'Not clicked';
  public count = 0;
  public  category = '';

  public myItems = [];

  constructor(private params: ModalDialogParams) {
    console.log('got category ' + params.context.category);
    this.category = params.context.category;
    this.myItems = [this.getSampleImage(), this.getSampleImage(), this.getSampleImage()];
  }

  ngOnInit() {
    setInterval(() => {
      this.count += Math.round(Math.random() * 10);
    }, 3000);
  }

  onTap() {
    this.myItems.splice(0);
  }

  loadMoreItems() {
    this.myItems.push(this.getSampleImage());
  }

  getSampleImage() {
    return {src: 'https://lorempixel.com/800/600/' + this.category + '/' + Math.round(Math.random() * 10) + '/'};
  }

  isActive() {
    console.log('ItemComponent isactive called');
  }
}
