import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html', /* html elements */
  styleUrls: ['./heroes.component.sass']
})
export class HeroesComponent implements OnInit {
  // heroes: Hero[] = HEROES; /* state. Only usable in templateUrl... no more locally stored data, now we're getting data from global store for the data's future updates reflecting here*/ 
  heroes: Hero[] = [];

  legendaryHero: Hero = {/* state. Only usable in templateUrl */
    id: 1,
    name: 'Windstorm'
  };

  selectedHero: Hero | undefined;

  constructor(
    private heroService: HeroService, /* enables me to use methods from these classes */
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  // getMyHeroes(): void { /* //! not go if asynchronous */
  //   this.heroes = this.heroService.getHeroes();
  // }


  onSelect(hero: Hero): void {
    this.selectedHero = hero;
    this.messageService.add(`HeroesComponent: Selected hero id=${hero.id}`);
  }

  getMyHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes);
  }

  ngOnInit() {/* on mount gets heros from global store */
    this.getMyHeroes();
  }


  goBack(): void {
    this.location.back();
  }

  add(name: string): void {
    name = name.trim();
    if (!name) return
    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => { /* if success then update locally */
        this.heroes.push(hero);
      });
  }
  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero); /* deleting locally */
    this.heroService.deleteHero(hero).subscribe(); /* req to delete in db through server. It must subscribe even though we have nothing to do with it */
  }
}