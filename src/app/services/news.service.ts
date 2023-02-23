import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Article, NewsResponse, ArticlesByCategoryAndPage } from '../interfaces';
import { map, Observable, of } from 'rxjs';
import { storedArticlesByCategory } from '../data/mock-news';

const apiKey = environment.apiKey;
const apiUrl = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private articlesByCategoryAndPage: ArticlesByCategoryAndPage = storedArticlesByCategory as ArticlesByCategoryAndPage;

  constructor( private http: HttpClient ) { }

  private executeQuery<T>( endpoint: string ) {
    console.log('inicia http request');
    return this.http.get<T>( `${ apiUrl }${ endpoint }`, {
      params:{
        apiKey,
        country: 'us'
      }
    })
  }

  getTopHeadlines(): Observable<Article[]> {
    return this.getTopHeadlinesByCategory('business');
  }

  getTopHeadlinesByCategory( category: string, loadMore: boolean = false ): Observable<Article[]> {
    // This line was set up due to problems with the free access API.
    return of( this.articlesByCategoryAndPage[ category ].articles );

    if ( loadMore ) return this.getArticleByCategory( category );

    if ( this.articlesByCategoryAndPage[ category ] ) return of( this.articlesByCategoryAndPage[ category ].articles );

    return this.getArticleByCategory( category );
  }

  private getArticleByCategory( category: string):Observable<Article[]> {
    if ( Object.keys( this.articlesByCategoryAndPage ).includes( category ) ) {

    } else {
      this.articlesByCategoryAndPage[ category ] = {
        page: 0,
        articles: []
      }
    }

    const page = this.articlesByCategoryAndPage[ category ].page + 1;

    return this.executeQuery<NewsResponse>(`top-headlines?category=${ category }&page=${ page }`)
    .pipe(
      map( ({ articles }) => {

        if ( articles.length === 0 ) return this.articlesByCategoryAndPage[ category ].articles;

        this.articlesByCategoryAndPage[ category ] = {
          page,
          articles: this.articlesByCategoryAndPage[ category ].articles.concat( articles )
        }
        return this.articlesByCategoryAndPage[ category ].articles;
      })
    );
  }
}
