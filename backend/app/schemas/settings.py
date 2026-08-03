from pydantic import BaseModel


class AppSettingsIn(BaseModel):
    savings_target: int


class AppSettingsOut(BaseModel):
    savings_target: int
