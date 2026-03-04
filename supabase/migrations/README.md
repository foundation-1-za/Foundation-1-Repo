# Foundation-1 Supabase Migrations

This directory contains all database migrations for the Foundation-1 application.

## Migration Files

| File | Description | Run Order |
|------|-------------|-----------|
| `001_initial_schema.sql` | Creates all tables, indexes, triggers, and storage buckets | 1 |
| `002_rls_policies.sql` | Enables RLS and creates all security policies | 2 |
| `003_functions.sql` | Stored procedures and helper functions | 3 |
| `004_seed_data.sql` | Test data matching existing mock data | 4 (dev only) |

## Setup Instructions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Initialize Project

```bash
# In your project root
supabase init
```

### 3. Link to Supabase Project

```bash
# Create project at https://app.supabase.com first
supabase link --project-ref your-project-ref
```

### 4. Run Migrations

```bash
# Reset and apply all migrations
supabase db reset

# Or apply specific migration
supabase db push
```

### 5. Alternative: Run via SQL Editor

You can also copy-paste each migration file into the Supabase Dashboard SQL Editor:
1. Go to https://app.supabase.com/project/_/sql
2. Copy contents of migration files in order
3. Run each file

## Database Schema

### Tables

- `user_profiles` - Extended user information (roles, contact info)
- `clients` - Business clients
- `client_documents` - Document requests and uploads
- `client_messages` - Communication between admin and clients
- `leads` - Sales leads with status tracking
- `support_requests` - Customer support tickets
- `audit_logs` - Compliance audit trail

### Storage Buckets

- `client-documents` - Client uploaded documents (10MB limit)
- `lead-attachments` - Lead related files
- `user-cvs` - Sales rep CV uploads (5MB limit)

### Key Features

1. **Row Level Security (RLS)** - All tables have fine-grained access control
2. **Real-time** - Messages, documents, and leads support realtime subscriptions
3. **Audit Logging** - Automatic tracking of all data changes
4. **Status Workflows** - Lead and document status transitions with history
5. **Search** - Full-text search functions for clients and leads

## Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all data and functions |
| `sales_rep` | Can view own leads and referred clients |
| `business` | Can view own client record, documents, messages |

## Helper Functions

### Statistics
- `get_admin_stats()` - Dashboard statistics for admins
- `get_sales_rep_stats(rep_id)` - Sales rep performance metrics
- `get_client_stats(client_id)` - Client-specific stats

### Document Management
- `request_document(client_id, type, name, description)` - Request document from client
- `review_document(document_id, action, notes)` - Approve/reject document
- `upload_document(document_id, file_info)` - Client uploads document

### Messaging
- `send_message_to_client(client_id, content)` - Admin sends message
- `send_message_to_admin(content)` - Client sends message
- `mark_messages_read(client_id, message_ids)` - Mark messages as read
- `get_unread_count(client_id)` - Get unread message count

### Lead Management
- `update_lead_status(lead_id, status, note)` - Update lead with history
- `create_lead_with_business(business_data, lead_data)` - Create lead and client
- `search_clients(term, status, admin)` - Search clients with filters
- `search_leads(term, status, rep)` - Search leads with filters

## Post-Migration Setup

After running migrations, you need to:

1. **Enable Auth Provider**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Email provider
   - Configure email templates

2. **Configure Storage**
   - Go to Storage → Policies
   - Verify policies are active
   - Test upload/download

3. **Enable Realtime**
   - Go to Database → Replication
   - Enable realtime for: `client_messages`, `client_documents`, `leads`

4. **Set up Edge Functions** (optional)
   - Deploy functions from `supabase/functions/`
   - Configure secrets and environment variables

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Use `auth.uid()` in RLS policies to reference current user
- All functions use `SECURITY DEFINER` to bypass RLS when needed
- Audit logs track all data modifications automatically
