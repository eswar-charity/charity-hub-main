from supabase import create_client, Client
from app.config import settings

# Service-role client — used for all table operations (bypasses RLS)
db: Client = create_client(settings.supabase_url, settings.supabase_service_key)

# Anon-key client — used only for auth operations (sign_up, sign_in, get_user)
# Keeping auth separate ensures auth calls never pollute db's PostgREST session
# with a user token, which would make table operations fall under RLS again.
auth_client: Client = create_client(settings.supabase_url, settings.supabase_anon_key)
