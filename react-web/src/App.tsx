import "./App.css";
import { initialize } from "@iot-app-kit/source-iottwinmaker";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import { useStore } from "@iot-app-kit/scene-composer/dist/src/store";
import { useEffect, useMemo, useState } from "react";
import {
  SceneController,
  SceneControllerState,
} from "./twinmaker-extra/SceneController";
import {
  replaceTagToButton,
  replaceTagToText,
} from "./twinmaker-extra/ComponentController";
import { generateUUID } from "three/src/math/MathUtils";
import * as THREE from "three";

function App() {
  // TwinMakerのシーンを読み込む
  const twinmaker = initialize(process.env.REACT_APP_AWS_WORKSPACE_NAME ?? "", {
    awsCredentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY ?? "",
    },
    awsRegion: process.env.REACT_APP_AWS_REGION ?? "",
  });
  // 画面情報を読み込む
  const sceneLoader = twinmaker.s3SceneLoader(
    process.env.REACT_APP_AWS_SCENE_NAME ?? ""
  );
  // 任意のコンポーザーID: SceneComposerに対して固定値を指定する
  const composerId = useMemo(() => generateUUID(), []);
  // TwinMaker（クラウド側）の画面構成情報を参照する(※nodeMap＝S3にあるJsonデータのこと)
  const nodeMap = useStore(composerId)((state) => state.document.nodeMap);
  // Jsonのタグ情報に紐づいた3Dオブジェクトを参照する
  const getObject3DBySceneNodeRef = useStore(composerId)(
    (state) => state.getObject3DBySceneNodeRef
  );
  // データ参照変数を取る
  const { dataInput, dataBindingTemplate, getSceneRuleMapById } = useStore(
    composerId
  )((state) => state);

  let wallText = "待機";

  /** 状態の管理フラグ */
  let [initializedFlag, setInitializedFlag] = useState(
    SceneControllerState.Initialize
  );
  /** TwinMakerをカスタマイズするコントローラー */
  const controller = useMemo(
    () =>
      new SceneController(composerId, {
        /** TwinMakerのタグを上書きする */
        overrideTags(rootScene) {
          return {
            // TwinMakerのタグをボタンに置き換える
            TVButton: (ref, anchor) =>
              replaceTagToButton(ref, anchor, getObject3DBySceneNodeRef)
                ?.create({
                  rootScene, // ルートになるシーン
                  angle: 90, // オプション: MMDの角度(単位はDegree)
                  content: "閉じる",
                  width: 0.7,
                  height: 0.24,
                  stateStyle: {
                    hovered: {
                      backgroundColor: new THREE.Color(0x999999),
                      fontColor: new THREE.Color(0xffffff),
                    },
                    idle: {
                      backgroundColor: new THREE.Color(0x666666),
                      fontColor: new THREE.Color(0xffffff),
                    },
                    selected: {
                      backgroundColor: new THREE.Color(0x777777),
                      fontColor: new THREE.Color(0x222222),
                    },
                  },
                })
                .onClickEvent(() => {
                  console.log("clicked: 閉じる");
                  wallText = "クリックされた閉じる";
                  fetch(
                    "http://192.168.0.3:8080/v1/echonet/electricblindsunshade_1/openingandclosingoperationsetting",
                    {
                      method: "PUT",
                      body: JSON.stringify({ value: "close" }),
                      headers: { "Content-Type": "application/json" },
                    }
                  ).then(() => {});
                }),
            // TwinMakerのタグをボタンに置き換える
            WallButton: (ref, anchor) =>
              replaceTagToButton(ref, anchor, getObject3DBySceneNodeRef)
                ?.create({
                  rootScene, // ルートになるシーン
                  angle: 270,
                  content: "次へ",
                  width: 0.7,
                  height: 0.24,
                  stateStyle: {
                    hovered: {
                      backgroundColor: new THREE.Color(0x999999),
                      fontColor: new THREE.Color(0xffffff),
                    },
                    idle: {
                      backgroundColor: new THREE.Color(0x666666),
                      fontColor: new THREE.Color(0xffffff),
                    },
                    selected: {
                      backgroundColor: new THREE.Color(0x777777),
                      fontColor: new THREE.Color(0x222222),
                    },
                  },
                })
                .onClickEvent(() => {
                  console.log("clicked: 次へ");
                  wallText = "クリックされた次へ";
                }),
            // TwinMakerのタグをボタンに置き換える
            Timer: (ref, anchor) =>
              replaceTagToText(ref, anchor, getObject3DBySceneNodeRef)
                ?.create({
                  rootScene, // ルートになるシーン
                  angle: 0,
                  content: "時間",
                })
                .onAnimating((text) => {
                  (text as any).set({
                    content:
                      new Date().toISOString().split(".")[0] + "\n" + wallText,
                  });
                }),
          };
        },
      }),
    [composerId, getObject3DBySceneNodeRef]
  );

  // nodeMapの更新まではフックできるが、r3fの初期化はフックできない
  // そのため、nodeMap更新からタイマーで500msごとに更新完了を監視する
  useEffect(() => {
    /** 500msごとに状態を監視する */
    const timer = setInterval(() => {
      /** 500msごとに状態を更新する */
      setInitializedFlag(
        controller.exec(initializedFlag, nodeMap, getObject3DBySceneNodeRef)
      );
      controller.execData(dataInput, dataBindingTemplate, getSceneRuleMapById);
    }, 500);
    // useEffectのデストラクタ
    return () => {
      clearInterval(timer);
    };
  }, [
    nodeMap,
    getObject3DBySceneNodeRef,
    initializedFlag,
    controller,
    dataInput,
    dataBindingTemplate,
    getSceneRuleMapById,
  ]);

  return (
    <div className="App">
      <SceneViewer
        sceneComposerId={composerId}
        sceneLoader={sceneLoader}
        activeCamera="Camera1"
      />
    </div>
  );
}

export default App;
