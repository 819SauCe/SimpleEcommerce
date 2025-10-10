insert into roles (name, description) values
  ('platform_admin', 'Admin da plataforma'),
  ('store_owner', 'Dono da loja'),
  ('store_staff', 'Equipe da loja'),
  ('client', 'Cliente da loja')
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
select r.id, p.id
from roles r
join permissions p on
  (r.name = 'store_owner' and p.name in ('users.read','users.create','products.read','products.write','orders.read','orders.write'))
union all
select r.id, p.id
from roles r
join permissions p on
  (r.name = 'store_staff' and p.name in ('products.read','products.write','orders.read','orders.write'))
union all
select r.id, p.id
from roles r
join permissions p on
  (r.name = 'client' and p.name in ('products.read','orders.read'))
on conflict do nothing;
