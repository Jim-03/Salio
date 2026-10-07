from http.client import HTTPException

from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.config.database import DatabaseDep
from src.config.models import CategoryModel


class CategoryService:
    def __init__(self, db: Session = DatabaseDep):
        self.__repository = db

    def find_all(self) -> list[CategoryModel]:
        """Retrieve all categories"""
        return self.__repository.query(CategoryModel).all()

    def add(self, name: str):
        if name is None:
            raise HTTPException(
                status_code=400, detail={"error": "Category data is required"}
            )

        name = name.strip().upper()

        try:
            # Check if category exists
            existing = (
                self.__repository.query(CategoryModel)
                .filter(CategoryModel.name == name)
                .first()
            )

            if existing:
                raise HTTPException(
                    status_code=409, detail={"error": "Category already exists"}
                )

            # Persist
            data = CategoryModel(name=name)
            self.__repository.add(data)
            self.__repository.commit()
            self.__repository.refresh(data)

            return data
        except Exception:
            self.__repository.rollback()
            raise
