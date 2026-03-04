# Foundation-1 Edge Functions

Serverless functions deployed to Supabase Edge Functions (Deno runtime).

## Functions Overview

| Function | Purpose | Trigger | JWT Required |
|----------|---------|---------|--------------|
| `auto-create-profile` | Creates user profile on signup | Auth webhook | No |
| `send-notification` | Sends emails & in-app notifications | API call | Yes |
| `document-webhook` | Handles document status changes | DB webhook | No |
| `notify-client` | Real-time client notifications | API call | Yes |

## Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy auto-create-profile
supabase functions deploy send-notification
supabase functions deploy document-webhook
supabase functions deploy notify-client

# Set secrets
supabase secrets set WEBHOOK_SECRET=your-webhook-secret
supabase secrets set SITE_URL=https://yourdomain.com
```

## Environment Variables

Add these to your Supabase Dashboard → Edge Functions → Secrets:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WEBHOOK_SECRET=random-secret-for-webhooks
SITE_URL=https://yourdomain.com
```

## Auth Webhook Setup

To trigger `auto-create-profile` on signup:

1. Go to Supabase Dashboard → Auth → Hooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/auto-create-profile`
3. Set secret: `Bearer your-webhook-secret`

## Database Webhook Setup

To trigger `document-webhook` on document changes:

```sql
-- Create webhook trigger
CREATE OR REPLACE FUNCTION trigger_document_webhook()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM net.http_post(
        url := 'https://your-project.supabase.co/functions/v1/document-webhook',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer your-webhook-secret'
        ),
        body := jsonb_build_object(
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'record', row_to_json(NEW),
            'old_record', row_to_json(OLD)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_webhook_trigger
    AFTER INSERT OR UPDATE ON client_documents
    FOR EACH ROW EXECUTE FUNCTION trigger_document_webhook();
```

## API Usage

### Send Notification

```typescript
const { data, error } = await supabase.functions.invoke('send-notification', {
  body: {
    type: 'document_approved',
    clientId: 'uuid',
    data: {
      documentName: 'Contract',
      adminNotes: 'All good!',
    },
  },
});
```

### Notify Client (Real-time)

```typescript
await supabase.functions.invoke('notify-client', {
  body: {
    type: 'message',
    clientId: 'uuid',
    content: 'Your document has been approved!',
  },
});
```

## Local Development

```bash
# Serve function locally
supabase functions serve auto-create-profile --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/auto-create-profile \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"user": {"id": "test", "email": "test@test.com"}}'
```

## Logs

```bash
# View function logs
supabase functions logs auto-create-profile --tail
```
