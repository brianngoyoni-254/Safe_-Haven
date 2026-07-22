

from app import create_app
from app.extensions import db
from app.models import LibraryTopic, LibraryReading, VideoTopic, Video
from backend.data.library_data import LIBRARY_TOPICS_SEED
from backend.data.video_data import VIDEO_TOPICS_SEED


def seed_library():
    created, updated = 0, 0

    for entry in LIBRARY_TOPICS_SEED:
        readings = entry.pop("readings")
        topic = LibraryTopic.query.get(entry["id"])

        if topic is None:
            topic = LibraryTopic(**entry)
            db.session.add(topic)
            created += 1
        else:
            for field, value in entry.items():
                setattr(topic, field, value)
            updated += 1

        # Replace readings wholesale rather than diffing — simplest way to
        # keep order/content in sync with library_data.py on every re-run.
        LibraryReading.query.filter_by(topic_id=entry["id"]).delete()
        for reading in readings:
            db.session.add(LibraryReading(topic_id=entry["id"], **reading))

    db.session.commit()
    print(f"Library topics seeded: {created} created, {updated} updated.")


def seed_videos():
    created, updated = 0, 0

    for entry in VIDEO_TOPICS_SEED:
        videos = entry.pop("videos")
        topic = VideoTopic.query.get(entry["id"])

        if topic is None:
            topic = VideoTopic(**entry)
            db.session.add(topic)
            created += 1
        else:
            for field, value in entry.items():
                setattr(topic, field, value)
            updated += 1

        Video.query.filter_by(topic_id=entry["id"]).delete()
        for video in videos:
            db.session.add(Video(topic_id=entry["id"], **video))

    db.session.commit()
    print(f"Video topics seeded: {created} created, {updated} updated.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_library()
        seed_videos()