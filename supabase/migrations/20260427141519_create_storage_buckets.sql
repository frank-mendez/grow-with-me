-- Private bucket for voice recordings
insert into storage.buckets (id, name, public)
values ('voice-recordings', 'voice-recordings', false)
on conflict (id) do nothing;

-- Only authenticated users can upload to their own folder
create policy "Users can upload their own voice recordings"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'voice-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own voice recordings"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'voice-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own voice recordings"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'voice-recordings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
