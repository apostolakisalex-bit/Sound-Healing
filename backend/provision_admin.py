"""Explicit first-admin setup. Run interactively against an approved database.
Never embeds a default password or executes at application startup.
"""
import asyncio, getpass
from server import db, hash_password, client
from datetime import datetime,timezone
from uuid import uuid4
async def main():
    email=input('Admin email: ').strip().lower()
    name=input('Admin name: ').strip()
    password=getpass.getpass('Password (10-72 UTF-8 bytes): ')
    if not 10 <= len(password.encode()) <= 72 or '@' not in email or not name:
        raise SystemExit('Invalid details')
    if await db.users.find_one({'email':email}):
        raise SystemExit('Account already exists. No account was changed.')
    await db.users.insert_one({'id':str(uuid4()),'email':email,'name':name,'password_hash':hash_password(password),'role':'admin','created_at':datetime.now(timezone.utc)})
    print('Administrator created.')
    client.close()
if __name__=='__main__': asyncio.run(main())
