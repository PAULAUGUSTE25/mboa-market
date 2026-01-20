from pydantic import BaseModel, Field, validator
from typing import Optional
import re


class PhoneVerificationRequest(BaseModel):
    phone: str = Field(..., description="Phone number to verify")
    code: str = Field(..., min_length=6, max_length=6, description="Verification code (6 digits)")
    
    @validator('phone')
    def validate_phone(cls, v):
        # Remove spaces and special characters
        phone = re.sub(r'[^\d+]', '', v)
        if not phone:
            raise ValueError('Phone number is required')
        if len(phone) < 9:
            raise ValueError('Phone number too short')
        return phone
    
    @validator('code')
    def validate_code(cls, v):
        if len(v) != 6:
            raise ValueError('Verification code must be exactly 6 digits')
        if not v.isdigit():
            raise ValueError('Verification code must contain only digits')
        return v


class PhoneVerificationResponse(BaseModel):
    message: str
    phone_verified: bool


class PasswordValidation(BaseModel):
    """Helper for password validation"""
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Validate password meets security requirements"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        # Check for at least one digit
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        
        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character (!@#$%^&*...)')
        
        return v
