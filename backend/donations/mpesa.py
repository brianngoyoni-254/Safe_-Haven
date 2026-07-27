import requests
import base64
from datetime import datetime
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class MpesaService:
    def __init__(self):
        self.consumer_key = current_app.config.get('MPESA_CONSUMER_KEY')
        self.consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET')
        self.passkey = current_app.config.get('MPESA_PASSKEY')
        self.shortcode = current_app.config.get('MPESA_SHORTCODE')
        self.environment = current_app.config.get('MPESA_ENVIRONMENT', 'sandbox')
        self.base_url = 'https://sandbox.safaricom.co.ke' if self.environment == 'sandbox' else 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get M-Pesa access token"""
        auth = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()
        
        try:
            response = requests.get(
                f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={'Authorization': f'Basic {auth}'},
                timeout=30
            )
            response.raise_for_status()
            return response.json()['access_token']
        except requests.RequestException as e:
            logger.error(f'M-Pesa token error: {str(e)}')
            raise
    
    def initiate_stk_push(self, phone, amount, account_reference, transaction_desc=None):
        """Initiate STK push payment"""
        try:
            token = self.get_access_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            
            password = base64.b64encode(
                f"{self.shortcode}{self.passkey}{timestamp}".encode()
            ).decode()
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': phone,
                'PartyB': self.shortcode,
                'PhoneNumber': phone,
                'CallBackURL': current_app.config.get('MPESA_CALLBACK_URL'),
                'AccountReference': account_reference[:12],
                'TransactionDesc': transaction_desc or 'Donation to Safe Haven'
            }
            
            logger.info(f'Initiating STK push for amount {amount} to {phone}')
            response = requests.post(
                f"{self.base_url}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers={'Authorization': f'Bearer {token}'},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f'M-Pesa STK push error: {str(e)}')
            raise
    
    def query_status(self, checkout_request_id):
        """Query transaction status"""
        try:
            token = self.get_access_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            
            password = base64.b64encode(
                f"{self.shortcode}{self.passkey}{timestamp}".encode()
            ).decode()
            
            payload = {
                'BusinessShortCode': self.shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }
            
            response = requests.post(
                f"{self.base_url}/mpesa/stkpushquery/v1/query",
                json=payload,
                headers={'Authorization': f'Bearer {token}'},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f'M-Pesa query error: {str(e)}')
            raise

mpesa_service = MpesaService()