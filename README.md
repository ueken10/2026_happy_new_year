# 2026 HAPPY NEW YEAR - Flying Logo

Three.jsとTone.jsを使った新年のフライングロゴアニメーション

## 機能

- **3Dテキスト**: TextGeometryによる"2026 HAPPY NEW YEAR"の立体テキスト
- **アニメーション**: 15秒間のループアニメーション
  - 奥（z=-100）から手前（z=10）への移動
  - X、Y、Z軸の回転
  - スケール変化
  - カラーグラデーション
- **エフェクト**:
  - パーティクル背景
  - 動的なポイントライト
  - フォグ効果
- **音楽**: Tone.jsによる新年のファンファーレ（クリックで有効化）

## 使い方

1. `index.html`をブラウザで開く
2. 画面をクリックして音声を有効化
3. 15秒のアニメーションを楽しむ（自動でループします）

## 技術仕様

- **言語**: JavaScript (ES Module)
- **ライブラリ**: 
  - Three.js v0.160.0 (CDN)
  - Tone.js v14.8.49 (CDN)
- **インポート方式**: ES Module (Import Maps)

## ファイル構成

- `index.html` - メインのHTMLファイル
- `main.js` - Three.jsとTone.jsのロジック

## ブラウザ要件

- ES Modules対応ブラウザ
- WebGL対応ブラウザ
