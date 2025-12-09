import smtplib
from email.message import EmailMessage

# --- EMAIL LOGIC ---
def send_email(sender_email: str, sender_password: str, subject: str, body: str, receiver_email: str) -> bool:
    """Sends an email notification via SMTP_SSL (Gmail)."""
    if not sender_email or not sender_password:
        return False
        
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = receiver_email
        msg.set_content(body)
        
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False