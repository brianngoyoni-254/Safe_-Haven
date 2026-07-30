from app.checkins.models import CheckIn
from app.extensions import db
from app.core.exceptions import ValidationError
from datetime import date, timedelta

class CheckinService:
    def create_checkin(self, user_id, data):
        mood = data.get('mood')
        craving_level = data.get('cravingLevel')
        sober_today = data.get('soberToday', True)
        notes = data.get('notes')
        
        if not mood or not 1 <= mood <= 5:
            raise ValidationError('Mood must be between 1 and 5')
        if not craving_level or not 1 <= craving_level <= 5:
            raise ValidationError('Craving level must be between 1 and 5')
        
        today = date.today()
        checkin = CheckIn.query.filter_by(user_id=user_id, date=today).first()
        
        if checkin:
            checkin.mood = mood
            checkin.craving_level = craving_level
            checkin.sober_today = sober_today
            checkin.notes = notes
        else:
            checkin = CheckIn(
                user_id=user_id,
                date=today,
                mood=mood,
                craving_level=craving_level,
                sober_today=sober_today,
                notes=notes
            )
            db.session.add(checkin)
        
        db.session.commit()
        return checkin
    
    def get_today_checkin(self, user_id):
        return CheckIn.query.filter_by(user_id=user_id, date=date.today()).first()
    
    def get_user_checkins(self, user_id):
        return CheckIn.query.filter_by(user_id=user_id).order_by(CheckIn.date.desc()).all()
    
    def get_stats(self, user_id):
        checkins = CheckIn.query.filter_by(user_id=user_id).all()
        
        if not checkins:
            return {
                'total_days': 0,
                'avg_mood': 0,
                'avg_craving': 0,
                'sober_days': 0,
                'streak': 0
            }
        
        total = len(checkins)
        avg_mood = sum(c.mood for c in checkins) / total
        avg_craving = sum(c.craving_level for c in checkins) / total
        sober_days = sum(1 for c in checkins if c.sober_today)
        
        # Calculate streak
        streak = 0
        dates = sorted([c.date for c in checkins if c.sober_today], reverse=True)
        current = date.today()
        for d in dates:
            if d == current:
                streak += 1
                current = d - timedelta(days=1)
            else:
                break
        
        return {
            'total_days': total,
            'avg_mood': round(avg_mood, 1),
            'avg_craving': round(avg_craving, 1),
            'sober_days': sober_days,
            'streak': streak
        }

checkin_service = CheckinService()