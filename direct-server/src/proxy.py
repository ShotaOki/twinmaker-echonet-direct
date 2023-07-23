from fastapi import  Request
from pydantic import BaseConfig
import requests_aws4auth
import requests

class AwsAccessInfo(BaseConfig):
    region: str
    access_key: str
    secret_access_key: str

class ApiProxy:
    _cache: dict
    def __init__(self) -> None:
        self._cache = {}
    
    def request_api(self, request: Request, aws_access_info: AwsAccessInfo):
        twinmaker_domain = f"iottwinmaker.{aws_access_info.region}.amazonaws.com"
        original_url: str = request.url._url
        url = original_url.replace(f"localhost:{request.url.port}", twinmaker_domain).replace("http://", "https://")
        if url in self._cache:
            return self._cache[url]
        auth = requests_aws4auth.AWS4Auth(
            aws_access_info.access_key,
            aws_access_info.secret_access_key,
            aws_access_info.region,
            'iottwinmaker',
        )
        response = requests.get(url, auth=auth)
        result = response.json()

        self._cache[url] = result
        return result