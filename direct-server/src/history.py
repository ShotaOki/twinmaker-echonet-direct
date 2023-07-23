from pydantic import BaseModel
from typing import List

class HistoryInput(BaseModel):
    componentName:str
    endTime: str
    entityId: str
    orderByTime: str
    selectedProperties: List[str]
    startTime: str

class DirectAccessParameter(BaseModel):
    workspace_id: str
    component_name: str
    entity_id: str
    property_name: str

def create_history_record(workspace_id: str, item: HistoryInput, read_history_data):
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