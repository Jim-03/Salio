from pydantic import BaseModel, ConfigDict


class CategoryData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str

class GetCategoriesDto(BaseModel):
  categories: list[CategoryData]

class AddCategoryDto(BaseModel):
  name: str