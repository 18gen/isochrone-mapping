<div align="center">

# 🚗🚶‍♂️🚃 面マップ（アイソクロン）  

**Isochrone Mapping – Time-Based Accessibility**
<br />
<sub>
  <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Mapbox-blueviolet?style=flat-square&logo=mapbox" />
</sub>

🚀 <b>[デモはこちら！](https://isochrone-mapping.vercel.app/)</b>
</div>
<img width="1010" height="676" alt="Screenshot" src="resource/doc/demo.png" />
</div>

---

## 概要: 「今ここから、**何分以内**にどこまで行ける？」  
**面マップ・Isochrone Mapping**は、出発地点から“○分以内に到達できるエリア”を直感的にマップ上へ描画するWebツールです。

> **Isochrone（アイソクロン）とは？**  
> 出発点から一定時間以内で到達できる範囲を示す線・面のこと。  
> 例：**「駅から徒歩15分圏」「車で30分圏内」** など。

MapboxやOpenRouteServiceのAPIを使い、**交通手段**（車・徒歩・公共交通）ごとに最適な到達圏を**ワンクリックで表示**できます。
重ね合わせもOK！

---

## 主な機能

- 🔎 **住所検索・地図クリック**で出発地点指定
- 🚶‍♂️🚗 **徒歩・車**の切り替え（🚃公共交通機関は開発中）
- ⏱️ **5～60分**の任意時間で到達圏生成
- 🎨 **色分け＆アイコン付き**で複数表示
- ❌ **ワンクリック削除 & 一括クリア**

---

## セットアップ

### 1. リポジトリをクローン
```
git clone git@github.com:18gen/isochrone-mapping.git
cd isochrone-mapping
```

### 2. 依存パッケージのインストール
```
npm install
```

### 3. **APIキーの取得 & 設定**
- [Mapbox公式サイト](https://account.mapbox.com/) でAPIトークンを発行
- [OpenRouteService公式サイト](https://openrouteservice.org/sign-up/) でAPIキーを取得

プロジェクト直下に `.env.local` を作成し、以下を記入
```
NEXT_PUBLIC_MAPBOX_TOKEN=あなたのMapboxトークン
MAPBOX_ACCESS_TOKEN=あなたのMapboxトークン（同上）
OPENROUTE_SERVICE_KEY=あなたのOpenRouteServiceキー
```
### 4. **アプリの起動**
```bash
npm run dev
```
`http://localhost:3000` にアクセス

---

## 技術スタック

- Next.js (App Router)
- React 18
- TypeScript
- Mapbox GL JS
- Tailwind CSS
- Mapbox Isochrone API
- OpenRouteService Isochrone API

---

## 注意事項

- MapboxトークンやOpenRouteServiceキーは公開リポジトリで**絶対に公開しない**でください
- 商用利用の場合は各APIの利用規約を必ずご確認ください
