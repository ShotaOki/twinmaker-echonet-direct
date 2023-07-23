from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
from src.proxy import ApiProxy, AwsAccessInfo
from src.history import create_history_record, HistoryInput, DirectAccessParameter
from pydantic_settings import BaseSettings
import requests
from datetime import datetime
from dotenv import load_dotenv

# 環境変数をENVから読み込む
load_dotenv()

# CORSの設定をする
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

class PicogwInfo(BaseSettings):
    """
    PicoGWを参照する
    """
    picogw_domain: str

picogw_info = PicogwInfo()
def read_history_data(parameter: DirectAccessParameter):
    """
    履歴データをローカルから取得する
    """
    # 接続情報を指定する
    device_name = "temperaturesensor_1"
    property_name = "temperaturemeasurementvalue"
    # PicoGWにリクエストを投げる
    response = requests.get(f"{picogw_info.picogw_domain}/v1/echonet/{device_name}/{property_name}")
    # 結果を取得する
    value = [v.get("value", 0.0) for v in response.json().values()][0]
    return [{
        "time": datetime.now().isoformat(),
        "value": {
            "doubleValue": value
        }
    }]

@app.post("/workspaces/{workspace_id}/entity-properties/history")
async def history(workspace_id: str, item: HistoryInput):
    """
    TwinMakerの履歴データを取得する
    """
    return create_history_record(workspace_id, item, read_history_data)

api_proxy = ApiProxy()
@app.get("/{path:path}")
async def proxy(request: Request):
    """
    TwinMakerのAPIリクエストを参照する
    """
    return api_proxy.request_api(request, AwsAccessInfo())
