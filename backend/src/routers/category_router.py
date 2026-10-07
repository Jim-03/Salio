from fastapi import APIRouter, Depends

from src.dto.category_dto import AddCategoryDto, CategoryData, GetCategoriesDto
from src.services.category_service import CategoryService

category_router = APIRouter(prefix="/categories", tags=["Categories"])


@category_router.get(
    "",
    description="Retrieve a list of all categories",
    summary="Get categories",
    status_code=200,
)
def get_categories(service: CategoryService = Depends()):
    return service.find_all()


@category_router.post(
    "", response_model=CategoryData, description="Add new category", status_code=201
)
def add_category(request: AddCategoryDto, service: CategoryService = Depends()):
    category: CategoryData = service.add(request.name)

    return category
