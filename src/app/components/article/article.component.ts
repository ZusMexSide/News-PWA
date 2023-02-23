import { Component, OnInit, Input } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { ActionSheetController } from '@ionic/angular';
import { Article } from '../../interfaces/index';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements OnInit {

  @Input() article!: Article;
  @Input() index!: number;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private storageService: StorageService
  ) { }

  ngOnInit() {}

  openArticle() {
    Browser.open({ url: this.article.url });
    // window.open(this.article.url, '_blank');
  }

  async onOpenMenu() {
    const articleInFavorites = this.storageService.articleInFavorites( this.article );
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Options',
      buttons: [
        {
          text: 'Share',
          icon: 'share-outline',
          handler: () => this.onShareArticle(),
        },
        {
          text: articleInFavorites ? 'Remove favorite' : 'Favorite',
          icon: articleInFavorites? 'heart' : 'heart-outline',
          handler: () => this.onToggleFavorite(),
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async onShareArticle() {
    const value = await Share.canShare()
    console.log(value);
    if ( value ) {
      await Share.share({
       title: this.article.title,
       text: this.article.source.name,
       url: this.article.url,
       dialogTitle: 'Share with buddies',
     });
    }
  }

  onToggleFavorite() {
    this.storageService.saveRemoveArticles( this.article );
  }

}
