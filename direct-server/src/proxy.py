from fastapi import  Request
from pydantic_settings import BaseSettings
import requests_aws4auth
import requests

class AwsAccessInfo(BaseSettings):
    region: str
    access_key: str
    secret_access_key: str

class ApiProxy:
    _cache: dict
    def __init__(self) -> None:
        self._cache = {}
    
    def request_api(self, request: Request, aws_access_info: AwsAccessInfo):
        """
        ローカル環境へのリクエストをAWSに転送する
        """
        # 接続先のドメインを取得
        twinmaker_domain = f"iottwinmaker.{aws_access_info.region}.amazonaws.com"
        original_url: str = request.url._url
        url = original_url.replace(f"localhost:{request.url.port}", twinmaker_domain).replace("http://", "https://")
        # もし過去にリクエストしたことのある接続先なら、キャッシュからその時のレスポンスを取得する
        if url in self._cache:
            return self._cache[url]
        # 署名を再設定して、AWSにリクエストを転送する
        auth = requests_aws4auth.AWS4Auth(
            aws_access_info.access_key,
            aws_access_info.secret_access_key,
            aws_access_info.region,
            'iottwinmaker',
        )
        # AWSから結果を取得する
        response = requests.get(url, auth=auth)
        result = response.json()
        # キャッシュに情報を格納する
        self._cache[url] = result
        return result