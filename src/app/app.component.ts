import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as Jimp from 'jimp';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  title = 'staff-card';

  /** アップロードファイルデータ */
  imageChangedEvent: any = '';

  /** キャッシュする画像 */
  cacheImage: any = '';

  /** 処理完了画像 */
  croppedImage: any = '';

  /** バックグラウンド画像 */
  backgroundImage = null;

  /** バックグラウンド画像(幅) */
  backgroundImageWidth = 676;

  /** バックグラウンド画像(高さ) */
  backgroundImageHeight = 1046;

  /** ラウンドマスク */
  roundMask = null;

  /** ラウンドマスク */
  myFont = null;

  /** 名前 */
  nameInput = '';

  /** 部門 */
  partsmentInput = '';

  /** 役職 */
  jobInput = '';

  /** 【姓名】字体 */
  nameFontSize = 56;
  nameFontHeight = 580;

  /** 【部门】字体 */
  partsmentFontSize = 56;
  partsmentFontHeight = 650;

  /** 【职务】字体 */
  jobFontSize = 56;
  jobFontHeight = 720;

  /**
   * ライフスタイル
   */
  ngAfterViewInit(): void {
  }

  /**
   * ライフスタイル
   */
  ngOnDestroy(): void {
    this.backgroundImage = null;
    this.roundMask = null;
    this.myFont = null;
  }

  /**
   * アップロードファイルを変更するイベント
   * @param event イベント
   */
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    const fileName = event.target.files[0].name.split('.')[0];
    if (fileName.indexOf('+') < 0 && fileName.indexOf('-') < 0 && fileName.indexOf('_') < 0) {
      const tempArr1 = fileName.split(/ /);
      if (tempArr1.length > 3) {
        this.nameInput = tempArr1[0] + ' ' + tempArr1[1];
        this.partsmentInput = tempArr1[2];
        this.jobInput = tempArr1[3];
      } else if (tempArr1.length === 3) {
        this.nameInput = tempArr1[0] + ' ' + tempArr1[1];
        this.partsmentInput = tempArr1[2];
      } else {
        this.nameInput = tempArr1[0];
      }
    } else {
      const tempArr2 = fileName.split(/-|_| \+ |\+/);
      if (tempArr2.length >= 3) {
        this.nameInput = tempArr2[0];
        this.partsmentInput = tempArr2[1];
        this.jobInput = tempArr2[2];
      } else if (tempArr2.length === 2) {
        this.nameInput = tempArr2[0];
        this.partsmentInput = tempArr2[1];
      } else {
        this.nameInput = tempArr2[0];
      }
    }
  }

  /**
   * フォントの幅を計算する
   * @param font フォント
   * @param text テキスト
   */
  private measureText(font: any, text: any) {
    let x = 0;
    for (let i = 0; i < text.length; i++) {
      if (font.chars[text[i]]) {
        x += font.chars[text[i]].xoffset
          + (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]] ? font.kernings[text[i]][text[i + 1]] : 0)
          + (font.chars[text[i]].xadvance || 0);
      }
    }
    return x;
  }

  /**
   * 画像のテキストをリフレッシュする
   */
  onRefreshPhotoText() {
    if (this.cacheImage) {
      this.onImageCropped(this.cacheImage);
    } else {
      window.alert('请您先选择您要上传的图像');
    }
  }

  /**
   * 処理完了
   * @param event イベント
   */
  onImageCropped(event: ImageCroppedEvent) {
    // 先ずは、画像をキャッシュすること
    this.cacheImage = event;

    // 画像を読み込む
    // read template
    Promise.all(
      [Jimp.read('assets/staffCard.png'), Jimp.read('assets/roundMask.png')]
    )
      .then(images => {
        // アバター画像を組み合わせる
        // combine logo into image

        const backgroundImg = images[0];
        const mask = images[1];

        return Jimp.read(new Buffer(event.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
          .then(myAvatar => {
            return backgroundImg.composite(
              // アバターは丸いので、マスクを応用されていること
              myAvatar.mask(mask.resize(360, Jimp.AUTO), 0, 0),
              150,
              200);
          });
      })
      .then(background => {
        return Jimp.loadFont('assets/fonts/font-' + this.nameFontSize + '.fnt').then(font => {
          // テキストを書き込む
          return background.print( // 名前
            font,
            Math.floor((this.backgroundImageWidth - this.measureText(font, this.nameInput)) / 2) + 10,
            this.nameFontHeight,
            this.nameInput
          );
        });
      })
      .then(background => {
        return Jimp.loadFont('assets/fonts/font-' + this.partsmentFontSize + '.fnt').then(font => {
          // テキストを書き込む
          return background.print( // 部門
            font,
            Math.floor((this.backgroundImageWidth - this.measureText(font, this.partsmentInput)) / 2) + 10,
            this.partsmentFontHeight,
            this.partsmentInput
          );
        });
      })
      .then(background => {
        return Jimp.loadFont('assets/fonts/font-' + this.jobFontSize + '.fnt').then(font => {
          // テキストを書き込む
          return background.print( // 役職
            font,
            Math.floor((this.backgroundImageWidth - this.measureText(font, this.jobInput)) / 2) + 10,
            this.jobFontHeight,
            this.jobInput
          );
        });
      })
      .then(background => {
        // 画像をエクスポートする
        // export image
        background.getBase64(Jimp.MIME_PNG, (err, res) => {
          this.croppedImage = res;
        });
      })
      .catch(err => {
        // エラー処理をする
        // catch errors
        console.error(err);
        window.alert('oops! Something wrong! \n' + err);
      });
  }

  /**
   * エラー処理をする
   */
  loadImageFailed() {
    window.alert('oops! The image loads failed!');
  }

  onChangeNameFontSize(fontSize: any) {
    this.nameFontSize = fontSize.value;
  }
  onChangeNameFontHeight(fontSize: any) {
    this.nameFontHeight = fontSize.value;
  }
  onPartsmentFontSize(fontSize: any) {
    this.partsmentFontSize = fontSize.value;
  }
  onChangePartsmentFontHeight(fontSize: any) {
    this.partsmentFontHeight = fontSize.value;
  }
  onChangeJonFontSize(fontSize: any) {
    this.jobFontSize = fontSize.value;
  }
  onChangeJobFontHeight(fontSize: any) {
    this.jobFontHeight = fontSize.value;
  }

}
