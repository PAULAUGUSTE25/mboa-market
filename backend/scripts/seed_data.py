import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.marketplace import Category, ProductRef
from app.models.user import Role
from uuid import uuid4


async def seed_data():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Seed categories
        categories = [
            Category(id=uuid4(), name_fr="Céréales", name_en="Cereals", kind="product", is_active=True),
            Category(id=uuid4(), name_fr="Légumes", name_en="Vegetables", kind="product", is_active=True),
            Category(id=uuid4(), name_fr="Fruits", name_en="Fruits", kind="product", is_active=True),
            Category(id=uuid4(), name_fr="Tubercules", name_en="Tubers", kind="product", is_active=True),
            Category(id=uuid4(), name_fr="Élevage", name_en="Livestock", kind="product", is_active=True),
            Category(id=uuid4(), name_fr="Semences", name_en="Seeds", kind="product", is_active=True),
            Category(id=uuid4(), name_fr="Animaux", name_en="Animals", kind="product", is_active=True),
        ]
        session.add_all(categories)
        
        # Seed products
        products = [
            ProductRef(id=uuid4(), name_fr="Maïs", name_en="Corn", unit_default="kg", is_active=True),
            ProductRef(id=uuid4(), name_fr="Riz", name_en="Rice", unit_default="kg", is_active=True),
            ProductRef(id=uuid4(), name_fr="Tomate", name_en="Tomato", unit_default="kg", is_active=True),
            ProductRef(id=uuid4(), name_fr="Oignon", name_en="Onion", unit_default="kg", is_active=True),
            ProductRef(id=uuid4(), name_fr="Manioc", name_en="Cassava", unit_default="kg", is_active=True),
            ProductRef(id=uuid4(), name_fr="Plantain", name_en="Plantain", unit_default="régime", is_active=True),
            ProductRef(id=uuid4(), name_fr="Poulet", name_en="Chicken", unit_default="unité", is_active=True),
            ProductRef(id=uuid4(), name_fr="Semences de Maïs", name_en="Corn Seeds", unit_default="kg", is_active=True),
            ProductRef(id=uuid4(), name_fr="Poussins", name_en="Chicks", unit_default="unité", is_active=True),
        ]
        session.add_all(products)
        
        # Seed roles
        roles = [
            Role(id=uuid4(), code="admin", name="Administrateur", description="Accès complet au système"),
            Role(id=uuid4(), code="moderator", name="Modérateur", description="Gestion du contenu et des utilisateurs"),
            Role(id=uuid4(), code="seed_provider", name="Fournisseur de Semences", description="Vend des semences et animaux"),
            Role(id=uuid4(), code="producer", name="Producteur", description="Produit et vend des récoltes"),
            Role(id=uuid4(), code="buyer", name="Acheteur", description="Achète des produits"),
            Role(id=uuid4(), code="transporter", name="Transporteur", description="Gestion de la logistique"),
        ]
        session.add_all(roles)
        
        await session.commit()
    
    await engine.dispose()
    print("Seed data inserted successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
