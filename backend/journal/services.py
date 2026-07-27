from app.journal.models import JournalEntry
from app.extensions import db
from app.core.exceptions import ValidationError, NotFoundError

class JournalService:
    def create_entry(self, user_id, data):
        title = data.get('title')
        content = data.get('content')
        mood = data.get('mood')
        tags = data.get('tags', [])
        
        if not title or not content:
            raise ValidationError('Title and content are required')
        
        if mood and not 1 <= mood <= 5:
            raise ValidationError('Mood must be between 1 and 5')
        
        entry = JournalEntry(
            user_id=user_id,
            title=title,
            content=content,
            mood=mood,
            tags=tags
        )
        db.session.add(entry)
        db.session.commit()
        return entry
    
    def get_user_entries(self, user_id):
        return JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.created_at.desc()).all()
    
    def get_entry(self, entry_id, user_id):
        entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            raise NotFoundError('Journal entry not found')
        return entry
    
    def update_entry(self, entry_id, user_id, data):
        entry = self.get_entry(entry_id, user_id)
        
        if 'title' in data:
            entry.title = data['title']
        if 'content' in data:
            entry.content = data['content']
        if 'mood' in data:
            if data['mood'] and not 1 <= data['mood'] <= 5:
                raise ValidationError('Mood must be between 1 and 5')
            entry.mood = data['mood']
        if 'tags' in data:
            entry.tags = data['tags']
        
        db.session.commit()
        return entry
    
    def delete_entry(self, entry_id, user_id):
        entry = self.get_entry(entry_id, user_id)
        db.session.delete(entry)
        db.session.commit()

journal_service = JournalService()