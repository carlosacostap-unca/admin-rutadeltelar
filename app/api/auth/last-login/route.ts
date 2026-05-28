const pbUrl = (process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || '').replace(/\/$/, '');
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!pbUrl || !adminEmail || !adminPassword) {
      return Response.json({ error: 'PocketBase server credentials are not configured.' }, { status: 500 });
    }

    const authorization = request.headers.get('authorization');
    if (!authorization?.toLowerCase().startsWith('bearer ')) {
      return Response.json({ error: 'Missing auth token.' }, { status: 401 });
    }

    const authData = await refreshUserAuth(authorization);
    if (!authData.ok) {
      return Response.json({ error: 'Invalid auth token.' }, { status: 401 });
    }

    const user = authData.record;
    if (!user?.id) {
      return Response.json({ error: 'Invalid user record.' }, { status: 401 });
    }

    if (user.active === false) {
      return Response.json({ error: 'Inactive user.' }, { status: 403 });
    }

    const token = await authenticateAdmin();
    const lastLogin = new Date().toISOString();
    const response = await fetch(`${pbUrl}/api/collections/users/records/${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ last_login: lastLogin }),
    });

    if (!response.ok) {
      return Response.json({ error: 'Could not update last login.' }, { status: 502 });
    }

    const updatedUser = await response.json();
    return Response.json({ last_login: updatedUser.last_login || lastLogin });
  } catch {
    return Response.json({ error: 'Could not update last login.' }, { status: 502 });
  }
}

async function refreshUserAuth(authorization: string) {
  const response = await fetch(`${pbUrl}/api/collections/users/auth-refresh`, {
    method: 'POST',
    headers: { Authorization: authorization },
  });

  if (!response.ok) {
    return { ok: false as const };
  }

  const authData = await response.json();
  return { ok: true as const, record: authData.record as { id?: string; active?: boolean } | undefined };
}

async function authenticateAdmin() {
  const body = JSON.stringify({ identity: adminEmail, password: adminPassword });
  const adminResponse = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (adminResponse.ok) {
    return (await adminResponse.json()).token as string;
  }

  const superuserResponse = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (superuserResponse.ok) {
    return (await superuserResponse.json()).token as string;
  }

  throw new Error(`PocketBase auth failed: admins=${adminResponse.status}, superusers=${superuserResponse.status}`);
}
