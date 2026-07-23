import click
from flask.cli import with_appcontext

from app.extensions import db
from app.models import CrisisEmergencyLine, CrisisCategory, CrisisHotline

EMERGENCY_LINES = [
    {
        "id": "police",
        "name": "Police / Ambulance Emergency",
        "numbers": ["999", "112"],
        "desc": "National emergency line for police, fire, and ambulance dispatch.",
    },
    {
        "id": "redcross",
        "name": "Kenya Red Cross Emergency",
        "numbers": ["1199"],
        "desc": "Kenya Red Cross Society emergency response and ambulance services.",
    },
]

CATEGORIES = [
    {
        "id": "mental-health",
        "title": "Suicide & Mental Health Crisis",
        "nav_label": "Suicide & mental health",
        "icon": "LifeBuoy",
        "color": "teal",
        "lines": [
            {
                "name": "Befrienders Kenya",
                "numbers": ["0722 178 177"],
                "whatsapp": "254722178177",
                "desc": "Free, confidential emotional support by phone, SMS, and WhatsApp for anyone in distress or having thoughts of suicide.",
            },
            {
                "name": "EMKF Suicide Prevention & Crisis Helpline",
                "numbers": ["0800 723 253"],
                "desc": "Toll-free, nationwide crisis line run by Emergency Medicine Kenya Foundation.",
            },
            {
                "name": "Niskize Counseling Helpline",
                "numbers": ["0900 620 800"],
                "desc": "24-hour call center offering counseling for distress, grief, and substance use.",
            },
        ],
    },
    {
        "id": "substance-abuse",
        "title": "Alcohol & Drug Abuse",
        "nav_label": "Substance use",
        "icon": "Pill",
        "color": "blue",
        "lines": [
            {
                "name": "NACADA National Helpline",
                "numbers": ["1192"],
                "desc": "Free, confidential, 24/7 counseling and referrals for drug and alcohol use, run by the National Authority for the Campaign Against Alcohol and Drug Abuse.",
            },
        ],
    },
    {
        "id": "gbv",
        "title": "Gender-Based Violence",
        "nav_label": "Gender-based violence",
        "icon": "HeartHandshake",
        "color": "rose",
        "lines": [
            {
                "name": "National GBV Hotline",
                "numbers": ["1195"],
                "desc": "Toll-free national hotline for survivors of gender-based violence, available to all genders.",
            },
            {
                "name": "Gender Violence Recovery Centre (GVRC)",
                "numbers": ["0719 638 006", "0709 667 000"],
                "desc": "24/7 free medical treatment and psychosocial support for survivors, run by Nairobi Women's Hospital.",
            },
        ],
    },
    {
        "id": "child-protection",
        "title": "Child Protection",
        "nav_label": "Child protection",
        "icon": "Baby",
        "color": "violet",
        "lines": [
            {
                "name": "Childline Kenya",
                "numbers": ["116"],
                "desc": "Kenya's only 24-hour, toll-free helpline for children experiencing abuse or distress. Also open to adults reporting on a child's behalf.",
            },
        ],
    },
]


@click.command("seed-crisis")
@with_appcontext
def seed_crisis_command():
    """Seeds/updates crisis_emergency_lines, crisis_categories, and
    crisis_hotlines with the reference hotline data that used to be
    hardcoded in Crisis.jsx. Safe to re-run: upserts by id/name rather than
    duplicating rows. Numbers below are real, published Kenyan hotlines —
    verify periodically, as they do change over time."""

    for position, line in enumerate(EMERGENCY_LINES):
        row = CrisisEmergencyLine.query.get(line["id"])
        if row is None:
            row = CrisisEmergencyLine(id=line["id"])
            db.session.add(row)
        row.name = line["name"]
        row.numbers = line["numbers"]
        row.desc = line["desc"]
        row.position = position

    for cat_position, cat in enumerate(CATEGORIES):
        category = CrisisCategory.query.get(cat["id"])
        if category is None:
            category = CrisisCategory(id=cat["id"])
            db.session.add(category)
        category.title = cat["title"]
        category.nav_label = cat["nav_label"]
        category.icon = cat["icon"]
        category.color = cat["color"]
        category.position = cat_position
        db.session.flush()  # so category.id exists for the hotlines below

        existing_by_name = {h.name: h for h in category.hotlines}
        for line_position, line in enumerate(cat["lines"]):
            hotline = existing_by_name.get(line["name"])
            if hotline is None:
                hotline = CrisisHotline(category_id=category.id, name=line["name"])
                db.session.add(hotline)
            hotline.numbers = line["numbers"]
            hotline.whatsapp = line.get("whatsapp")
            hotline.desc = line["desc"]
            hotline.position = line_position

    db.session.commit()
    click.echo("Seeded crisis resources.")