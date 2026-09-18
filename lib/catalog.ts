import { query, unsafeQuery, labMode } from './db';
import type { Category, Product } from './types';

const select = `
  SELECT
    p.id,
    p.category_id AS categoryId,
    c.name AS categoryName,
    p.name,
    p.description,
    p.image,
    p.price,
    p.unit,
    p.stock,
    p.active,
    p.created_at AS createdAt
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

export async function listCategories(): Promise<Category[]> {
  return query<any[]>(
    `
      SELECT
        c.id,
        c.name,
        c.description,
        COUNT(p.id) AS productCount
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `
  );
}

export async function listProducts(search = ''): Promise<Product[]> {
  if (labMode) {
    // Sengaja rentan untuk demonstrasi SQL Injection pada lab.
    const q = search.replaceAll('\\0', '');

    const sql = `
      ${select}
      WHERE p.active = 1
      AND (
        p.name LIKE '%${q}%'
        OR p.description LIKE '%${q}%'
      )
      ORDER BY p.name
    `;

    return unsafeQuery<any[]>(sql);
  }

  const pattern = `%${search}%`;

  return query<any[]>(
    `
      ${select}
      WHERE p.active = 1
      AND (
        p.name LIKE ?
        OR p.description LIKE ?
      )
      ORDER BY p.name
    `,
    [pattern, pattern]
  );
}

export async function getProduct(id: number): Promise<Product[]> {
  return query<any[]>(
    `
      ${select}
      WHERE p.id = ?
        AND p.active = 1
      LIMIT 1
    `,
    [id]
  );
}

export async function adminProducts(search = '') {
  const pattern = `%${search}%`;

  return query<any[]>(
    `
      ${select}
      WHERE p.name LIKE ?
         OR p.description LIKE ?
      ORDER BY p.name
    `,
    [pattern, pattern]
  );
}
