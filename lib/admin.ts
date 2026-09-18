import { execute, query, unsafeQuery, labMode } from './db';

export async function login(email: string, password: string) {
  if (labMode) {
    // Sengaja rentan untuk demonstrasi SQL Injection (auth bypass) pada lab.
    const e = (email || '').replaceAll('\\0', '');
    const p = (password || '').replaceAll('\\0', '');

    const sql = `
      SELECT id, name, email, role
      FROM users
      WHERE email = '${e}'
        AND password = '${p}'
        AND role = 'ADMIN'
      LIMIT 1
    `;

    const rows = await unsafeQuery<any[]>(sql);
    return rows[0];
  }

  const rows = await query<any[]>(
    `SELECT id, name, email, role FROM users WHERE email = ? AND password = ? AND role = 'ADMIN' LIMIT 1`,
    [email, password]
  );
  return rows[0];
}

export async function summary() {
  const [r] = await query<any[]>(`SELECT COUNT(*) totalProducts, SUM(active=1) activeProducts, SUM(stock=0) outOfStock, SUM(stock BETWEEN 1 AND 10) limitedStock FROM products`);
  const [c] = await query<any[]>(`SELECT COUNT(*) totalCategories FROM categories`);
  const [u] = await query<any[]>(`SELECT COUNT(*) totalUsers FROM users`);
  return {...r,...c,...u};
}
export async function createProduct(data:any){ const r=await execute(`INSERT INTO products(category_id,name,description,image,price,unit,stock,active) VALUES (?,?,?,?,?,?,?,?)`,[data.categoryId,data.name,data.description,data.image,data.price,data.unit,data.stock,data.active?1:0]); return r.insertId; }
export async function updateProduct(id:number,data:any){ await execute(`UPDATE products SET category_id=?,name=?,description=?,image=?,price=?,unit=?,stock=?,active=? WHERE id=?`,[data.categoryId,data.name,data.description,data.image,data.price,data.unit,data.stock,data.active?1:0,id]); }
export async function deleteProduct(id:number){ await execute(`DELETE FROM products WHERE id=?`,[id]); }
export async function createCategory(data:any){ const r=await execute(`INSERT INTO categories(name,description) VALUES (?,?)`,[data.name,data.description]); return r.insertId; }
export async function updateCategory(id:number,data:any){ await execute(`UPDATE categories SET name=?,description=? WHERE id=?`,[data.name,data.description,id]); }
export async function deleteCategory(id:number){ await execute(`DELETE FROM categories WHERE id=?`,[id]); }
