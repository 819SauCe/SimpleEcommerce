import pool from "../Config/connectDB";

export async function createStore(userId: string, storeName: string, type: string, url: string, route: string, header: string, html: string, footer: string, seoTittle: string, seoDescription: string) {
  try {
    const query = `
      INSERT INTO stores (user_id, name, type, url, route, header, html, footer, seo_title, seo_description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    await pool.query(query, [userId, storeName, type, url, route, header, html, footer, seoTittle, seoDescription]);

  } catch (error) {
    console.error(error);
    throw error;
  }
}
