import { Page } from '@playwright/test';

type Role = 'admin' | 'editor' | 'revisor' | 'consultor';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: Role[];
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

type CollectionRecords = Record<string, Array<Record<string, unknown>>>;

export const adminUser: TestUser = {
  id: 'test-admin',
  name: 'Admin Test',
  email: 'admin.test@rutadeltelar.local',
  active: true,
  roles: ['admin'],
  collectionId: 'users',
  collectionName: 'users',
  created: '2026-01-01 00:00:00.000Z',
  updated: '2026-01-01 00:00:00.000Z',
};

export const editorUser: TestUser = {
  ...adminUser,
  id: 'test-editor',
  name: 'Editor Test',
  email: 'editor.test@rutadeltelar.local',
  roles: ['editor'],
};

export const revisorUser: TestUser = {
  ...adminUser,
  id: 'test-revisor',
  name: 'Revisor Test',
  email: 'revisor.test@rutadeltelar.local',
  roles: ['revisor'],
};

const collectionNames = [
  'users',
  'estaciones',
  'actores',
  'productos',
  'experiencias',
  'imperdibles',
  'tipos_actor',
  'categorias_producto',
  'subcategorias_producto',
  'tecnicas_producto',
  'categorias_experiencia',
  'tipos_imperdible',
  'prioridades_imperdible',
  'departamentos',
];

function base64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createTestToken(user: TestUser) {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    id: user.id,
    type: 'auth',
    collectionId: user.collectionId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }));

  return `${header}.${payload}.test-signature`;
}

export async function mockAuthenticatedUser(page: Page, user: TestUser = adminUser) {
  const token = createTestToken(user);

  await page.addInitScript(({ authToken, authRecord }: { authToken: string; authRecord: TestUser }) => {
    window.localStorage.setItem('pocketbase_auth', JSON.stringify({
      token: authToken,
      record: authRecord,
    }));
    window.localStorage.setItem('sessionStartedAt', String(Date.now()));
    window.localStorage.setItem('activeRole', authRecord.roles[0]);
  }, { authToken: token, authRecord: user });

  await page.route('**/api/collections/users/auth-refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token, record: user }),
    });
  });
}

export async function mockPocketBaseCollections(
  page: Page,
  recordsByCollection: CollectionRecords = {},
) {
  await page.route('**/api/collections/*/records**', async (route) => {
    const url = new URL(route.request().url());
    const match = url.pathname.match(/\/api\/collections\/([^/]+)\/records/);
    const collectionName = match?.[1] ? decodeURIComponent(match[1]) : '';
    const records = recordsByCollection[collectionName] ?? [];
    const pageParam = Number(url.searchParams.get('page') || '1');
    const perPage = Number(url.searchParams.get('perPage') || records.length || '30');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        page: pageParam,
        perPage,
        totalItems: records.length,
        totalPages: records.length > 0 ? Math.ceil(records.length / perPage) : 0,
        items: records,
      }),
    });
  });

  for (const collectionName of collectionNames) {
    if (recordsByCollection[collectionName]) continue;
    recordsByCollection[collectionName] = [];
  }
}
