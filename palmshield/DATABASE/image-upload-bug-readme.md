//image upload bug: esnure buckets are public, file path is correct and NAME is set to *evidence* or change to desired name in code. if issue still persists run:
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do update set public = true;

create policy "public evidence uploads"
on storage.objects
for insert
with check (bucket_id = 'evidence');

create policy "public evidence reads"
on storage.objects
for select
using (bucket_id = 'evidence');

create policy "public evidence updates"
on storage.objects
for update
using (bucket_id = 'evidence')
with check (bucket_id = 'evidence');
