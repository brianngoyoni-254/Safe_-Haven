import uuid
from datetime import datetime, timezone
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class Donation(db.Model):
    __tablename__ = "donations"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=True, index=True
    )
    amount = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    name = db.Column(db.String(120), nullable=True)
    message = db.Column(db.Text, nullable=True)
    anonymous = db.Column(db.Boolean, nullable=False, default=False)
    frequency = db.Column(db.String(20), nullable=False, default="once")
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    checkout_request_id = db.Column(db.String(60), unique=True, nullable=True, index=True)
    merchant_request_id = db.Column(db.String(60), nullable=True)
    mpesa_receipt_number = db.Column(db.String(30), nullable=True)
    result_code = db.Column(db.Integer, nullable=True)
    result_desc = db.Column(db.String(255), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def _masked_phone(self):
        """Show enough of the number to be recognizable without exposing it fully."""
        if not self.phone or len(self.phone) < 9:
            return self.phone
        return f"{self.phone[:6]}***{self.phone[-3:]}"

    def to_receipt_dict(self):
        """Public-safe payload for the printable/downloadable receipt.
        Only ever meaningful once status == 'success'."""
        received_at = self.updated_at or self.created_at
        return {
            'donor_name': None if self.anonymous else (self.name or None),
            'anonymous': self.anonymous,
            'amount': self.amount,
            'frequency': self.frequency,
            'phone_masked': self._masked_phone(),
            'mpesa_receipt_number': self.mpesa_receipt_number,
            'received_at': received_at.isoformat() if received_at else None,
            'checkout_request_id': self.checkout_request_id,
        }

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'phone': self.phone,
            'name': self.name,
            'message': self.message,
            'anonymous': self.anonymous,
            'frequency': self.frequency,
            'status': self.status,
            'checkout_request_id': self.checkout_request_id,
            'merchant_request_id': self.merchant_request_id,
            'mpesa_receipt_number': self.mpesa_receipt_number,
            'result_code': self.result_code,
            'result_desc': self.result_desc,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Donation id={self.id!r} status={self.status!r} amount={self.amount!r}>"