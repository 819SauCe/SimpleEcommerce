create extension if not exists pgcrypto;
create extension if not exists moddatetime;

drop table if exists user_roles cascade;
drop table if exists role_permissions cascade;
drop table if exists permissions cascade;
drop table if exists roles cascade;
drop table if exists stores cascade;
drop table if exists users cascade;

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  first_name    text not null,
  last_name     text not null,
  password      text not null,
  cpf           text,
  cnpj          text,
  phone         text,
  user_image    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz
);

create table if not exists stores (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references users(id) on delete set null,
  name           text not null,
  handle         text not null unique,
  primary_domain text unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

create table if not exists roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create table if not exists permissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create table if not exists role_permissions (
  role_id       uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists user_roles (
  user_id    uuid not null references users(id) on delete cascade,
  role_id    uuid not null references roles(id) on delete cascade,
  project_id uuid not null references stores(id) on delete cascade,
  primary key (user_id, role_id, project_id)
);

create index if not exists idx_stores_owner_id           on stores(owner_id);
create index if not exists idx_user_roles_user_project   on user_roles(user_id, project_id);
create index if not exists idx_user_roles_project        on user_roles(project_id);
create index if not exists idx_role_permissions_role     on role_permissions(role_id);
create index if not exists idx_role_permissions_perm     on role_permissions(permission_id);

create trigger set_users_updated_at
before update on users
for each row execute procedure moddatetime (updated_at);

create trigger set_stores_updated_at
before update on stores
for each row execute procedure moddatetime (updated_at);

create trigger set_roles_updated_at
before update on roles
for each row execute procedure moddatetime (updated_at);

create trigger set_permissions_updated_at
before update on permissions
for each row execute procedure moddatetime (updated_at);
