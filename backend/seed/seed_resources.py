

from app import create_app
from app.extensions import db
from app.models import Resource
from backend.data.resources_data import RESOURCES_SEED


def seed():
    app = create_app()
    with app.app_context():
        created, updated = 0, 0

        for entry in RESOURCES_SEED:
            resource = Resource.query.filter_by(
                name=entry["name"], county=entry["county"]
            ).first()

            if resource is None:
                db.session.add(Resource(**entry))
                created += 1
            else:
                for field, value in entry.items():
                    setattr(resource, field, value)
                updated += 1

        db.session.commit()
        print(f"Resources seeded: {created} created, {updated} updated.")


if __name__ == "__main__":
    seed()