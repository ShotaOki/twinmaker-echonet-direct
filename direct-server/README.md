# TwinMaker 向けのローカル SiteWise プロキシ

## この Python アプリの目的

ローカル環境上に SiteWise 互換のサービスを立てて、画面構造の取得は AWS 環境上で、データ取得リクエストをローカルで処理させます

※データ取得先は Echonet Lite に設定しています

## 環境設定

.env ファイルをこの README と同じディレクトリに配置します

```text
PICOGW_DOMAIN=${PicoGWのドメイン}
REGION=${AWSのリージョン}
ACCESS_KEY=${AWSの接続情報}
SECRET_ACCESS_KEY=${AWSの接続情報}
```

## 実行方法

requirements.txt の依存ファイルをインストールした後、以下のコマンドを実行します

```bash
hypercorn main:app
```
