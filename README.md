# twinmaker-echonet-direct

## このプロジェクトについて

このプロジェクトでは、TwinMakerの参照先をローカル環境のEchonet Liteに置き換えるソースコードを提供します。

## プロジェクトの構成

- projects/direct-server 
  SiteWise 互換のサービスをローカルで動かすためのアプリケーションです。
- projects/react-web  
  iot-app-kit の React アプリケーションです

## プロジェクトの前提

Windows での開発を想定しています。

※direct-serverの接続先はPicoGWを、Echonet Liteの環境にはMoekadenRoomを想定しています。PicoGWの動作にはUnix互換環境が必要です。

https://github.com/KAIT-HEMS/node-picogw

https://github.com/SonyCSL/MoekadenRoom

利用規約の事情から、MMD モデル、モーションは git の管理対象に含めていません。  
プロジェクトを clone された方が、正規の方法で MMD モデルをダウンロードして利用していただきますよう、お願いいたします。

## セットアップ

認証情報、接続先情報の設定のため、各プロジェクトに.env ファイルが必要です。

設定する内容は projects 以下の各フォルダにある README を確認してください。

## ライセンス

ライセンスは MIT です。
