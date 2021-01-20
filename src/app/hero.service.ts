import { Injectable } from '@angular/core';
import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';


// this is like the redux store 

@Injectable({ providedIn: 'root' })
export class HeroService {

  constructor(
    private http: HttpClient, /* for fetching */
    private messageService: MessageService /* This is a typical "service-in-service" scenario. */
  ) { }

  /** Log a HeroService message with the MessageService */
  private heroesUrl = 'api/heroes';  // URL to web api
  private log(message: string) { /* // shortend it  */
    this.messageService.add(`HeroService: ${message}`);
  }

  // getHeroes(): Hero[] { /* // not go if asynchronous */
  //   return HEROES;
  // }
  getHeroes(): Observable<Hero[]> { /* // good for asynchronous */
    // TODO: send the message _after_ fetching the heroes
    this.log('fetched heroes')
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
    // return of(HEROES); /* replaced static data with the fetching data */
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead // TODO: send the error to remote logging infrastructure
      this.log(`${operation} failed: ${error.message}`); // TODO: better job of transforming error for user consumption
      return of(result as T); // Let the app keep running by returning an empty result.
    };
  }

  getHero(id: number): Observable<Hero | undefined> {
    // TODO: send the message _after_ fetching the hero
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
    // this.log(`fetched hero id=${id}`)
    // return of(HEROES.find(hero => hero.id === id));
  }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;
    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) return of([]); // if not search term, return empty hero array.
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
        this.log(`found heroes matching "${term}"`) :
        this.log(`no heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

}
