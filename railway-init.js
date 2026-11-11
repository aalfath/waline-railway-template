// Railway template init for Waline: create the Postgres schema and the first admin.
const { Client } = require('pg');
const { PasswordHash } = require('phpass');
const e = process.env;
const P = e.PG_PREFIX || 'wl_';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCHEMA = `
CREATE SEQUENCE IF NOT EXISTS ${P}comment_seq;
CREATE TABLE IF NOT EXISTS ${P}comment (
  id int check (id > 0) NOT NULL DEFAULT NEXTVAL ('${P}comment_seq'),
  user_id int DEFAULT NULL, comment text,
  insertedAt timestamp(0) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip varchar(100) DEFAULT '', link varchar(255) DEFAULT NULL, mail varchar(255) DEFAULT NULL,
  nick varchar(255) DEFAULT NULL, pid int DEFAULT NULL, rid int DEFAULT NULL, sticky numeric DEFAULT NULL,
  status varchar(50) NOT NULL DEFAULT '', "like" int DEFAULT NULL, ua text, url varchar(255) DEFAULT NULL,
  createdAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id));
CREATE SEQUENCE IF NOT EXISTS ${P}counter_seq;
CREATE TABLE IF NOT EXISTS ${P}counter (
  id int check (id > 0) NOT NULL DEFAULT NEXTVAL ('${P}counter_seq'),
  time int DEFAULT NULL, reaction0 int DEFAULT NULL, reaction1 int DEFAULT NULL, reaction2 int DEFAULT NULL,
  reaction3 int DEFAULT NULL, reaction4 int DEFAULT NULL, reaction5 int DEFAULT NULL, reaction6 int DEFAULT NULL,
  reaction7 int DEFAULT NULL, reaction8 int DEFAULT NULL, url varchar(255) NOT NULL DEFAULT '',
  createdAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id));
CREATE SEQUENCE IF NOT EXISTS ${P}users_seq;
CREATE TABLE IF NOT EXISTS ${P}users (
  id int check (id > 0) NOT NULL DEFAULT NEXTVAL ('${P}users_seq'),
  display_name varchar(255) NOT NULL DEFAULT '', email varchar(255) NOT NULL DEFAULT '',
  password varchar(255) NOT NULL DEFAULT '', type varchar(50) NOT NULL DEFAULT '',
  label varchar(255) DEFAULT NULL, url varchar(255) DEFAULT NULL, avatar text DEFAULT NULL,
  github varchar(255) DEFAULT NULL, twitter varchar(255) DEFAULT NULL, facebook varchar(255) DEFAULT NULL,
  google varchar(255) DEFAULT NULL, weibo varchar(255) DEFAULT NULL, qq varchar(255) DEFAULT NULL,
  oidc varchar(255) DEFAULT NULL, huawei varchar(255) DEFAULT NULL, "2fa" varchar(32) DEFAULT NULL,
  createdAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp(0) without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id));`;

(async () => {
  const cfg = {
    host: e.PG_HOST, port: Number(e.PG_PORT || 5432), user: e.PG_USER,
    password: e.PG_PASSWORD, database: e.PG_DB,
    ssl: e.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
  let db;
  for (let i = 1; ; i++) {
    db = new Client(cfg);
    try { await db.connect(); break; } catch (err) {
      await db.end().catch(() => {});
      if (i >= 60) throw err;
      console.log(`[init] waiting for Postgres (${err.code || err.message})`);
      await sleep(2000);
    }
  }
  await db.query(SCHEMA);
  console.log('[init] schema ready');
  const email = (e.WALINE_ADMIN_EMAIL || '').trim();
  const pass = e.WALINE_ADMIN_PASSWORD || '';
  const { rows } = await db.query(`SELECT count(*)::int AS n FROM ${P}users WHERE type = 'administrator'`);
  if (rows[0].n > 0) {
    console.log('[init] an administrator already exists, leaving accounts unchanged');
  } else if (!email || pass.length < 8) {
    console.log('[init] WARNING: no administrator yet and WALINE_ADMIN_EMAIL/WALINE_ADMIN_PASSWORD not set; the first account registered will become admin');
  } else {
    const hash = new PasswordHash().hashPassword(pass);
    const name = e.WALINE_ADMIN_NAME || 'Admin';
    const up = await db.query(`UPDATE ${P}users SET password=$1, type='administrator', updatedAt=CURRENT_TIMESTAMP WHERE email=$2`, [hash, email]);
    if (!up.rowCount) await db.query(`INSERT INTO ${P}users (display_name, email, password, type) VALUES ($1, $2, $3, 'administrator')`, [name, email, hash]);
    console.log(`[init] administrator created for ${email}`);
  }
  await db.end();
})().catch((err) => { console.error('[init] failed:', err.message); process.exit(1); });
