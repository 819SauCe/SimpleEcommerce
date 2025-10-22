create extension if not exists pgcrypto;

insert into roles (name, description) values
  ('platform_admin', 'Admin da plataforma'),
  ('store_owner',     'Dono da loja'),
  ('store_staff',     'Equipe da loja'),
  ('client',          'Cliente da loja')
on conflict (name) do nothing;

insert into permissions (name) values
  ('users.read'),
  ('users.create'),
  ('products.read'),
  ('products.write'),
  ('orders.read'),
  ('orders.write')
on conflict (name) do nothing;

insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'store_owner'),
       p.id
from permissions p
where p.name in ('users.read','users.create','products.read','products.write','orders.read','orders.write')
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'store_staff'),
       p.id
from permissions p
where p.name in ('products.read','products.write','orders.read','orders.write')
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'client'),
       p.id
from permissions p
where p.name in ('products.read','orders.read')
on conflict do nothing;

insert into stores (id, owner_id, name, handle, primary_domain)
values ('00000000-0000-0000-0000-000000000001'::uuid, null, 'Default Store', 'default', null)
on conflict (id) do update
set name = excluded.name,
    handle = excluded.handle,
    primary_domain = excluded.primary_domain;

update stores s
set owner_id = u.id
from users u
where s.id = '00000000-0000-0000-0000-000000000001'::uuid
  and u.email = 'admin@sua-plataforma.local'
  and (s.owner_id is distinct from u.id);
insert into user_roles (user_id, role_id, project_id)
select u.id,
       (select id from roles where name = 'store_owner'),
       '00000000-0000-0000-0000-000000000001'::uuid
from users u
where u.email = 'admin@sua-plataforma.local'
on conflict do nothing;
