import json
from app import create_app
from app.extensions import db
from app.resources.models import Resource

app = create_app()

def seed_resources():
    with app.app_context():
        # Sample data - replace with actual resources
        resources = [
            {
                'name': 'Nairobi Wellness Center',
                'type': 'rehab',
                'county': 'Nairobi',
                'region': 'Nairobi CBD',
                'address': '123 Kenyatta Ave, Nairobi',
                'phone': '0712345678',
                'website': 'https://example.com',
                'lat': -1.286389,
                'lng': 36.817223
            },
            # Add more resources
        ]
        
        for data in resources:
            resource = Resource(**data)
            db.session.add(resource)
        
        db.session.commit()
        print(f'Seeded {len(resources)} resources')

if __name__ == '__main__':
    seed_resources()