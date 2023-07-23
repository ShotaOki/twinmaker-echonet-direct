from pydantic import BaseModel
from typing import List

class HistoryInput(BaseModel):
    """
    リクエストとして受け取るPOST Bodyのデータ構造
    """
    componentName:str
    endTime: str
    entityId: str
    orderByTime: str
    selectedProperties: List[str]
    startTime: str

class DirectAccessParameter(BaseModel):
    """
    リクエストのうち、必要なパラメータを抽出したもの
    """
    workspace_id: str
    component_name: str
    entity_id: str
    property_name: str

def create_history_record(workspace_id: str, item: HistoryInput, read_history_data):
    """
    過去の履歴データを取得、TwinMaker向けの形式に変換する
    """
    return {
        'propertyValues': [
            {
                "entityPropertyReference": {
                    "componentName": item.componentName,
                    "entityId": item.entityId,
                    "propertyName": property
                },
                "values": read_history_data(DirectAccessParameter(
                    workspace_id=workspace_id, 
                    component_name=item.componentName, 
                    entity_id=item.entityId, 
                    property_name=property)
                )
            }
            for property in item.selectedProperties
        ]
    }