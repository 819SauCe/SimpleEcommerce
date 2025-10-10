create table if not exists users (
  id serial primary key,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  password text not null,
  cpf text,
  user_image text,
  created_at timestamp default now()
);

create table if not exists stores (
  id serial primary key,
  owner_id int references users(id) on delete set null,
  name text not null,
  handle text not null unique,
  primary_domain text unique,
  created_at timestamp default now()
);

create table if not exists roles (
  id serial primary key,
  name text not null unique,
  description text
);

create table if not exists permissions (
  id serial primary key,
  name text not null unique
);

create table if not exists role_permissions (
  role_id int not null references roles(id) on delete cascade,
  permission_id int not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists user_roles (
  user_id int not null references users(id) on delete cascade,
  role_id int not null references roles(id) on delete cascade,
  project_id int not null references stores(id) on delete cascade,
  primary key (user_id, role_id, project_id)
);

create index if not exists idx_user_roles_user_project on user_roles(user_id, project_id);
create index if not exists idx_user_roles_project on user_roles(project_id);
