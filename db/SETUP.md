# Database setup (teacher, once)

1. Get the project folder: on the project's GitHub page (once it is published), press **Code > Download ZIP**, then unzip the file.
2. Create a Supabase account and a new project at supabase.com. While creating the project, keep the default **Data API** option: the website needs it.
3. Open **SQL Editor**, paste all of `db/setup.sql`, and run it.
4. **Authentication > Users > Add user**: your email and a strong password, with the email marked as confirmed. Type the password only there and on the teacher page.
5. In the SQL editor, make that user the teacher (use your email):

   ```sql
   insert into public.teachers select id from auth.users where email = '<teacher email>';
   ```

   It should report 1 row.
6. In the Authentication sign-in settings, turn off **Allow new users to sign up**. Leave email sign-in itself on.
7. In the Data API settings, leave **Max rows** at 1000 (a lower value hides rows from the teacher page).
8. Create the two test groups. Codes are always upper-case.

   ```sql
   insert into public.groups (code, open) values ('TEST-01', true), ('CLOSED-01', false);
   ```

9. Fill in `site/js/config.js` with two values from your project, between the quotes:
   - `SUPABASE_URL`: the project URL, in the **Data API** settings (no `/` at the end).
   - `SUPABASE_KEY`: the **public** key (publishable, or legacy `anon`), under **Project Settings > API Keys**. Never use the secret or `service_role` key.
10. In **Table Editor**, open each of the four tables (`groups`, `submissions`, `marks`, `teachers`) and confirm it shows **RLS enabled**.
11. The teacher page is `teacher.html` under the website's address (`https://<site address>/teacher.html`). No page links to it, so bookmark it. Sign in with the user from step 4.
