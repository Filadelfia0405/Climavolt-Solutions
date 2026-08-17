-- Crear tabla de manuales
create table public.manuals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  brand text not null,
  category text not null,
  url text not null
);

-- Habilitar RLS
alter table public.manuals enable row level security;

-- Políticas de seguridad
-- Permitir lectura a todos los usuarios autenticados
create policy "Los usuarios autenticados pueden ver todos los manuales"
  on public.manuals for select
  to authenticated
  using (true);

-- Permitir inserción solo a usuarios autenticados, y que su user_id sea el suyo
create policy "Los usuarios pueden crear manuales"
  on public.manuals for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Permitir actualización/borrado solo de sus propios manuales
create policy "Los usuarios pueden actualizar sus propios manuales"
  on public.manuals for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios manuales"
  on public.manuals for delete
  to authenticated
  using (auth.uid() = user_id);
