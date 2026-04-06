CREATE POLICY "Users can upload dump images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'dumps');

CREATE POLICY "Anyone can view dump images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'dumps');