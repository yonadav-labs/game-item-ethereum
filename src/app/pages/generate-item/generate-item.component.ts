import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TweenMax, TweenLite, TimelineMax, RoughEase, Linear, SlowMo, Expo } from 'gsap';

@Component({
  selector: 'app-generate-item',
  templateUrl: './generate-item.component.html',
  styleUrls: ['./generate-item.component.scss']
})
export class GenerateItemComponent implements OnInit, AfterViewInit {

  vw = 0;
  vh = 450;

  appearMin = 0.3;
  appearMax = 1.8;

  delayMin = 2;
  delayMax = 6;

  durationMin = 0.3;
  durationMax = 1;

  numAnimations = 50;
  numStars = 200;

  stars = [];
  eases = [];

  textures: any;
  main: any;
  frag: any;
  coins: any;
  chests: any;
  gears: any;
  bubbles: any;
  smoke: any;
  constructor() {

  }

  ngOnInit() {
    for (let i = 0; i < this.numAnimations; i++) {
      const ease = new RoughEase({
        template:  Linear.easeInOut,
        strength: this.random(1, 3),
        points: this.random(50, 100),
        taper: 'both',
        randomize: true,
        clamp: true
      });
      this.eases.push(ease);
    }

  }

  ngAfterViewInit() {
    this.textures = window.document.querySelectorAll('.star');
    this.main = window.document.querySelector('.main-canvas');
    this.frag = window.document.createDocumentFragment();
    this.coins = window.document.getElementsByClassName('gizer-coin');
    this.chests = window.document.getElementsByClassName('chest');
    this.gears = window.document.getElementsByClassName('gear');
    this.bubbles = window.document.getElementsByClassName('bubble');
    this.smoke = window.document.querySelector('.smoke');

    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar());
    }
    this.main.appendChild(this.frag);
    TweenMax.staggerTo(this.coins, 5,  {left: '100%', ease: Expo.easeOut, repeat: -1}, .5);
    TweenMax.staggerTo(this.chests, 5,  {left: '90%', delay: 5, ease: SlowMo.ease.config(0.7, 0.7, false), repeat: -1}, 2.5);
    TweenMax.staggerTo(this.gears, 1,  {rotation: 360, ease: Linear.easeNone, repeat: -1}, 0.1);
    this.createSmoke();
  }

  createSmoke() {
    const startY = 300;
    const endY = 0;
    const tl = new TimelineMax();
    for (let i = 0; i < 10; i++) {
      const sizeIndex = parseInt(this.random(0, 2), 0);
      const bubble = this.bubbles[sizeIndex].cloneNode(true);
      const speed = 5;
      tl.set(bubble, {y: startY}, 0);
      tl.to(bubble, speed, {y: endY, x: this.random(0, 150), scale: 2, opacity: 0, repeatDelay: 0.1, repeat: 500}, Math.random() * 5);
      this.smoke.appendChild(bubble);
    }
  }

  createStar() {
    const index = parseInt(this.random(0, 5), 0);
    const star = this.textures[index].cloneNode(true);
    this.frag.appendChild(star);

    TweenLite.set(star, {
      rotation: this.random(0, 360),
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      x: this.random(0, this.vw),
      y: this.random(0, this.vh),
    });

    const tl = new TimelineMax({ repeat: -1, yoyo: true });

    for (let i = 0; i < this.numAnimations; i++) {

      const ease1 = this.eases[this.random(this.numAnimations, 0)];
      const ease2 = this.eases[this.random(this.numAnimations, 0)];

      const alpha = this.random(0.7, 1);
      const scale = this.random(0.15, 1.4);

      const appear = '+=' + this.random(this.appearMin, this.appearMax);
      const delay = '+=' + this.random(this.delayMin, this.delayMax);
      const duration1 = this.random(this.durationMin, this.durationMax);
      const duration2 = this.random(this.durationMin, this.durationMax);

      tl.to(star, duration1, { autoAlpha: alpha, scale: scale, ease: ease1 }, delay)
        .to(star, duration2, { autoAlpha: 0, scale: 0, ease: ease2 }, appear);
    }

    tl.progress(this.random(0, 1));

    return {
      element: star,
      timeline: tl
    };
  }

  random(min, max) {
    if (max == null) { max = min; min = 0; }
    if (min > max) { const tmp = min; min = max; max = tmp; }
    return min + (max - min) * Math.random();
  }
}
